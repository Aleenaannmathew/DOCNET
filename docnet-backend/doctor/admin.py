from django.contrib import admin
from .models import DoctorProfile,DoctorSlot, Wallet, WalletHistory

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('get_doctor_name', 'registration_id', 'hospital', 'experience', 'is_approved','prefer_24hr_consultation','emergency_status')
    list_filter = ('is_approved', 'gender')
    search_fields = ('user__username', 'user__email', 'registration_id', 'hospital','prefer_24hr_consultation','emergency_status')
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
            'fields': ('is_approved','prefer_24hr_consultation''emergency_status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DoctorSlot)
class DoctorSlotAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'start_time', 'consultation_type', 'max_patients', 'is_booked')
    list_filter = ('doctor', 'consultation_type', 'is_booked', 'date')
    search_fields = ('doctor__user__username', 'notes')
    ordering = ('-date', 'start_time')

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('doctor_username', 'balance')
    search_fields = ('doctor__user__username',)

    def doctor_username(self, obj):
        return obj.doctor.user.username
    doctor_username.short_description = 'Doctor Username'


@admin.register(WalletHistory)
class WalletHistoryAdmin(admin.ModelAdmin):
    list_display = ('wallet_doctor_username', 'type', 'amount', 'new_balance', 'updated_date')
    list_filter = ('type', 'updated_date')
    search_fields = ('wallet__doctor__user__username',)

    def wallet_doctor_username(self, obj):
        return obj.wallet.doctor.user.username
    wallet_doctor_username.short_description = 'Doctor Username'