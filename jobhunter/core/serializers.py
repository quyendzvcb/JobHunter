from rest_framework import serializers
from core.models import Category, Location, Job, Application, ServicePackage, Transaction
from users.serializers import RecruiterSerializer, ApplicantSerializer
from users.models import User
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'city']


class JobSerializer(serializers.ModelSerializer):
    recruiter_detail = RecruiterSerializer(source='recruiter', read_only=True)
    location_details = LocationSerializer(source='location', many=True, read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'deadline', 'is_premium',
            'salary_min', 'salary_max', 'is_active', 'created_at',
            'recruiter_detail', 'location_details',
            'category_detail'
        ]
        read_only_fields = ['created_at', 'is_active', 'is_premium']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['salary'] = f"{instance.salary_min:,.0f} - {instance.salary_max:,.0f} VNĐ" if instance.salary_min and instance.salary_max else "Thỏa thuận"
        return data


class JobDetailsSerializer(JobSerializer):
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), write_only=True, many=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)

    class Meta:
        model = JobSerializer.Meta.model
        fields = JobSerializer.Meta.fields + [
            'description', 'requirements', 'benefits',
            'years_of_experience', 'views',
            'category', 'location'
        ]
        read_only_fields = ['views', 'created_at', 'updated_at', 'is_active']


class JobLiteSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='recruiter.company_name', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'company_name', 'deadline']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['salary'] = f"{instance.salary_min:,.0f} - {instance.salary_max:,.0f} VNĐ"
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_detail = ApplicantSerializer(source='applicant', read_only=True)
    job_detail = JobLiteSerializer(source='job', read_only=True)

    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all(), write_only=True)
    cv_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Application
        fields = [
            'id', 'status', 'cover_letter', 'cv_url', 'recruiter_rating', 'created_at',
            'applicant_detail', 'job_detail',
            'job'
        ]
        read_only_fields = ['created_at','updated_at', 'status', 'recruiter_rating']

    def validate(self, attrs):
        request = self.context.get('request')

        if request and request.method == 'POST':
            job = attrs.get('job')
            if not hasattr(request.user, 'applicant'):
                raise serializers.ValidationError(
                    {"message": "Chỉ ứng viên mới có thể nộp đơn ứng tuyển."}
                )
            applicant = request.user.applicant
            if Application.objects.filter(applicant=applicant, job=job).exists():
                raise serializers.ValidationError(
                    {"message": "Bạn đã nộp hồ sơ cho công việc này rồi!"}
                )
        return attrs


class ApplicationEvaluateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'recruiter_rating']


class ServicePackageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = ['id', 'name', 'price', 'duration_day', 'description', 'target_user']


class ServicePackageSerializer(ServicePackageListSerializer):
    payment_methods = serializers.SerializerMethodField()

    class Meta:
        model = ServicePackage
        fields = ServicePackageListSerializer.Meta.fields + ['is_active', 'payment_methods']

    def get_payment_methods(self, obj):
        return [
            {
                "id": choice[0],
                "name": choice[1]
            }
            for choice in Transaction.PaymentMethod.choices
        ]


class TransactionSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    package_detail = ServicePackageListSerializer(source='service_package', read_only=True)

    service_package = serializers.PrimaryKeyRelatedField(queryset=ServicePackage.objects.filter(is_active=True), write_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'payment_method', 'transaction_id', 'status', 'created_at',
            'user_detail', 'package_detail','service_package'
        ]
        read_only_fields = ['status', 'created_at','amount', 'transaction_id', 'updated_at']

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user
        package = attrs.get('service_package')

        if package.target_user != user.role:
            raise serializers.ValidationError({
                'service-package': "Bạn không thể mua gói này!"
            })
        return attrs