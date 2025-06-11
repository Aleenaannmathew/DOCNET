from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User,  PatientProfile, Appointment
from doctor.models import DoctorProfile, DoctorSlot
from cloudinary.uploader import upload
from datetime import datetime, timezone 
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
import cloudinary
import cloudinary.uploader
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User ,PatientProfile
from doctor.models import DoctorProfile



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
    

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True) 
    phone = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'phone']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email address already in use."})
        
        if User.objects.filter(phone=data['phone']).exists():
            raise serializers.ValidationError({"phone": "Phone number already in use."})
            
        return data
    

    def create(self, validated_data):
        try:
            phone = validated_data.pop('phone', None)
            validated_data.pop('confirm_password')
            
            user = User.objects.create(
                username=validated_data['username'],
                email=validated_data['email'],
                phone=phone,
                role='patient',
            )
            user.set_password(validated_data['password'])       
            user.save()

            PatientProfile.objects.create(user=user)

            return user
    
        except Exception as e:
            print(f"User creation error: {str(e)}")
            raise serializers.ValidationError({"error": f"User registration failed: {str(e)}"})
        



class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid username or password')

        if not user.check_password(password):
               raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This user account is not active.')
        if not user.is_verified:
            raise serializers.ValidationError('Please verify your email to login.')

        if user.role != 'patient':
            raise serializers.ValidationError('This login is for patients only.')
        refresh = RefreshToken.for_user(user)

        try:
            patient_profile = PatientProfile.objects.get(user=user)
            is_profile_complete = patient_profile.age is not None
        except PatientProfile.DoesNotExist:
            is_profile_complete = False

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'is_profile_complete': is_profile_complete
        }
       
       
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['age', 'blood_group', 'height', 'weight', 'allergies', 'chronic_conditions', 
                  'emergency_contact', 'emergency_contact_name']

class UserProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    age = serializers.IntegerField(required=False, allow_null=True)
    blood_group = serializers.CharField(required=False, allow_blank=True, max_length=10)
    height = serializers.FloatField(required=False, allow_null=True)
    weight = serializers.FloatField(required=False, allow_null=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    chronic_conditions = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True, max_length=15)
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    def validate_email(self, value):
        instance = self.instance['user']
        if User.objects.exclude(pk=instance.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_phone(self, value):
        instance = self.instance['user']
        if value and User.objects.exclude(pk=instance.pk).filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value
    
    def validate_username(self, value):
        instance = self.instance['user']
        if User.objects.exclude(pk=instance.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value
        
    def save(self):
        user = self.instance['user']
        patient_profile = self.instance['patient_profile']
        
        profile_image = self.validated_data.pop('profile_image', None)
        if profile_image:
            try:
                upload_result = cloudinary.uploader.upload(
                    profile_image,
                    folder="profile_images",
                    resource_type="image"
                )
                user.profile_image = upload_result['secure_url']
            except Exception as e:
                raise serializers.ValidationError(f"Image upload failed: {str(e)}")
        
      
        for attr, value in self.validated_data.items():
            if attr in ['username', 'email', 'phone']:
                setattr(user, attr, value)
        
        profile_fields = ['age', 'blood_group', 'height', 'weight', 'allergies', 
                         'chronic_conditions', 'emergency_contact', 'emergency_contact_name']
        
        for field in profile_fields:
            if field in self.validated_data:
                setattr(patient_profile, field, self.validated_data[field])
            
        user.save()
        patient_profile.save()
        
      
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'age': patient_profile.age,
            'blood_group': patient_profile.blood_group,
            'height': patient_profile.height,
            'weight': patient_profile.weight,
            'allergies': patient_profile.allergies,
            'chronic_conditions': patient_profile.chronic_conditions,
            'emergency_contact': patient_profile.emergency_contact,
            'emergency_contact_name': patient_profile.emergency_contact_name,
            'role': user.role,
            'is_verified': user.is_verified
        }

class DoctorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True, required=False)
    rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()
    next_available_slot = serializers.SerializerMethodField()
    available_today = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'username', 'email', 'phone', 'registration_id',
            'hospital', 'languages', 'age', 'gender', 'experience',
            'specialization', 'slug', 'rating', 'total_reviews',
            'availability_status', 'next_available_slot', 'available_today'
        ]
    
    def get_rating(self, obj):
        # Add your rating logic here or return a default
        return 4.5  # placeholder
    
    def get_total_reviews(self, obj):
        # Add your review count logic here or return a default
        return 10  # placeholder
    
    def get_next_available_slot(self, obj):
        try:
            today = timezone.now().date()
            
            # Find the next available slot
            next_slot = DoctorSlot.objects.filter(
                doctor=obj,
                date__gte=today,
                is_booked=False
            ).order_by('date', 'start_time').first()
            
            if next_slot:
                is_today = next_slot.date == today
                days_from_now = (next_slot.date - today).days
                
                return {
                    'date': next_slot.date.isoformat(),
                    'time': next_slot.start_time.strftime('%I:%M %p'),
                    'is_today': is_today,
                    'days_from_now': days_from_now,
                    'has_available_slots': True
                }
            
            return {
            'has_available_slots': False
        }
            
        except Exception as e:
            print(f"Error getting next available slot for doctor {obj.id}: {e}")
            return {
                'has_available_slots': False
            }
    
    def get_availability_status(self, obj):
        """Determine availability status based on next available slot"""
        try:
            next_slot_info = self.get_next_available_slot(obj)
            
            if not next_slot_info:
                return 'No Available Slots'
            
            days_from_now = next_slot_info['days_from_now']
            
            if days_from_now == 0:
                return 'Available Today'
            elif days_from_now == 1:
                return 'Available Tomorrow'
            elif days_from_now <= 7:
                return f'Available in {days_from_now} days'
            else:
                return 'Available Soon'
                
        except Exception as e:
            print(f"Error getting availability status for doctor {obj.id}: {e}")
            return 'Check Availability'  


class DoctorSlotViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSlot
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    slot_details = serializers.SerializerMethodField()
    class Meta:
        model = Appointment
        fields = [
           'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'slot',
            'slot_details',
            'notes',
            'status',
            'created_at',
            'updated_at' 
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"
    
    def get_slot_details(self, obj):
        slot = obj.slot
        return {
            'date': slot.date,
            'start_time': slot.start_time.strftime('%I:%M %p'),
            'duration': slot.duration,
            'consultation_type': slot.get_consultation_type_display()
        }
    
    def validate(self, data):
        if data['slot'].is_booked:
            raise serializers.ValidationError("This slot is already booked")
        
        if data['slot'].doctor_id != data['doctor'].id:
            raise serializers.ValidationError("Selected slot doesn't belong to this doctor")
        
        return data

