from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    SocietyViewSet, BlockViewSet, FlatViewSet,
    ResidentMappingRequestView, ResidentApprovalDashboardView,
    ResidentMappingReviewView, ResidentDirectoryView,
)

router = DefaultRouter()
router.register('societies', SocietyViewSet, basename='society')
router.register('blocks', BlockViewSet, basename='block')
router.register('flats', FlatViewSet, basename='flat')

urlpatterns = router.urls + [
    # Day 5: resident mapping / approval workflow / directory
    path('resident-mapping/', ResidentMappingRequestView.as_view(), name='resident-mapping-request'),
    path('resident-approvals/', ResidentApprovalDashboardView.as_view(), name='resident-approval-dashboard'),
    path('resident-approvals/<int:pk>/review/', ResidentMappingReviewView.as_view(), name='resident-mapping-review'),
    path('resident-directory/', ResidentDirectoryView.as_view(), name='resident-directory'),
]
