from django.contrib.auth.models import AbstractUser
from django.db import models
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
    google_id = models.CharField(max_length=100, blank=True, null=True)
   
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
    

   
