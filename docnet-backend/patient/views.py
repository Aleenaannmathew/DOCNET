from django.contrib.auth.models import AbstractUser
from django.db import models
from accounts.models import User

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    age = models.IntegerField(null=True)
    medical_history = models.TextField(blank=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    allergies = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Patient Profile: {self.user.username}"