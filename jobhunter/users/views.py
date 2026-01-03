from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, parsers, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from users.models import Recruiter, Applicant, User
from users import serializers
from django.db import transaction


class UserViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = User.objects.select_related('recruiter', 'applicant').filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['register_applicant', 'register_recruiter']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['post'], detail=False, url_path='register/applicant')
    @transaction.atomic
    def register_applicant(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(role=User.Role.APPLICANT)

        applicant_serializer = serializers.ApplicantSerializer(data=request.data)
        applicant_serializer.is_valid(raise_exception=True)
        applicant_serializer.save(user=user)

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=False, url_path='register/recruiter')
    @transaction.atomic
    def register_recruiter(self, request):
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(role=User.Role.RECRUITER)

        recruiter_serializer = serializers.RecruiterSerializer(data=request.data)
        recruiter_serializer.is_valid(raise_exception=True)
        recruiter_serializer.save(user=user)

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(methods=['get', 'patch'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        user = self.request.user
        if request.method == 'PATCH':
            user_serializer = self.get_serializer(user, data=request.data, partial=True)
            user_serializer.is_valid(raise_exception=True)
            current_user = user_serializer.save()

            if user.role == User.Role.APPLICANT and hasattr(user, 'applicant'):
                applicant_serializer = serializers.ApplicantSerializer(user.applicant, data=request.data)
                applicant_serializer.is_valid(raise_exception=True)
                applicant_serializer.save(user=current_user)
            elif user.role == User.Role.RECRUITER and hasattr(user, 'recruiter'):
                recruiter_serializer = serializers.RecruiterSerializer(user.recruiter, data=request.data)
                recruiter_serializer.is_valid(raise_exception=True)
                recruiter_serializer.save(user=current_user)

        return Response(serializers.UserSerializer(user).data)
