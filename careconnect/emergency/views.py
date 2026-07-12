from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from users.models import User
from users.permissions import IsResident, IsAdminOrSecurity
from .models import EmergencyContact
from .serializers import (
    EmergencyContactSerializer, SendContactOTPSerializer, VerifyContactOTPSerializer,
)


class IsOwnerResidentOrStaff(permissions.BasePermission):
    """Residents only see/manage their own contacts; Admin/Security can view any (read-only)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return user.role in (User.Role.RESIDENT, User.Role.ADMIN, User.Role.SECURITY)
        return user.role == User.Role.RESIDENT

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.resident == request.user or request.user.role in (User.Role.ADMIN, User.Role.SECURITY)
        return obj.resident == request.user


class EmergencyContactViewSet(viewsets.ModelViewSet):
    """
    Day 6: Full CRUD for a resident's Primary/Secondary Guardian and other
    Emergency Contacts, plus OTP-based verification actions.

    GET/POST   /api/emergency/contacts/
    GET/PATCH/DELETE /api/emergency/contacts/<id>/
    POST       /api/emergency/contacts/<id>/send-otp/    Body: {channel}
    POST       /api/emergency/contacts/<id>/verify-otp/  Body: {channel, code}
    """
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsOwnerResidentOrStaff]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        user = self.request.user
        qs = EmergencyContact.objects.select_related('resident', 'linked_user')
        if user.role == User.Role.RESIDENT:
            return qs.filter(resident=user)
        # Admin/Security can view all (e.g. for verification support), read-only
        resident_id = self.request.query_params.get('resident')
        return qs.filter(resident_id=resident_id) if resident_id else qs

    def perform_create(self, serializer):
        serializer.save(resident=self.request.user)

    @action(detail=True, methods=['post'], url_path='send-otp')
    def send_otp(self, request, pk=None):
        contact = self.get_object()
        serializer = SendContactOTPSerializer(data=request.data, context={'contact': contact})
        serializer.is_valid(raise_exception=True)
        otp = serializer.save()
        # Mocked: in Day 9 this triggers the real SMS/email notification service.
        return Response(
            {"message": f"OTP sent via {otp.channel.lower()}.", "debug_code": otp.code},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='verify-otp')
    def verify_otp(self, request, pk=None):
        contact = self.get_object()
        serializer = VerifyContactOTPSerializer(data=request.data, context={'contact': contact})
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data['otp']
        otp.is_used = True
        otp.save(update_fields=['is_used'])

        if otp.channel == otp.Channel.PHONE:
            contact.is_phone_verified = True
            contact.save(update_fields=['is_phone_verified'])
        else:
            contact.is_email_verified = True
            contact.save(update_fields=['is_email_verified'])

        return Response({"message": "Contact verified successfully."}, status=status.HTTP_200_OK)
