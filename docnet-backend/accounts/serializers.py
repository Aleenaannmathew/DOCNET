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
from doctor.models import DoctorProfile, Wallet, WalletHistory
from rest_framework import serializers
from .models import Payment, Appointment,EmergencyPayment
from django.db import transaction
from django.conf import settings
from decimal import Decimal
import razorpay


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

class CreatePaymentSerializer(serializers.ModelSerializer):
    reason = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = Payment
        fields = ['slot', 'amount', 'reason']

    def create(self, validated_data):
        request = self.context['request']
        slot = validated_data['slot']
        patient = request.user
        amount = validated_data.get('amount', slot.fee)
        reason = validated_data.pop('reason')

        # Create Razorpay order
        client = razorpay.Client(auth=("rzp_test_JFRhohewvJ81Dl","sXYZOT0gNEqb4wh8rZ67jwYM"))
        razorpay_order = client.order.create({
            "amount": int(amount * 100),  # in paise
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "reason": reason
            }
        })

        payment = Payment.objects.create(
            slot=slot,
            patient=patient,
            amount=amount,
            payment_status='pending',
            payment_id=razorpay_order['id']
        )

        appointment = Appointment.objects.create(
            payment=payment,
            reason=reason,
            status='scheduled'
        )

        return {
            "payment": payment,
            "order": razorpay_order,
            "appointment": appointment
        }


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_payment_id = serializers.CharField()
    razorpay_order_id = serializers.CharField()
    razorpay_signature = serializers.CharField()

    def validate(self, data):
        client = razorpay.Client(auth=("rzp_test_JFRhohewvJ81Dl","sXYZOT0gNEqb4wh8rZ67jwYM"))

        try:
            # Verify signature
            client.utility.verify_payment_signature({
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            })
        except razorpay.errors.SignatureVerificationError:
            raise serializers.ValidationError("Invalid payment signature.")

        return data

    def create(self, validated_data):
        order_id = validated_data['razorpay_order_id']
        payment = Payment.objects.get(payment_id=order_id)

        # Update payment record
        payment.razorpay_payment_id = validated_data['razorpay_payment_id']
        payment.razorpay_signature = validated_data['razorpay_signature']
        payment.payment_status = 'success'
        payment.save()

        # Create appointment
        appointment = Appointment.objects.get(payment=payment)

        slot_booking = payment.slot
        slot_booking.is_booked = True
        slot_booking.save()

        # Update wallet
        doctor = slot_booking.doctor
        wallet, created = Wallet.objects.get_or_create(doctor=doctor)
        credited_amount = payment.amount * Decimal('0.90')  # 90% to doctor
        wallet.balance += credited_amount
        wallet.save()

        # Wallet history
        WalletHistory.objects.create(
            wallet=wallet,
            type='credit',
            amount=credited_amount,
            new_balance=wallet.balance
    )

        return appointment
    
class BookingHistorySerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='payment.slot.doctor.user.username', read_only=True)
    slot_date = serializers.DateField(source='payment.slot.date', read_only=True)
    start_time = serializers.TimeField(source='payment.slot.start_time', read_only=True)
    end_time = serializers.TimeField(source='payment.slot.end_time', read_only=True)
    payment_status = serializers.CharField(source='payment.payment_status', read_only=True)
    amount = serializers.DecimalField(source='payment.amount', max_digits=10, decimal_places=2, read_only=True)
    reason = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'status',
            'doctor_name',
            'slot_date',
            'start_time',
            'end_time',
            'payment_status',
            'amount',
            'reason',
            'created_at',
        ]

class AppointmentDetailSerializer(serializers.ModelSerializer):
    # Patient information
    patient_name = serializers.CharField(source='payment.patient.username', read_only=True)
    patient_email = serializers.CharField(source='payment.patient.email', read_only=True)
    patient_phone = serializers.CharField(source='payment.patient.phone', read_only=True)
    patient_profile_image = serializers.CharField(source='payment.patient.profile_image', read_only=True)
    reason = serializers.CharField(read_only = True)
    
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
            'appointment_date', 'appointment_time', 'duration', 'consultation_type','slot_id', 'slot_notes','reason',
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

