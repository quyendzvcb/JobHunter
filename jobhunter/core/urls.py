from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views

r = DefaultRouter()
r.register('recruiter/jobs', views.RecruiterJobViewSet, basename='recruiter-jobs')
r.register('jobs', views.JobViewSet, basename='jobs')
r.register('applications', views.ApplicationViewSet, basename='applications')
r.register('packages', views.ServicePackageViewSet, basename='packages')
r.register('payment', views.PaymentViewSet, basename='payment')
r.register('locations', views.LocationViewSet, basename='locations')
r.register('categories', views.CategoryViewSet, basename='categories')

urlpatterns = [
    path('', include(r.urls)),
]