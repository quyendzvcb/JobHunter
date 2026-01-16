from cloudinary.models import CloudinaryField
from django.db import models
from django.conf import settings
from ckeditor.fields import RichTextField


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Category(BaseModel):
    name = models.CharField("Tên ngành nghề", max_length=100)

    def __str__(self):
        return self.name


class Location(BaseModel):
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.city


class Job(BaseModel):
    title = models.CharField(max_length=100)
    description = RichTextField()
    requirements = RichTextField()
    benefits = RichTextField()
    salary_min = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    deadline = models.DateField()
    is_premium = models.BooleanField(default=False)
    years_of_experience = models.IntegerField(null=True, blank=True)
    views = models.IntegerField(default=0)

    recruiter = models.ForeignKey('users.Recruiter', related_name="jobs", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name="jobs", on_delete=models.SET_NULL, null=True)
    location = models.ManyToManyField(Location, related_name="jobs")

    def __str__(self):
        return self.title

class Application(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Chờ duyệt"
        ACCEPTED = "ACCEPTED", "Đã được chấp nhận"
        REJECTED = "REJECTED", "Từ chối"
        HIRED = "HIRED", "Đã tuyển"

    cv_url = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(choices=Status.choices, default=Status.PENDING, max_length=20)
    cover_letter = models.TextField(blank=True)
    recruiter_rating = models.FloatField(null=True, blank=True)

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey('users.Applicant', on_delete=models.CASCADE, related_name="applications")

    class Meta:
        unique_together = ("job", "applicant")

    def __str__(self):
        return f"{self.applicant} ứng tuyển {self.job}"

class ServicePackage(BaseModel):
    class TargetUser(models.TextChoices):
        RECRUITER = "RECRUITER", "Dành cho Nhà tuyển dụng"
        APPLICANT = "APPLICANT", "Dành cho Ứng viên"

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    duration_day = models.IntegerField()
    description = RichTextField()
    target_user = models.CharField(choices=TargetUser.choices, max_length=20, default=TargetUser.RECRUITER)

    def __str__(self):
        return self.name

class Transaction(BaseModel):
    class PaymentMethod(models.TextChoices):
        PAYPAL = "PAYPAL", "PayPal"
        STRIPE = "STRIPE", "Stripe"
        MOMO = "MOMO", "MoMo"
        ZALOPAY = "ZALOPAY", "ZaloPay"
        CASH = "CASH", "Tiền mặt"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Đang xử lý"
        SUCCESS = "SUCCESS", "Thành công"
        FAILED = "FAILED", "Thất bại"

    amount = models.DecimalField(max_digits=12, decimal_places=0, null=True)
    payment_method = models.CharField(choices=PaymentMethod.choices, max_length=20)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(choices=Status.choices, default=Status.PENDING, max_length=20)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    service_package = models.ForeignKey(ServicePackage, on_delete=models.SET_NULL, null=True)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"GD-{self.id} [{self.status}]"