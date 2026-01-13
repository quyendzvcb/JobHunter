from django.contrib import admin
from django.db.models import Sum, Count
from django.template.response import TemplateResponse
from django.urls import path
from core.models import Job, Application, Transaction, Location, Category, ServicePackage
from users.models import Recruiter, User, Applicant
from django.db.models.functions import TruncMonth
from django.utils import timezone

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
        return [path('stats-view/', self.admin_view(self.stats_view), name='stats_view')] + super().get_urls()

    def stats_view(self, request):
        current_year = timezone.now().year
        try:
            selected_year = int(request.GET.get('year', current_year))
        except ValueError:
            selected_year = current_year

        total_recruiters = Recruiter.objects.count()
        total_applicants = Applicant.objects.count()
        total_jobs = Job.objects.filter(created_at__year=selected_year).count()

        revenue_query = Transaction.objects.filter(status='SUCCESS', created_at__year=selected_year)
        total_revenue = revenue_query.aggregate(total=Sum('amount'))['total'] or 0
        revenue_formatted = "{:,.0f}".format(total_revenue)

        apps_data = self.get_monthly_data(
            Application.objects.filter(created_at__year=selected_year),
            count_field='id',
            is_sum=False
        )

        jobs_data = self.get_monthly_data(
            Job.objects.filter(created_at__year=selected_year),
            count_field='id',
            is_sum=False
        )

        revenue_data = self.get_monthly_data(
            revenue_query,
            count_field='amount',
            is_sum=True
        )

        chart_labels = [f"Tháng {i}" for i in range(1, 13)]

        context = {
            **self.each_context(request),
            'kpi': {
                'recruiters': total_recruiters,
                'applicants': total_applicants,
                'jobs': total_jobs,
                'revenue': revenue_formatted,
            },
            'selected_year': selected_year,
            'year_options': range(current_year, current_year - 5, -1),
            'chart_labels': chart_labels,

            # Truyền 3 bộ dữ liệu sang Template
            'chart_data_apps': apps_data,
            'chart_data_jobs': jobs_data,
            'chart_data_revenue': revenue_data,
        }

        return TemplateResponse(request, 'admin/stats.html', context)

    def get_monthly_data(self, queryset, count_field='id', is_sum=False):
        if is_sum:
            data = queryset.annotate(month=TruncMonth('created_at')).values('month').annotate(val=Sum(count_field)).order_by('month')
        else:
            data = queryset.annotate(month=TruncMonth('created_at')).values('month').annotate(val=Count(count_field)).order_by('month')

        result = []
        for i in range(1, 13):
            val = 0
            for item in data:
                if item['month'].month == i:
                    val = float(item['val'] or 0)
                    break
            result.append(val)
        return result

admin_site = JobHunterAdminSite(name='jobhunter_admin')

admin_site.register(Job, JobAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(Transaction, TransactionAdmin)
admin_site.register(ServicePackage, ServicePackageAdmin)
admin_site.register(Location, LocationAdmin)
admin_site.register(Category, CategoryAdmin)

