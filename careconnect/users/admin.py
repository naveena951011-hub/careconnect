from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, ResidentProfile, GuardianProfile, VolunteerProfile,
    SecurityProfile, OTPVerification,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'phone_number', 'role', 'approval_status', 'is_active']
    list_filter = ['role', 'approval_status', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('CareConnect Info', {
            'fields': ('role', 'phone_number', 'is_phone_verified', 'is_email_verified', 'approval_status')
        }),
    )


admin.site.register(ResidentProfile)
admin.site.register(GuardianProfile)
admin.site.register(VolunteerProfile)
admin.site.register(SecurityProfile)
admin.site.register(OTPVerification)
