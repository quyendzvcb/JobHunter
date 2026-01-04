from core.admin import admin_site
from django.contrib import admin
from django.contrib.admin.templatetags.admin_list import admin_actions
from django.utils.html import format_html
from users.models import Applicant, User, Recruiter


class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'groups']
    search_fields = ['username', 'email']


class RecruiterAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'get_email', 'is_verified', 'company_location', 'joined_date']
    list_filter = ['is_verified']
    readonly_fields = ['user']
    search_fields = ['company_name', 'user__email', 'user__username']

    def get_email(self, obj):
        return obj.user.email

    def joined_date(self, obj):
        return obj.user.date_joined

class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user_email', 'gender', 'dob', 'is_premium', ]
    list_filter = ['is_premium', 'gender']
    readonly_fields = ['user']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']

    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def user_email(self, obj):
        return obj.user.email


admin_site.register(User, UserAdmin)
admin_site.register(Applicant, ApplicantAdmin)
admin_site.register(Recruiter, RecruiterAdmin)