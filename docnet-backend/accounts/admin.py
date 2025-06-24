from django.contrib import admin
from .models import User, PatientProfile, Payment,Appointment,EmergencyPayment

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'is_verified')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('role', 'is_verified')
admin.site.register(PatientProfile)
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_username', 'amount', 'payment_status', 'payment_method', 'timestamp')
    list_filter = ('payment_status', 'payment_method', 'timestamp')
    search_fields = ('patient__username', 'payment_id', 'razorpay_payment_id')

    def patient_username(self, obj):
        return obj.patient.username
    patient_username.short_description = 'Patient Username'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment_patient_username', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('payment__patient__username',)

    def payment_patient_username(self, obj):
        return obj.payment.patient.username if obj.payment else 'N/A'
    payment_patient_username.short_description = 'Patient Username'

@admin.register(EmergencyPayment)
class EmergencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'consultation_start_time','consultation_end_time','reason')
