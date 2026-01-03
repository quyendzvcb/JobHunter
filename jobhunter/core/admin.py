from django.contrib import admin
from django.db.models import Sum, Count
from django.template.response import TemplateResponse
from django.urls import path
from core.models import Job, Application, Transaction, Location, Category, ServicePackage
from users.models import Recruiter, User
from django.db.models.functions import TruncMonth



class BaseAuditAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at', 'updated_at']

class JobAdmin(BaseAuditAdmin):
    list_display = ['title', 'company', 'category', 'salary_range', 'is_active', 'is_premium','views', 'created_at']
    list_filter = ['is_active', 'is_premium', 'category', 'location']
    readonly_fields = ['views']
    search_fields = ['title', 'recruiter__company_name']

    def company(self, obj):
        return obj.recruiter.company_name if obj.recruiter else "N/A"

    def salary_range(self, obj):
        if obj.salary_min and obj.salary_max:
            return f"{obj.salary_min:,.0f} - {obj.salary_max:,.0f}"
        return "Thỏa thuận"

class ApplicationAdmin(BaseAuditAdmin):
    list_display = ['job', 'applicant', 'status', 'created_at', 'is_active']
    list_filter = ['status', 'created_at']
    search_fields = ['job__title', 'applicant__user__email']

    def job(self, obj):
        return obj.job.title

    def applicant(self, obj):
        return f"{obj.applicant.user.last_name} {obj.applicant.user.first_name}"

class TransactionAdmin(BaseAuditAdmin):
    list_display = ['transaction_id', 'user_email', 'service_package', 'amount_vnd', 'status', 'payment_method']
    list_filter = ['status', 'payment_method']
    search_fields = ['transaction_id', 'user__email']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at', 'user', 'amount']

    def user_email(self, obj):
        return obj.user.email if obj.user else "-"

    def amount_vnd(self, obj):
        return f"{obj.amount:,.0f} VNĐ" if obj.amount is not None else "-"


class CategoryAdmin(BaseAuditAdmin):
    list_display = ['name']
    search_fields = ['name']

class LocationAdmin(BaseAuditAdmin):
    list_display = ['city']
    search_fields = ['city']

class ServicePackageAdmin(BaseAuditAdmin):
    list_display = ['name', 'price', 'duration_day', 'target_user']
    search_fields = ['name']

class JobHunterAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG QUẢN TRỊ TÌM KIẾM VIỆC LÀM'
    site_title = 'JobHunter Admin'
    index_title = 'Dashboard Thống kê & Quản lý'

    def get_urls(self):
        return [path('stats-view/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        total_recruiters = Recruiter.objects.count()
        pending_recruiters = Recruiter.objects.filter(is_verified=False).count()
        total_jobs = Job.objects.count()
        total_apps = Application.objects.count()

        revenue_data = Transaction.objects.filter(status='SUCCESS').aggregate(total=Sum('amount'))
        total_revenue = revenue_data['total'] or 0

        apps_by_month = Application.objects.annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')

        context = {
            'kpi': {
                'recruiters': total_recruiters,
                'pending': pending_recruiters,
                'jobs': total_jobs,
                'revenue': total_revenue,
                'apps': total_apps,
            },
            'apps_by_month': apps_by_month
        }

        return TemplateResponse(request, 'admin/stats.html', context)

admin_site = JobHunterAdminSite(name='jobhunter_admin')

admin_site.register(Job, JobAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(Transaction, TransactionAdmin)
admin_site.register(ServicePackage, ServicePackageAdmin)
admin_site.register(Location, LocationAdmin)
admin_site.register(Category, CategoryAdmin)

