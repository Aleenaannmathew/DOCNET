from django.contrib import admin
from .models import User, PatientProfile, Payment,Appointment,EmergencyPayment,ChatRoom,Message,MedicalRecord,Notification,DoctorReview

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


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'doctor', 'patient', 'created_at', 'is_active')
    list_filter = ('created_at',)
    search_fields = ('doctor__username', 'patient__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'content_snippet', 'file', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('sender__username', 'room__doctor__username', 'room__patient__username', 'content')

    def content_snippet(self, obj):
        return (obj.content[:50] + '...') if obj.content and len(obj.content) > 50 else obj.content
    content_snippet.short_description = 'Content'

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'patient', 'doctor', 'follow_up_date', 'created_at')
    search_fields = ('appointment__id', 'patient__username', 'doctor__username', 'diagnosis', 'prescription')
    list_filter = ('doctor', 'patient', 'follow_up_date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['appointment', 'patient', 'doctor']

    fieldsets = (
        ('Basic Information', {
            'fields': ('appointment', 'patient', 'doctor')
        }),
        ('Medical Details', {
            'fields': ('notes', 'diagnosis', 'prescription', 'follow_up_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )    

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('sender__username', 'receiver__username', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    # Optional: Show sender and receiver in a readable way
    def sender_username(self, obj):
        return obj.sender.username

    def receiver_username(self, obj):
        return obj.receiver.username

    sender_username.short_description = 'Sender'
    receiver_username.short_description = 'Receiver'


@admin.register(DoctorReview)
class DoctorReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'doctor', 'patient', 'rating', 'created_at')  # Columns to display
    list_filter = ('rating', 'created_at', 'doctor')  # Filters on the right side
    search_fields = ('doctor__user__username', 'patient__username', 'comment')  # Search box
    ordering = ('-created_at',)  # Default ordering (newest first)
    readonly_fields = ('created_at',)