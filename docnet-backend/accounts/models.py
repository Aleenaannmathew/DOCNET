from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from datetime import timedelta
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class User(AbstractUser):
    ROLE_CHOICES = (
        ('doctor','Doctor'),
        ('patient','Patient'),
        ('admin','Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, db_index=True)
    is_verified = models.BooleanField(default=False)
    profile_image = models.URLField(max_length=500, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True,unique=True, validators=[RegexValidator(r'^[0-9]{10,15}$')], db_index=True)
   
   
    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.username} ({self.role})"
    
  

class OTPVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    purpose = models.CharField(max_length=50, default='password_reset')
    
    def __str__(self):
        return f"OTP for {self.user.username}"
    

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_index=True)
    age = models.IntegerField(null=True, blank=True, db_index=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True, db_index=True)
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    allergies = models.TextField(blank=True, help_text="Known allergies")
    chronic_conditions = models.TextField(blank=True, help_text="Any chronic health conditions")
    emergency_contact = models.CharField(max_length=15, blank=True, null=True, db_index=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

    class Meta:
        indexes = [
            models.Index(fields=['blood_group']),
            models.Index(fields=['age']),
            models.Index(fields=['emergency_contact']),
        ]

    
class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    slot = models.ForeignKey('doctor.DoctorSlot', on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True) 
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True) 
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['payment_status']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['payment_id']),
        ]

    def __str__(self):
        return f"Payment #{self.id} - {self.patient.username} - {self.payment_status}"
    
class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )      
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    reason = models.CharField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notification_sent = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    @property
    def consultation_end_time(self):
        return self.created_at + timedelta(minutes=30)
    
    def __str__(self):
        return f"Appointment #{self.id} - {self.payment.patient.username} with slot {self.payment.slot}"
   
class EmergencyPayment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    doctor = models.ForeignKey('doctor.DoctorProfile', on_delete=models.CASCADE, related_name='emergency_payments')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=800.00)  # Higher fee for emergency
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    consultation_started = models.BooleanField(default=False)
    consultation_start_time = models.DateTimeField(null=True, blank=True)
    consultation_end_time = models.DateTimeField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['payment_status']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['payment_id']),
            models.Index(fields=['doctor', 'patient']),
        ]

    def __str__(self):
        return f"Emergency Payment #{self.id} - {self.patient.username} to Dr. {self.doctor.user.username}"

    def start_consultation(self):
        """Mark consultation as started"""
        self.consultation_started = True
        self.consultation_start_time = timezone.now()
        self.save()

    def end_consultation(self):
        """Mark consultation as ended"""
        self.consultation_end_time = timezone.now()
        self.save()

class ChatRoom(models.Model):
    doctor = models.ForeignKey(User, related_name='chat_doctor', on_delete=models.CASCADE)
    patient = models.ForeignKey(User, related_name='chat_patient', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatRoom: {self.doctor.username} & {self.patient.username}"

    @property
    def is_active(self):
        return timezone.now() <= self.created_at + timezone.timedelta(days=7)

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='chat_uploads/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender.username} at {self.timestamp}"        
    

class MedicalRecord(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_record')
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'patient'},
        related_name='patient_medical_records' 
    )
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'doctor'},
        related_name='doctor_medical_records'  
    )

    notes = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    follow_up_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['patient']),
            models.Index(fields=['doctor']),
        ]
        verbose_name = "Medical Record"
        verbose_name_plural = "Medical Records"

    def __str__(self):
        return f"Medical Record - Appointment #{self.appointment.id}"


class Notification(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_notifications')
    receiver = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    NOTIFICATION_TYPES = (
        ('consultation', 'Consultation'),
        ('emergency', 'Emergency'),
        ('chat_activated', 'Chat Activated'),
        ('video_activated', 'Video Activated'),
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='consultation')

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']