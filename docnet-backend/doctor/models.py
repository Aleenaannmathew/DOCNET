from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

User = get_user_model()

class DoctorProfile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    registration_id = models.CharField(max_length=50, unique=True, db_index=True)
    certificate = models.FileField(upload_to='doctor_certificates/', blank=True, null=True)
    hospital = models.CharField(max_length=255, blank=True, null=True)
    languages = models.CharField(max_length=255, default='English')
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(21), MaxValueValidator(80)],null=True
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    experience = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], null=True
    )
    is_approved = models.BooleanField(null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    class Meta:
        verbose_name = "Doctor Profile"
        verbose_name_plural = "Doctor Profiles"
        indexes = [
            models.Index(fields=['registration_id']),
            models.Index(fields=['is_approved']),
            models.Index(fields=['gender']),
            models.Index(fields=['experience']),
        ]
    
    def __str__(self):
        return f"Dr. {self.user.username} - {self.registration_id}"