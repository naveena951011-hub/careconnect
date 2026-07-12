from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EmergencyCategoryViewSet, SOSAlertViewSet, IncidentUpdateListCreateView

router = DefaultRouter()
router.register('categories', EmergencyCategoryViewSet, basename='emergency-category')
router.register('alerts', SOSAlertViewSet, basename='sos-alert')

urlpatterns = router.urls + [
    path('alerts/<int:alert_id>/updates/', IncidentUpdateListCreateView.as_view(), name='incident-updates'),
]
