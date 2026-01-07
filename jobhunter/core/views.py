import datetime
import uuid

from django.db.models.functions import TruncQuarter, TruncYear, TruncMonth
from rest_framework import viewsets, filters, generics, status
from core import perms, paginators
from core.models import Job, Application, ServicePackage, Transaction, Category, Location
from users.models import User
from rest_framework import permissions
from core import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg


class RecruiterJobViewSet(viewsets.ModelViewSet):
    permission_classes = [perms.IsVerifiedRecruiter]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'retrieve']:
            return serializers.JobDetailsSerializer
        return serializers.JobSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Job.objects.none()
        return Job.objects.filter(recruiter__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user.recruiter)

    @action(methods=['get'], detail=False, url_path='stats')
    def recruiter_stats(self, request):
        if request.user.role != 'RECRUITER':
            return Response({"error": "Chỉ dành cho nhà tuyển dụng"}, status=403)

        recruiter = request.user.recruiter
        period = request.query_params.get('period', 'month')
        year = request.query_params.get('year', datetime.datetime.now().year)

        jobs = Job.objects.filter(recruiter=recruiter, created_at__year=year).select_related('recruiter').prefetch_related('applications')

        if period == 'quarter':
            trunc_func = TruncQuarter('created_at')
        elif period == 'year':
            trunc_func = TruncYear('created_at')
        else:
            trunc_func = TruncMonth('created_at')

        stats = jobs.annotate(
            period_date=trunc_func
        ).values('period_date').annotate(
            total_applies=Count('applications', distinct=True),
            total_views=Sum('views'),
            avg_rating=Avg('applications__recruiter_rating')
        ).order_by('period_date')

        return Response({
            "chart_data": list(stats)
        })


class JobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Job.objects.select_related('recruiter', 'category').prefetch_related('location').filter(is_active=True)
    pagination_class = paginators.JobPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        q = params.get('q')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(recruiter__company_name__icontains=q))
        if params.get('category_id'):
            qs = qs.filter(category_id=params['category_id'])

        location_ids = params.getlist('location_id')

        if location_ids:
            qs = qs.filter(location__id__in=location_ids)

        if params.get('salary_min'):
            qs = qs.filter(salary_max__gte=int(params['salary_min']))

        ordering = params.get('ordering')
        if ordering == 'salary':
            qs = qs.order_by('-salary_max')
        else:
            qs = qs.order_by('-created_at')
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.JobSerializer
        return serializers.JobDetailsSerializer

    @action(methods=['get'], detail=False, url_path='compare')
    def compare_jobs(self, request):
        ids = request.query_params.get('ids', '')
        id_list = [int(x) for x in ids.split(',') if x.isdigit()]
        if len(id_list) > 5:
            return Response(
                {"error": "Chỉ được so sánh tối đa 5 công việc"},
                status=400
        )
        elif len(id_list) < 2:
            return Response(
                {"error": "Cần chọn ít nhất 2 công việc để so sánh"},
                status=400
            )
        jobs = Job.objects.filter(id__in=id_list)
        return Response(serializers.JobDetailsSerializer(jobs, many=True).data)


class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.ApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [perms.IsApplicant()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Job.objects.none()
        if user.role == User.Role.RECRUITER:
            return Application.objects.filter(job__recruiter__user=user).select_related('job', 'applicant__user')
        elif user.role == User.Role.APPLICANT:
            return Application.objects.filter(applicant__user=user).select_related('job', 'job__recruiter')
        return Application.objects.none()

    @action(methods=['post'], detail=False, url_path='apply')
    def apply_job(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(applicant=request.user.applicant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['patch'], detail=True, url_path='evaluate', permission_classes=[perms.IsVerifiedRecruiter])
    def evaluate_job(self, request, pk=None):
        app = self.get_object()
        serializer = serializers.ApplicationEvaluateSerializer(instance=app, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class ServicePackageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.ServicePackageListSerializer
        return serializers.ServicePackageSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Job.objects.none()
        return ServicePackage.objects.filter(
            is_active=True,
            target_user=self.request.user.role
        )

class PaymentViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=False, url_path='create-transaction')
    def create_transaction(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        package = serializer.validated_data['service_package']

        transaction_id = f"PAY-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        transaction = serializer.save(
            user=request.user,
            amount=package.price,
            transaction_id=transaction_id,
        )
        return Response(serializers.TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED
        )

    @action(methods=['get'], detail=False, url_path='history')
    def transaction_history(self, request):
        history = Transaction.objects.filter(user=request.user).order_by('-created_at')
        return Response(serializers.TransactionSerializer(history, many=True).data)


class LocationViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.LocationSerializer
    queryset = Location.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.CategorySerializer
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]



