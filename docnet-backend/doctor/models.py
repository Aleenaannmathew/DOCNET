from django.db import models
from datetime import timezone
from accounts.models import Payment
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

User = get_user_model()

class DoctorProfile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer not to say', 'Prefer not to say'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    registration_id = models.CharField(max_length=50, unique=True, db_index=True)
    certificate = models.FileField(upload_to='doctor_certificates/', blank=True, null=True)
    hospital = models.CharField(max_length=255, blank=True, null=True)
    languages = models.CharField(max_length=255, default='English')
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(21), MaxValueValidator(80)], null=True, blank=True
    )
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    experience = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], null=True, blank=True
    )
    location = models.CharField(max_length=255, blank=True, null=True)
    specialization = models.CharField(max_length=255, blank=True, null=True)
    prefer_24hr_consultation = models.BooleanField(default=False, null=True)
    is_approved = models.BooleanField(null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    emergency_status = models.BooleanField(default=False)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    class Meta:
        verbose_name = "Doctor Profile"
        verbose_name_plural = "Doctor Profiles"
        indexes = [
            models.Index(fields=['registration_id']),
            models.Index(fields=['is_approved']),
            models.Index(fields=['gender']),
            models.Index(fields=['experience']),
            
        ]
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.user.username}-{self.registration_id}")
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Dr. {self.user.username} - {self.registration_id}"  

class DoctorSlot(models.Model):
    CONSULTATION_TYPES = (
        ('video', 'Video Call'),
        ('chat', 'Online Chat'),
    )
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    duration = models.PositiveIntegerField(validators=[MinValueValidator(15), MaxValueValidator(200)])
    consultation_type = models.CharField(max_length=10, choices=CONSULTATION_TYPES)
    max_patients = models.DecimalField(max_digits=8, decimal_places=2)
    fee = models.DecimalField(max_digits=8, decimal_places=2, default=500.00)
    notes = models.TextField(blank=True, null=True)
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=255, blank=True)

    class Meta:
        unique_together = ['doctor', 'date', 'start_time'] 
        ordering = ['date', 'start_time']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.doctor.user.username}")
        super().save(*args,**kwargs)
    
    def __str__(self):
        return f"{self.doctor.user.username}'s slot on {self.date} at {self.start_time}"
    
    @property
    def is_available(self):
        return not self.is_booked and self.date >= timezone.now().date()


class Wallet(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f'{self.doctor.user.username} - Wallet'

class WalletHistory(models.Model):
    CREDIT = 'credit'
    DEBIT = 'debit'
    TRANSACTION_TYPES = [
        (CREDIT, 'Credit'),
        (DEBIT, 'Debit')
    ]     
    wallet = models.ForeignKey(Wallet, related_name='history', on_delete=models.CASCADE)
    updated_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=8, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    new_balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.wallet.doctor.user.username} - {self.type} - {self.amount}'
    
