import datetime
import json, hmac, hashlib, uuid, requests
from django.conf import settings
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
    pagination_class = paginators.JobPagination

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'retrieve']:
            return serializers.JobDetailsSerializer
        return serializers.JobSerializer

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params
        qs = Job.objects.filter(recruiter__user=self.request.user)
        q = params.get('q')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(recruiter__company_name__icontains=q))
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Job.objects.none()
        return qs

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
        if not ids:
            return Response({"error": "Không có dữ liệu để so sánh"}, status=400)
        try:
            id_list = [int(x.strip()) for x in ids.split(',') if x.strip().isdigit()]
        except Exception:
            return Response({"error": "ID không hợp lệ"}, status=400)
        id_list = list(set(id_list))
        if len(id_list) > 5:
            return Response({"error": "Chỉ được so sánh tối đa 5 công việc"}, status=400)
        elif len(id_list) < 2:
            return Response({"error": "Cần chọn ít nhất 2 công việc để so sánh"}, status=400)
        jobs = Job.objects.filter(id__in=id_list, is_active=True)\
                          .select_related('recruiter', 'category')\
                          .prefetch_related('location')
        if jobs.count() < 2:
            return Response(
                {"error": "Một số công việc đã ngừng tuyển hoặc bị xóa. Không đủ dữ liệu so sánh."},
                status=404
            )
        jobs_dict = {job.id: job for job in jobs}
        sorted_jobs = [jobs_dict[i] for i in id_list if i in jobs_dict]

        return Response(serializers.JobDetailsSerializer(sorted_jobs, many=True).data)

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
            return Application.objects.filter(job__recruiter__user=user).select_related('job', 'applicant__user').order_by('-applicant__is_premium', '-created_at')
        elif user.role == User.Role.APPLICANT:
            return Application.objects.filter(applicant__user=user).select_related('job', 'job__recruiter').order_by('-created_at')
        return Application.objects.none()

    @action(methods=['post'], detail=False, url_path='apply')
    def apply_job(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(applicant=request.user.applicant, cv_url=request.data.get('cv_url'))
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


class LocationViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.LocationSerializer
    queryset = Location.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.CategorySerializer
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]


class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=False, url_path='momo-pay')
    def create_momo_payment(self, request):
        try:
            # 1. Lấy thông tin từ Client (mua gói dịch vụ nào)
            service_package_id = request.data.get('service_package_id')
            if not service_package_id:
                return Response({"error": "Thiếu service_package_id"}, status=status.HTTP_400_BAD_REQUEST)

            service_package = ServicePackage.objects.get(id=service_package_id)
            amount = int(service_package.price)

            orderId = str(uuid.uuid4())
            requestId = str(uuid.uuid4())
            orderInfo = f"Thanh toan goi {service_package.name}"

            # Lấy config
            MOMO_CONFIG = settings.MOMO_CONFIG

            # 3. Tạo chữ ký HMAC SHA256
            raw_signature = (
                f"accessKey={MOMO_CONFIG['access_key']}"
                f"&amount={amount}"
                f"&extraData="
                f"&ipnUrl={MOMO_CONFIG['ipn_url']}"
                f"&orderId={orderId}"
                f"&orderInfo={orderInfo}"
                f"&partnerCode={MOMO_CONFIG['partner_code']}"
                f"&redirectUrl={MOMO_CONFIG['redirect_url']}"
                f"&requestId={requestId}"
                f"&requestType=captureWallet"
            )

            h = hmac.new(
                bytes(MOMO_CONFIG['secret_key'], 'ascii'),
                bytes(raw_signature, 'utf-8'),
                hashlib.sha256
            )
            signature = h.hexdigest()

            data = {
                'partnerCode': MOMO_CONFIG['partner_code'],
                'partnerName': "Job Hunter",
                'storeId': "JobHunterStore",
                'requestId': requestId,
                'amount': str(amount),
                'orderId': orderId,
                'orderInfo': orderInfo,
                'redirectUrl': MOMO_CONFIG['redirect_url'],
                'ipnUrl': MOMO_CONFIG['ipn_url'],
                'lang': 'vi',
                'extraData': "",
                'requestType': "captureWallet",
                'signature': signature
            }

            res = requests.post(MOMO_CONFIG['endpoint'], json=data)
            json_res = res.json()

            if str(json_res.get('resultCode')) == '0':
                Transaction.objects.create(
                    user=request.user,
                    service_package=service_package,
                    amount=amount,
                    payment_method=Transaction.PaymentMethod.MOMO,
                    transaction_id=orderId,
                    status=Transaction.Status.PENDING
                )

                return Response({'payUrl': json_res['payUrl']})
            else:
                return Response(
                    {'error': json_res.get('localMessage'), 'momo_code': json_res.get('errorCode')},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except ServicePackage.DoesNotExist:
            return Response({"error": "Không tìm thấy gói dịch vụ"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(methods=['post'], detail=False, url_path='momo-ipn', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def process_momo_ipn(self, request):
        data = request.data
        print("LOG IPN MOMO:", data)

        resultCode = str(data.get('resultCode'))
        orderId = data.get('orderId')


        check = (resultCode == '0')

        if check:
            try:
                transaction = Transaction.objects.get(transaction_id=orderId)

                if transaction.status == Transaction.Status.PENDING:
                    transaction.status = Transaction.Status.SUCCESS
                    transaction.save()

                    user = transaction.user
                    if user.role == User.Role.APPLICANT:
                        try:
                            applicant_profile = user.applicant
                            applicant_profile.is_premium = True
                            applicant_profile.save()

                            print(f"Đã kích hoạt Premium cho Applicant: {user.username}")
                        except Exception as e:
                            print(f"Lỗi: User {user.username} là APPLICANT nhưng không tìm thấy hồ sơ Applicant. {e}")

            except Transaction.DoesNotExist:
                print(f"Không tìm thấy transaction {orderId}")
            except Exception as e:
                print(f"Lỗi xử lý IPN: {e}")

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get'], detail=False, url_path='history')
    def transaction_history(self, request):
        history = Transaction.objects.filter(user=request.user).order_by('-created_at')
        return Response(serializers.TransactionSerializer(history, many=True).data)





