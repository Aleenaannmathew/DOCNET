from rest_framework import serializers
from .models import DoctorProfile, DoctorSlot, Wallet, WalletHistory
from django.db import transaction
import cloudinary
from datetime import date
import cloudinary.uploader
from accounts.models import Appointment, PatientProfile
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

User = get_user_model()




cloudinary.config(
    cloud_name='ds9y1cj9u',
    api_key='999752882965587',
    api_secret='Hi9PbuFPRZ92UNjC8mpPtkg3ygw'
)
def cloudinary_upload(image_file):
    if not image_file:
        return None
        
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder="profile_images", 
            resource_type="image"
        )
        return result
    except Exception as e:
        print(f"Cloudinary upload error: {str(e)}")
        return None
    

class DoctorRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(
        max_length = 15,
        validators = [RegexValidator(r'^[0-9]{10,15}$', message='Phone number must be 10-15 digits only')]
    )
    password = serializers.CharField(write_only=True, style = {'input_type':'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type':'password'})

    registration_id = serializers.CharField(max_length=50)
    hospital = serializers.CharField(max_length=255, required=False, allow_blank=True)
    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    languages = serializers.CharField(max_length=255, default='English')
    age = serializers.IntegerField(
        validators=[MinValueValidator(21), MaxValueValidator(80)]
    )
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'])
    experience = serializers.IntegerField(
        validators=[MinValueValidator(0)]
    )
    prefer_24hr_consultation = serializers.BooleanField(required=False, default=False)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value
    
    def validate_registration_id(self, value):
        if DoctorProfile.objects.filter(registration_id=value).exists():
            raise serializers.ValidationError("Registration ID already exists")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return data
    
    @transaction.atomic
    def create(self, validated_data):
       
        validated_data.pop('confirm_password', None)
        
        
        doctor_data = {
            'registration_id': validated_data.pop('registration_id'),
            'hospital': validated_data.pop('hospital', ''),
            'specialization': validated_data.pop('specialization',''),
            'languages': validated_data.pop('languages'),
            'age': validated_data.pop('age'),
            'gender': validated_data.pop('gender'),
            'experience': validated_data.pop('experience'),
            'prefer_24hr_consultation': validated_data.pop('prefer_24hr_consultation',False),
        }
        
       
        validated_data['role'] = 'doctor'
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
       
        DoctorProfile.objects.create(user=user, **doctor_data)
        
        return user

class DoctorLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        
        if user:
            if not user.is_active:
                raise serializers.ValidationError('Your account has been blocked. Please contact the administrator.')
                
            if not user.is_verified:
                raise serializers.ValidationError('Please verify your email to login.')
                
            if user.role != 'doctor':
                raise serializers.ValidationError('This login is for doctors only.')
            
            refresh = RefreshToken.for_user(user)
            try:
                doctor_profile = DoctorProfile.objects.get(user=user)
                if doctor_profile.is_approved is None:
                    raise serializers.ValidationError('Your account is pending approval from admin.')
                if doctor_profile.is_approved is False:
                    raise serializers.ValidationError('Your account registration has been rejected. Please contact support.')
                
               
                refresh = RefreshToken.for_user(user)
                
                return {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'phone': user.phone,
                    'is_approved': doctor_profile.is_approved,
                    'is_active': user.is_active,
                    'registration_id': doctor_profile.registration_id,
                    'hospital': doctor_profile.hospital,
                    'specialization': doctor_profile.specialization,
                    'languages': doctor_profile.languages,
                    'age': doctor_profile.age,
                    'gender': doctor_profile.gender,
                    'experience': doctor_profile.experience,
                    'prefer_24hr_consultation': doctor_profile.prefer_24hr_consultation,
                    'emergency_status': doctor_profile.emergency_status,
                }
            except DoctorProfile.DoesNotExist:
                raise serializers.ValidationError('Doctor profile not found. Please contact support.')
        else:
            raise serializers.ValidationError('Invalid username or password.')

class DoctorProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    phone = serializers.ReadOnlyField(source='user.phone')
    prefer_24hr_consultation = serializers.BooleanField()
    emergency_status = serializers.BooleanField()
    profile_image = serializers.ReadOnlyField(source='user.profile_image')
    is_verified = serializers.ReadOnlyField(source='user.is_verified')
    role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = DoctorProfile
        fields = [
            'user_id', 'slug', 'username', 'email', 'phone', 'prefer_24hr_consultation', 
            'emergency_status', 'profile_image', 'registration_id', 'hospital', 
            'specialization', 'languages', 'age', 'gender', 'experience', 
            'is_approved', 'is_verified', 'role'
        ]
        read_only_fields = ['registration_id', 'specialization', 'is_approved']


class DoctorProfileUpdateSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    # Doctor profile fields
    hospital = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    languages = serializers.CharField(required=False, allow_blank=True, default='English', max_length=255)
    location = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    age = serializers.IntegerField(required=False, allow_null=True, 
                                  min_value=21, max_value=80)
    gender = serializers.ChoiceField(required=False, allow_blank=True, allow_null=True, 
                                    choices=['male', 'female', 'other', 'prefer not to say'])
    experience = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    
    def validate_email(self, value):
        user = self.instance['user']
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_phone(self, value):
        user = self.instance['user']
        if value and User.objects.exclude(pk=user.pk).filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value
    
    def validate_username(self, value):
        user = self.instance['user']
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value
    
    def save(self):
        user = self.instance['user']
        doctor_profile = self.instance['doctor_profile']
        
        # Handle profile image upload
        profile_image = self.validated_data.pop('profile_image', None)
        if profile_image:
            try:
                upload_result = cloudinary.uploader.upload(
                    profile_image,
                    folder="doctor_profile_images",
                    resource_type="image"
                )
                user.profile_image = upload_result['secure_url']
            except Exception as e:
                raise serializers.ValidationError(f"Image upload failed: {str(e)}")
        
        # Update user fields
        for attr, value in self.validated_data.items():
            if attr in ['username', 'email', 'phone']:
                setattr(user, attr, value)
        
        # Update doctor profile fields
        profile_fields = ['hospital', 'languages','location', 'age', 'gender', 'experience']
        
        for field in profile_fields:
            if field in self.validated_data:
                setattr(doctor_profile, field, self.validated_data[field])
            
        user.save()
        doctor_profile.save()
        
        # Return updated user data with doctor profile fields
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'role': getattr(user, 'role', 'doctor'),
            'is_verified': user.is_verified,
            'doctor_profile': {
                'registration_id': doctor_profile.registration_id,
                'hospital': doctor_profile.hospital,
                'languages': doctor_profile.languages,
                'location': doctor_profile.location,
                'age': doctor_profile.age,
                'gender': doctor_profile.gender,
                'experience': doctor_profile.experience,
                'is_approved': doctor_profile.is_approved
            }
        }


class DoctorSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSlot
        fields = '__all__'
        read_only_fields = ('doctor', 'is_booked','created_at', 'updated_at')
    def validate(self, data):
        if 'date' in data:
            slot_date = data['date']
            today = date.today()

            if slot_date < today:
                raise serializers.ValidationError(
                    "Cannot create or update slots for past dates."
                )
        if 'date' in data and 'start_time' in data:
            doctor = self.context['request'].user.doctor_profile
            existing_slots = DoctorSlot.objects.filter(
                doctor=doctor,
                date=data['date'],
                start_time=data['start_time']
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_slots = existing_slots.exclude(id=self.instance.id)
                
            if existing_slots.exists():
                raise serializers.ValidationError(
                    "A slot already exists for this date and time."
                )
        
        return data
    
class PatientInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['age', 'blood_group', 'height', 'weight', 'allergies', 'chronic_conditions', 'emergency_contact', 'emergency_contact_name']

class BookedPatientSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    slot_date = serializers.DateField(source='payment.slot.date', read_only=True)
    slot_time = serializers.TimeField(source='payment.slot.start_time', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'status', 'created_at', 'slot_date', 'slot_time', 'patient', 'profile']

    def get_patient(self, obj):
        return {
            'id': obj.payment.patient.id,
            'username': obj.payment.patient.username,
            'email': obj.payment.patient.email,
            'phone': obj.payment.patient.phone
        }

    def get_profile(self, obj):
        try:
            profile = PatientProfile.objects.get(user=obj.payment.patient)
            return PatientInfoSerializer(profile).data
        except PatientProfile.DoesNotExist:
            return None

class WalletHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletHistory
        fields = ['id', 'type', 'amount', 'new_balance', 'updated_date']

class WalletSerializer(serializers.ModelSerializer):
    history = WalletHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'history']

