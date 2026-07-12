from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

schema_view = get_schema_view(
    openapi.Info(
        title="CareConnect API",
        default_version='v1',
        description="Community Emergency Response & Assistance Network",
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/', include('users.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Feature apps
    path('api/society/', include('society.urls')),
    path('api/emergency/', include('emergency.urls')),
    path('api/sos/', include('sos.urls')),

    # API docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
