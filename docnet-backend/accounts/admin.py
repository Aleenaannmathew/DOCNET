from django.contrib import admin
from .models import User, PatientProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'is_verified')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('role', 'is_verified')
admin.site.register(PatientProfile)

# Register your models here.
