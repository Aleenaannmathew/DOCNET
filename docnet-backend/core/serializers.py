from rest_framework import serializers
from django.contrib.auth import get_user_model
from doctor.models import DoctorProfile   
from accounts.models import User, PatientProfile

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_superuser', 'role']
        read_only_fields = ['id', 'is_superuser']

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class DoctorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_image', 'is_active']

class DoctorProfileListSerializer(serializers.ModelSerializer):
    user = DoctorUserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'name', 'email', 'registration_id', 
            'age', 'gender', 'experience', 'hospital',
            'is_approved', 'is_active'
        ]
    
    def get_name(self, obj):
      
        return f"Dr. {obj.user.get_full_name() or obj.user.username}"
    
    def get_email(self, obj):
        return obj.user.email
    
    def get_is_active(self, obj):
        return obj.user.is_active

class DoctorProfileDetailSerializer(serializers.ModelSerializer):
    user = DoctorUserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'name', 'registration_id', 
            'hospital', 'languages', 'age', 'gender', 
            'experience', 'is_approved', 'created_at', 'updated_at'
        ]
    
    def get_name(self, obj):
        return f"Dr. {obj.user.get_full_name() or obj.user.username}"    


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['age', 'blood_group', 'height', 'weight', 'allergies', 
                 'chronic_conditions', 'emergency_contact', 'emergency_contact_name', 'gender']
        
  
    gender = serializers.SerializerMethodField()
    
    def get_gender(self, obj):
    
        return "Not specified"

class PatientListSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'date_joined', 'is_active', 
                 'is_verified', 'profile_image', 'patient_profile']
    
    def get_patient_profile(self, obj):
        try:
            profile = obj.patientprofile
            return {
                'age': profile.age,
                'blood_group': profile.blood_group,
                'gender': 'Not specified' 
            }
        except PatientProfile.DoesNotExist:
            return None

class PatientDetailSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'date_joined', 'is_active',
                 'is_verified', 'profile_image', 'patient_profile', 'last_login']
    
    def get_patient_profile(self, obj):
        try:
            profile = PatientProfileSerializer(obj.patientprofile).data
            return profile
        except PatientProfile.DoesNotExist:
            return None    