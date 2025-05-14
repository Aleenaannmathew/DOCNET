from django.contrib import admin
from .models import DoctorProfile

admin.site.register(DoctorProfile)

class DoctorProfileAdmin(admin.ModelAdmin):
    list_display=['user','is_approved']
    list_filter=['is_approved']
    actions=['approve_doctors']


    def approve_doctors(self, request, queryset):
        queryset.update(is_approved = True)