from rest_framework import serializers
from .models import DoctorProfile, DoctorSlot
from django.db import transaction
import cloudinary
import cloudinary.uploader
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
                    'experience': doctor_profile.experience
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
    profile_image = serializers.ReadOnlyField(source='user.profile_image')
    is_verified = serializers.ReadOnlyField(source='user.is_verified')
    role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = DoctorProfile
        fields = [
            'user_id', 'slug' ,'username', 'email', 'phone', 'profile_image',
            'registration_id', 'hospital','specialization' ,'languages', 'age', 'gender',
            'experience', 'is_approved', 'is_verified', 'role'
        ]
        read_only_fields = ['registration_id','specialization', 'is_approved']


class DoctorProfileUpdateSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    # Doctor profile fields
    hospital = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    languages = serializers.CharField(required=False, allow_blank=True, default='English', max_length=255)
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
        profile_fields = ['hospital', 'languages', 'age', 'gender', 'experience']
        
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