from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, permissions, filters

from users.models import User
from users.permissions import IsResident
from .models import EmergencyCategory, SOSAlert, IncidentUpdate
from .serializers import (
    EmergencyCategorySerializer, SOSAlertCreateSerializer,
    SOSAlertDetailSerializer, IncidentUpdateSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN


class EmergencyCategoryViewSet(viewsets.ModelViewSet):
    """
    Day 7: Emergency category master-data — powers the mobile app's category
    selection screen. GET is open to any authenticated role; only Admin can
    add/edit/deactivate categories.
    """
    queryset = EmergencyCategory.objects.filter(is_active=True)
    serializer_class = EmergencyCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.role == User.Role.ADMIN:
            return EmergencyCategory.objects.all()
        return EmergencyCategory.objects.filter(is_active=True)


class SOSAlertViewSet(viewsets.ModelViewSet):
    """
    Day 7-8: The One-Tap SOS button's API.
    POST /api/sos/alerts/          -> trigger a new SOS (category, message, lat/long)
    GET  /api/sos/alerts/          -> Resident: own alerts. Admin/Security/Volunteer: all alerts.
    GET  /api/sos/alerts/<id>/     -> alert detail with reverse-geocoded address
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['resident__username', 'address']

    def get_serializer_class(self):
        if self.action == 'create':
            return SOSAlertCreateSerializer
        return SOSAlertDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsResident()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = SOSAlert.objects.select_related('resident', 'category')
        if user.role == User.Role.RESIDENT:
            return qs.filter(resident=user)
        # Admin / Security / Volunteer / Guardian can see all alerts (Milestone 2
        # will scope this further by society/proximity via the routing logic).
        return qs


class IncidentUpdateListCreateView(generics.ListCreateAPIView):
    """
    Day 8: Attach a text/voice message to an existing SOS, and list the
    update trail for it.
    GET/POST /api/sos/alerts/<alert_id>/updates/
    """
    serializer_class = IncidentUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IncidentUpdate.objects.filter(alert_id=self.kwargs['alert_id']).select_related('author')

    def perform_create(self, serializer):
        serializer.save(alert_id=self.kwargs['alert_id'], author=self.request.user)
