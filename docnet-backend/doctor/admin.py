from django.contrib import admin
from .models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('get_doctor_name', 'registration_id', 'hospital', 'experience', 'is_approved')
    list_filter = ('is_approved', 'gender')
    search_fields = ('user__username', 'user__email', 'registration_id', 'hospital')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.user.username}"
    get_doctor_name.short_description = 'Doctor Name'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Doctor Information', {
            'fields': ('registration_id', 'certificate', 'hospital', 'languages', 'experience')
        }),
        ('Personal Information', {
            'fields': ('age', 'gender')
        }),
        ('Status', {
            'fields': ('is_approved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