class BookingConfirmationSerializer(serializers.ModelSerializer):
    # Appointment Information
    appointment_id = serializers.IntegerField(source='id', read_only=True)
    appointment_status = serializers.CharField(source='status', read_only=True)
    booking_date = serializers.DateTimeField(source='created_at', read_only=True)
    reason = serializers.CharField(read_only=True)
    
    # Patient Information - Add error handling for missing relationships
    patient_name = serializers.SerializerMethodField()
    patient_email = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()
    
    # Doctor Information - Add error handling
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()
    doctor_hospital = serializers.SerializerMethodField()
    doctor_experience = serializers.SerializerMethodField()
    
    # Slot Information - Add error handling
    appointment_date = serializers.SerializerMethodField()
    appointment_time = serializers.SerializerMethodField()
    appointment_end_time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    consultation_type = serializers.SerializerMethodField()
    slot_fee = serializers.SerializerMethodField()
    
    # Payment Information - Add error handling
    payment_id = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_amount = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    razorpay_payment_id = serializers.SerializerMethodField()
    payment_timestamp = serializers.SerializerMethodField()
    
    # Additional Information
    booking_reference = serializers.SerializerMethodField()
    appointment_instructions = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            # Appointment fields
            'appointment_id', 'appointment_status', 'booking_date','reason',
            # Patient fields
            'patient_name', 'patient_email', 'patient_phone',
            # Doctor fields
            'doctor_name', 'doctor_specialization', 'doctor_hospital', 'doctor_experience',
            # Slot fields
            'appointment_date', 'appointment_time', 'appointment_end_time', 
            'duration', 'consultation_type', 'slot_fee',
            # Payment fields
            'payment_id', 'payment_status', 'payment_amount', 'payment_method', 
            'razorpay_payment_id', 'payment_timestamp',
            # Additional fields
            'booking_reference', 'appointment_instructions'
        ]
    
    # Patient Information Methods
    def get_patient_name(self, obj):
        try:
            return obj.payment.patient.username if obj.payment and obj.payment.patient else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_patient_email(self, obj):
        try:
            return obj.payment.patient.email if obj.payment and obj.payment.patient else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_patient_phone(self, obj):
        try:
            return getattr(obj.payment.patient, 'phone', 'N/A') if obj.payment and obj.payment.patient else "N/A"
        except AttributeError:
            return "N/A"
    
    # Doctor Information Methods
    def get_doctor_name(self, obj):
        try:
            return obj.payment.slot.doctor.user.username if obj.payment and obj.payment.slot and obj.payment.slot.doctor else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_doctor_specialization(self, obj):
        try:
            return getattr(obj.payment.slot.doctor, 'specialization', 'N/A') if obj.payment and obj.payment.slot and obj.payment.slot.doctor else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_doctor_hospital(self, obj):
        try:
            return getattr(obj.payment.slot.doctor, 'hospital', 'N/A') if obj.payment and obj.payment.slot and obj.payment.slot.doctor else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_doctor_experience(self, obj):
        try:
            return getattr(obj.payment.slot.doctor, 'experience', 0) if obj.payment and obj.payment.slot and obj.payment.slot.doctor else 0
        except AttributeError:
            return 0
    
    # Slot Information Methods
    def get_appointment_date(self, obj):
        try:
            return obj.payment.slot.date if obj.payment and obj.payment.slot else None
        except AttributeError:
            return None
    
    def get_appointment_time(self, obj):
        try:
            return obj.payment.slot.start_time if obj.payment and obj.payment.slot else None
        except AttributeError:
            return None
    
    def get_appointment_end_time(self, obj):
        try:
            return obj.payment.slot.end_time if obj.payment and obj.payment.slot else None
        except AttributeError:
            return None
    
    def get_duration(self, obj):
        try:
            return getattr(obj.payment.slot, 'duration', 0) if obj.payment and obj.payment.slot else 0
        except AttributeError:
            return 0
    
    def get_consultation_type(self, obj):
        try:
            return getattr(obj.payment.slot, 'consultation_type', 'N/A') if obj.payment and obj.payment.slot else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_slot_fee(self, obj):
        try:
            return obj.payment.slot.fee if obj.payment and obj.payment.slot else 0
        except AttributeError:
            return 0
    
    # Payment Information Methods
    def get_payment_id(self, obj):
        try:
            return obj.payment.payment_id if obj.payment else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_payment_status(self, obj):
        try:
            return obj.payment.payment_status if obj.payment else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_payment_amount(self, obj):
        try:
            return obj.payment.amount if obj.payment else 0
        except AttributeError:
            return 0
    
    def get_payment_method(self, obj):
        try:
            return obj.payment.payment_method if obj.payment else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_razorpay_payment_id(self, obj):
        try:
            return obj.payment.razorpay_payment_id if obj.payment else "N/A"
        except AttributeError:
            return "N/A"
    
    def get_payment_timestamp(self, obj):
        try:
            return obj.payment.timestamp if obj.payment else None
        except AttributeError:
            return None
    
    def get_booking_reference(self, obj):
        return f"BK{obj.id:06d}"
    
    def get_appointment_instructions(self, obj):
        try:
            consultation_type = obj.payment.slot.consultation_type if obj.payment and obj.payment.slot else 'general'
            
            if consultation_type == 'video':
                return {
                    'type': 'video',
                    'message': 'Please join the video call 5 minutes before your scheduled time.',
                    'requirements': [
                        'Ensure stable internet connection',
                        'Test your camera and microphone',
                        'Find a quiet, private space for consultation'
                    ]
                }
            else:
                return {
                    'type': 'general',
                    'message': 'Please be available at your scheduled time.',
                    'requirements': ['Keep your phone accessible for communication']
                }
        except AttributeError:
            return {
                'type': 'general',
                'message': 'Please be available at your scheduled time.',
                'requirements': ['Keep your phone accessible for communication']
            }

class EmergencyDoctorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_image = serializers.ImageField(source='user.profile_image', read_only=True)
    rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    consultation_fee = serializers.SerializerMethodField()
    emergency_fee = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'username', 'email', 'profile_image', 'registration_id',
            'hospital', 'languages', 'age', 'gender', 'experience',
            'specialization', 'rating', 'total_reviews', 'consultation_fee',
            'emergency_fee', 'slug', 'emergency_status'
        ]
    
    def get_rating(self, obj):
        # Implement your rating calculation logic
        return 4.5  # placeholder
    
    def get_total_reviews(self, obj):
        # Implement your review count logic
        return 150  # placeholder
    
    def get_consultation_fee(self, obj):
        # Base consultation fee
        return 500  # placeholder - you can add this field to your model
    
    def get_emergency_fee(self, obj):
        # Emergency consultation fee (usually higher)
        return 800  # placeholder - you can add this field to your model

class CreateEmergencyPaymentSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField()
    reason = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = EmergencyPayment
        fields = ['doctor_id', 'amount','reason']

    def validate(self, data):
        doctor_id = data.get('doctor_id')
        if not doctor_id:
            raise serializers.ValidationError({
                "doctor_id": "Doctor ID is required."
            })

        try:
            doctor = DoctorProfile.objects.get(
                user__id=doctor_id,
                emergency_status=True,
                is_approved=True
            )
            data['doctor_id'] = doctor  # replace ID with the actual DoctorProfile instance
            return data
        except DoctorProfile.DoesNotExist:
            raise serializers.ValidationError({
                "doctor_id": "Doctor not found or not available for emergency consultation."
            })

    def validate_amount(self, value):
        if value < 500:
            raise serializers.ValidationError("Minimum emergency consultation fee is ₹500")
        if value > 5000:
            raise serializers.ValidationError("Maximum emergency consultation fee is ₹5000")
        return value

    def create(self, validated_data):
        request = self.context['request']
        doctor = validated_data['doctor_id']
        patient = request.user
        amount = validated_data.get('amount', 800.00)
        reason = validated_data.get('reason','')

        # Check for existing active consultation
        active_consultation = EmergencyPayment.objects.filter(
            patient=patient,
            payment_status='success',
            consultation_started=True,
            consultation_end_time__isnull=True
        ).first()

        if active_consultation:
            raise serializers.ValidationError(
                "You already have an active emergency consultation."
            )

        # Initialize Razorpay client
        client = razorpay.Client(auth=("rzp_test_JFRhohewvJ81Dl", "sXYZOT0gNEqb4wh8rZ67jwYM"))

        try:
            # Create Razorpay order
            razorpay_order = client.order.create({
                "amount": int(amount * 100),  # in paise
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "consultation_type": "emergency",
                    "doctor_id": str(doctor.id),
                    "patient_id": str(patient.id),
                    "patient_name": patient.username,
                    "reason": reason,
                }
            })

            # Create payment entry
            with transaction.atomic():
                payment = EmergencyPayment.objects.create(
                    doctor=doctor,
                    patient=patient,
                    amount=amount,
                    payment_status='pending',
                    payment_id=razorpay_order['id'],
                    razorpay_order_id=razorpay_order['id'],
                    reason=reason,
                )

            return {
                "payment": payment,
                "razorpay_order": razorpay_order
            }

        except Exception as e:
            raise serializers.ValidationError(f"Failed to create payment order: {str(e)}")


