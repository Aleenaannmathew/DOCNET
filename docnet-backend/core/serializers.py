from rest_framework import serializers
from django.contrib.auth import get_user_model
from doctor.models import DoctorProfile, DoctorSlot, Wallet
from accounts.models import User, PatientProfile, Payment,Appointment


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
            'age', 'gender', 'experience', 'hospital','specialization',
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
            'hospital','specialization', 'languages', 'age', 'gender', 
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
        
class DoctorSlotSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileListSerializer(read_only=True)

    class Meta:
        model = DoctorSlot
        fields = ['id', 'date', 'start_time', 'duration', 'consultation_type', 'fee', 'doctor']

class PaymentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_status', 'timestamp', 'payment_method']

class AdminAppointmentListSerializer(serializers.ModelSerializer):
    slot = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()
    payment = PaymentSummarySerializer(read_only=True)
    completed_info = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'status', 'created_at', 'updated_at',
            'payment', 'slot', 'patient', 'completed_info'
        ]

    def get_slot(self, obj):
        if obj.payment and obj.payment.slot:
            return DoctorSlotSerializer(obj.payment.slot).data
        return None

    def get_patient(self, obj):
        if obj.payment and obj.payment.patient:
            return PatientDetailSerializer(obj.payment.patient).data
        return None

    def get_completed_info(self, obj):
        if obj.status == 'completed':
            return {
                'consultation_started_at': obj.created_at,
                'consultation_ended_at': obj.consultation_end_time,
                'doctor_name': obj.payment.slot.doctor.user.username if obj.payment and obj.payment.slot else None,
            }
        return None     
    
class PaymentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username')
    patient_id = serializers.CharField(source='patient.id')
    patient_avatar = serializers.CharField(source='patient.profile_image', allow_null=True)
    doctor_name = serializers.CharField(source='slot.doctor.user.username', allow_null=True)
    type = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='timestamp', format='%b %d, %Y')
    time = serializers.DateTimeField(source='timestamp', format='%I:%M %p')

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'amount', 'payment_status',
            'payment_method', 'date', 'time', 'type',
            'patient_name', 'patient_id', 'patient_avatar',
            'doctor_name'
        ]

    def get_type(self, obj):
        return "Consultation"   

class DoctorEarningsSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.username')
    specialization = serializers.CharField(source='doctor.specialization')
    total_earnings = serializers.DecimalField(source='balance', max_digits=10, decimal_places=2)

    class Meta:
        model = Wallet
        fields = ['doctor_name', 'specialization', 'total_earnings']      