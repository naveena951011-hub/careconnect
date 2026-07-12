from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, permissions, status
from rest_framework.response import Response

from users.models import User
from users.permissions import IsAdmin, IsAdminOrSecurity, IsResident
from .models import Society, Block, Flat, ResidentMapping
from .serializers import (
    SocietySerializer, BlockSerializer, FlatSerializer,
    ResidentMappingRequestSerializer, ResidentMappingReviewSerializer,
    ResidentDirectoryEntrySerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone authenticated can view; only Admins can create/update/delete."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN


class SocietyViewSet(viewsets.ModelViewSet):
    """
    Day 4: CRUD for Society, with search/filter query params.
    GET /api/society/societies/?search=green+valley&city=Pune
    """
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'state', 'pincode']
    search_fields = ['name', 'address', 'city']


class BlockViewSet(viewsets.ModelViewSet):
    """Day 4: CRUD for Block/Tower. GET .../blocks/?society=1&search=Tower"""
    queryset = Block.objects.select_related('society').all()
    serializer_class = BlockSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['society']
    search_fields = ['name']


class FlatViewSet(viewsets.ModelViewSet):
    """Day 4: CRUD for Flat. GET .../flats/?block=1&search=302"""
    queryset = Flat.objects.select_related('block', 'block__society').all()
    serializer_class = FlatSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['block', 'block__society']
    search_fields = ['flat_number']


class ResidentMappingRequestView(generics.CreateAPIView):
    """
    Day 5: Mobile app onboarding — resident selects their society/flat.
    POST /api/society/resident-mapping/
    """
    serializer_class = ResidentMappingRequestSerializer
    permission_classes = [IsResident]

    def get_serializer_context(self):
        return {'request': self.request}


class ResidentApprovalDashboardView(generics.ListAPIView):
    """
    Day 5: Admin/Security dashboard listing pending resident-flat mappings.
    GET /api/society/resident-approvals/?status=PENDING&search=john
    """
    serializer_class = ResidentDirectoryEntrySerializer
    permission_classes = [IsAdminOrSecurity]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'society']
    search_fields = ['resident__username', 'resident__first_name', 'flat__flat_number']

    def get_queryset(self):
        return ResidentMapping.objects.select_related(
            'resident', 'society', 'block', 'flat'
        ).all()


class ResidentMappingReviewView(generics.UpdateAPIView):
    """
    Day 5: Admin/Security approves or rejects a specific mapping.
    PATCH /api/society/resident-approvals/<id>/review/  Body: {status, rejection_reason}
    """
    queryset = ResidentMapping.objects.all()
    serializer_class = ResidentMappingReviewSerializer
    permission_classes = [IsAdminOrSecurity]

    def perform_update(self, serializer):
        mapping = serializer.save(reviewed_by=self.request.user, reviewed_at=timezone.now())
        # Keep the User.approval_status in sync (used by IsApprovedUser permission)
        resident = mapping.resident
        resident.approval_status = mapping.status
        resident.save(update_fields=['approval_status'])


class ResidentDirectoryView(generics.ListAPIView):
    """
    Day 5: Searchable resident directory (approved residents only).
    GET /api/society/resident-directory/?search=302&society=1
    """
    serializer_class = ResidentDirectoryEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['society', 'block']
    search_fields = ['resident__username', 'resident__first_name', 'flat__flat_number']

    def get_queryset(self):
        return ResidentMapping.objects.filter(
            status=ResidentMapping.Status.APPROVED
        ).select_related('resident', 'society', 'block', 'flat')
