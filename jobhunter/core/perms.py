from rest_framework import permissions
from users.models import User

class IsRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'RECRUITER'

class IsApplicant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'APPLICANT'

class IsVerifiedRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role == User.Role.RECRUITER and
                hasattr(request.user, 'recruiter') and
                request.user.recruiter.is_verified)