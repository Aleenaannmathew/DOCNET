from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator

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

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
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
    video_call_link = models.URLField(blank=True, null=True)
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