class AppointmentDetailsSerializer(serializers.ModelSerializer):
    # Patient information
    patient_name = serializers.CharField(source='payment.patient.username', read_only=True)
    patient_email = serializers.CharField(source='payment.patient.email', read_only=True)
    patient_phone = serializers.CharField(source='payment.patient.phone', read_only=True)
    patient_profile_image = serializers.CharField(source='payment.patient.profile_image', read_only=True)
    
    # Slot information
    appointment_date = serializers.DateField(source='payment.slot.date', read_only=True)
    appointment_time = serializers.TimeField(source='payment.slot.start_time', read_only=True)
    duration = serializers.IntegerField(source='payment.slot.duration', read_only=True)
    consultation_type = serializers.CharField(source='payment.slot.consultation_type', read_only=True)
    slot_id = serializers.IntegerField(source='payment.slot_id', read_only=True)
    slot_notes = serializers.CharField(source='payment.slot.notes', read_only=True)
    
    # Payment information
    payment_amount = serializers.DecimalField(source='payment.amount', max_digits=10, decimal_places=2, read_only=True)
    payment_status = serializers.CharField(source='payment.payment_status', read_only=True)
    payment_id = serializers.CharField(source='payment.payment_id', read_only=True)
    payment_method = serializers.CharField(source='payment.payment_method', read_only=True)
    razorpay_payment_id = serializers.CharField(source='payment.razorpay_payment_id', read_only=True)
    payment_date = serializers.DateTimeField(source='payment.timestamp', read_only=True)
    
    # Patient profile information
    patient_profile = serializers.SerializerMethodField()
    
    # Doctor information
    doctor_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'status', 'created_at', 'updated_at',
            # Patient fields
            'patient_name', 'patient_email', 'patient_phone', 'patient_profile_image',
            # Appointment fields
            'appointment_date', 'appointment_time', 'duration', 'consultation_type','slot_id', 'slot_notes',
            # Payment fields
            'payment_amount', 'payment_status', 'payment_id', 'payment_method', 
            'razorpay_payment_id', 'payment_date',
            # Profile fields
            'patient_profile', 'doctor_info'
        ]
    
    def get_patient_profile(self, obj):
        try:
            profile = PatientProfile.objects.get(user=obj.payment.patient)
            return {
                'age': profile.age,
                'blood_group': profile.blood_group,
                'height': profile.height,
                'weight': profile.weight,
                'allergies': profile.allergies,
                'chronic_conditions': profile.chronic_conditions,
                'emergency_contact': profile.emergency_contact,
                'emergency_contact_name': profile.emergency_contact_name
            }
        except PatientProfile.DoesNotExist:
            return None
    
    def get_doctor_info(self, obj):
        doctor_profile = obj.payment.slot.doctor
        return {
            'doctor_name': doctor_profile.user.username,
            'registration_id': doctor_profile.registration_id,
            'hospital': doctor_profile.hospital,
            'specialization': doctor_profile.specialization,
            'experience': doctor_profile.experience,
            'languages': doctor_profile.languages
        }

class EmergencyStatusSerializer(serializers.Serializer):
    emergency_status = serializers.BooleanField()

    def validate_emergency_status(self, value):
        """Validate emergency status"""
        if not isinstance(value, bool):
            raise serializers.ValidationError("Emergency status must be a boolean value.")
        return value