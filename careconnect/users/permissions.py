from rest_framework.permissions import BasePermission
from .models import User


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsSecurity(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.SECURITY)


class IsAdminOrSecurity(BasePermission):
    """Used for resident approval workflow (Day 5) — either role can approve residents."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (User.Role.ADMIN, User.Role.SECURITY)
        )


class IsResident(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.RESIDENT)


class IsApprovedUser(BasePermission):
    """Blocks pending/rejected residents from using resident-only features until approved."""
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role != User.Role.RESIDENT:
            return True
        return user.approval_status == User.ApprovalStatus.APPROVED


class IsOwnerOrAdmin(BasePermission):
    """Object-level: only the owning user or an admin can view/edit."""
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, 'user', obj)
        return request.user.role == User.Role.ADMIN or owner == request.user
