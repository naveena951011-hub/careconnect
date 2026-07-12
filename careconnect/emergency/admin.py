from django.contrib import admin
from .models import EmergencyContact, ContactOTPVerification


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'resident', 'contact_type', 'phone_number', 'is_phone_verified', 'is_email_verified']
    list_filter = ['contact_type', 'is_phone_verified', 'is_email_verified']
    search_fields = ['name', 'phone_number', 'email', 'resident__username']


admin.site.register(ContactOTPVerification)
