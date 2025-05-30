from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User,  PatientProfile
from doctor.models import DoctorProfile
from cloudinary.uploader import upload 
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
        user = authenticate(username=data['username'], password=data['password'])

        if user:
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
        else:
            raise serializers.ValidationError('Invalid username or password.')

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


