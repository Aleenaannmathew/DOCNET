from django.contrib import admin
from .models import SiteSetting

# Register your models here.
@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
    list_editable = ('value',)