class VerifyEmergencyPaymentSerializer(serializers.Serializer):
    razorpay_payment_id = serializers.CharField(max_length=255)
    razorpay_order_id = serializers.CharField(max_length=255)
    razorpay_signature = serializers.CharField(max_length=500)

    def validate(self, data):
        # Initialize Razorpay client
        client = razorpay.Client(auth=("rzp_test_JFRhohewvJ81Dl","sXYZOT0gNEqb4wh8rZ67jwYM"))

        try:
            # Verify payment signature
            client.utility.verify_payment_signature({
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            })
        except razorpay.errors.SignatureVerificationError:
            raise serializers.ValidationError("Invalid payment signature.")
        except Exception as e:
            raise serializers.ValidationError(f"Payment verification failed: {str(e)}")

        return data

    def create(self, validated_data):
        order_id = validated_data['razorpay_order_id']
        
        try:
            payment = EmergencyPayment.objects.get(
                razorpay_order_id=order_id,
                payment_status='pending'
            )
        except EmergencyPayment.DoesNotExist:
            raise serializers.ValidationError("Payment record not found or already processed.")

        with transaction.atomic():
            # Update payment record
            payment.razorpay_payment_id = validated_data['razorpay_payment_id']
            payment.razorpay_signature = validated_data['razorpay_signature']
            payment.payment_status = 'success'
            
            
            
            # Start consultation automatically
            payment.start_consultation()
            payment.save()

            # Update doctor's wallet
            doctor = payment.doctor
            wallet, created = Wallet.objects.get_or_create(
                doctor=doctor,
                defaults={'balance': Decimal('0.00')}
            )
            
            # Emergency consultation: 85% to doctor, 15% platform fee
            credited_amount = payment.amount * Decimal('0.85')
            wallet.balance += credited_amount
            wallet.save()

            # Create wallet history
            WalletHistory.objects.create(
                wallet=wallet,
                type='credit',
                amount=credited_amount,
                new_balance=wallet.balance,
            )

        return payment

class EmergencyPaymentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = EmergencyPayment
        fields = [
            'id', 'doctor_name', 'doctor_specialization', 'patient_name',
            'amount', 'payment_status', 'video_call_link', 'consultation_started',
            'consultation_start_time', 'consultation_end_time', 'duration_minutes',
            'timestamp'
        ]

