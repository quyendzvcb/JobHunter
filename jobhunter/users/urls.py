from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users import views

r = DefaultRouter()
r.register('users', views.UserViewSet, basename='users')

urlpatterns = [
    path('', include(r.urls)),
]