from django.contrib import admin
from .models import Society, Block, Flat, ResidentMapping


@admin.register(Society)
class SocietyAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'pincode']
    search_fields = ['name', 'city', 'pincode']


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ['name', 'society', 'total_floors']
    list_filter = ['society']


@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ['flat_number', 'block', 'floor']
    list_filter = ['block__society', 'block']
    search_fields = ['flat_number']


@admin.register(ResidentMapping)
class ResidentMappingAdmin(admin.ModelAdmin):
    list_display = ['resident', 'society', 'block', 'flat', 'status', 'requested_at']
    list_filter = ['status', 'society']
    search_fields = ['resident__username', 'flat__flat_number']
