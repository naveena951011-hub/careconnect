from django.contrib import admin
from .models import EmergencyCategory, SOSAlert, IncidentUpdate


@admin.register(EmergencyCategory)
class EmergencyCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'display_order']
    list_filter = ['is_active']


@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'resident', 'category', 'status', 'address', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['resident__username', 'address']


@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    list_display = ['alert', 'author', 'source_type', 'created_at']
