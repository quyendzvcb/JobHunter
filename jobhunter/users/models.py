from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField
from datetime import date

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Quản trị viên"
        RECRUITER = "RECRUITER", "Nhà tuyển dụng"
        APPLICANT = "APPLICANT", "Ứng viên"

    first_name = models.CharField(("first name"), max_length=150, blank=False, null=False)
    last_name = models.CharField(("last name"), max_length=150, blank=False,  null=False)
    email = models.EmailField("email address", unique=True, null=False, blank=False)
    avatar = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(choices=Role.choices, default=Role.APPLICANT, max_length=20)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


class Recruiter(models.Model):
    company_name = models.CharField(max_length=100, unique=True)
    company_location = models.CharField(max_length=100)
    logo = models.CharField(max_length=255, null=True, blank=True)
    webURL = models.URLField()
    is_verified = models.BooleanField(default=False)

    user = models.OneToOneField(User, related_name="recruiter", on_delete=models.CASCADE, null=False)

    def __str__(self):
        return self.company_name


class Applicant(models.Model):
    class Gender(models.TextChoices):
        MALE = "MALE", "Nam"
        FEMALE = "FEMALE", "Nữ"
        ANOTHER = "OTHER", "Khác"

    dob = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=100)
    gender = models.CharField(choices=Gender.choices, default="", max_length=20)
    phone_number = models.CharField(max_length=20)
    is_premium = models.BooleanField(default=False)

    user = models.OneToOneField(User, related_name="applicant", on_delete=models.CASCADE, null=False)

    @property
    def age(self):
        if self.dob:
            today = date.today()
            return today.year - self.dob.year - (
                    (today.month, today.day) < (self.dob.month, self.dob.day)
            )
        return None

    def __str__(self):
        return self.user.username

