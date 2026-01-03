from rest_framework import serializers
from users.models import Recruiter, Applicant, User


class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = ['company_name', 'company_location', 'logo', 'webURL', 'is_verified']
        read_only_fields = ['is_verified']


class ApplicantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Applicant
        fields = ['dob', 'address', 'gender', 'phone_number', 'is_premium', 'age', 'full_name']
        read_only_fields = ['is_premium', 'age']

    def get_full_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return ""


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    recruiter = RecruiterSerializer(read_only=True)
    applicant = ApplicantSerializer(read_only=True)

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(data['password'])
        user.save()
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'avatar', 'role', 'recruiter', 'applicant']
        read_only_fields = ['is_verified', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        if self.instance:
            if self.instance.email != value:
                raise serializers.ValidationError("Email không được phép thay đổi sau khi đã đăng ký.")
            return value

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email đã được sử dụng"
            )
        return value
