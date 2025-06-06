from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework.response import Response
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import OTPVerification, PatientProfile, Appointment
from doctor.models import DoctorProfile
from doctor.serializers import DoctorProfileSerializer
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from doctor.models import DoctorProfile, DoctorSlot
from doctor.serializers import DoctorProfileSerializer
import logging
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileUpdateSerializer,
    DoctorSlotViewSerializer,
    AppointmentSerializer
)
from core.utils import (
    OTPManager, 
    EmailManager, 
    ValidationManager, 
    PasswordManager, 
    GoogleAuthManager, 
    UserManager, 
    ResponseManager
)
user_logger = logging.getLogger('accounts')
auth_logger = logging.getLogger('authentication')
logger = logging.getLogger(__name__)


User = get_user_model()


class UserRegistrationView(APIView):
    def post(self, request):
        data = {
            'username': request.data.get('username'),
            'email': request.data.get('email'),
            'phone': request.data.get('phone'),
            'password': request.data.get('password'),
            'confirm_password': request.data.get('confirm_password'),
        }
            
        serializer = UserRegistrationSerializer(data=data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                otp = OTPManager.create_otp_verification(user)
                user_logger.info(f"OTP generated for user {user.id}")
                user_logger.debug(f"User registration - User ID: {user.id}, Email: {user.email}")

                email_sent = EmailManager.send_registration_otp(user.email, otp, 'patient')
                if not email_sent:
                    user_logger.error(f"Failed to send OTP email to {user.email}")

                return ResponseManager.success_response(
                    data={
                        'user_id': user.id,
                        'email': user.email,
                    },
                    message='User registered successfully. Please verify your email with the OTP sent.',
                    status_code=status.HTTP_201_CREATED
                )
        
        return ResponseManager.validation_error_response(serializer.errors)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            auth_logger.info(f"User logged in: {serializer.validated_data.get('username')}")
            return ResponseManager.success_response(serializer.validated_data)
        return ResponseManager.validation_error_response(serializer.errors)


class VerifyOTPView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        entered_otp = request.data.get('otp')
        
        if not user_id or not entered_otp:
            return ResponseManager.error_response('Missing user_id or OTP')
        
        try:
            user = User.objects.get(id=user_id)
            
            result = OTPManager.verify_otp(user, entered_otp, 'registration', expiry_minutes=1)
            
            if result['success']:
                # Mark user as verified
                user.is_verified = True
                user.save()
                
                # Delete OTP record
                result['otp_verification'].delete()
                
                return ResponseManager.success_response(
                    data={'success': True},
                    message='OTP verified successfully'
                )
            else:
                return ResponseManager.error_response(result['error'])
                
        except User.DoesNotExist:
            return ResponseManager.error_response(
                'User not found',
                status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return ResponseManager.error_response(
                str(e),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResendOTPView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            auth_logger.info(f"Resending OTP for user {user_id}")
            
            otp = OTPManager.create_otp_verification(user)
            auth_logger.debug(f"New OTP generated for user {user.id}")
            
            # Send email
            email_sent = EmailManager.send_registration_otp(user.email, otp, 'patient')
            if not email_sent:
                return ResponseManager.error_response(
                    'Failed to send OTP email',
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return ResponseManager.success_response(
                message='OTP resent successfully'
            )
            
        except User.DoesNotExist:
            return ResponseManager.error_response(
                'User not found',
                status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return ResponseManager.error_response(
                str(e),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            
            # Get or create patient profile
            patient_profile, created = PatientProfile.objects.get_or_create(user=user)
            
            # Prepare response data
            response_data = {
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
            
            return ResponseManager.success_response(response_data)
            
        except Exception as e:
            return ResponseManager.error_response(
                f"Error retrieving profile: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user = request.user
            patient_profile, created = PatientProfile.objects.get_or_create(user=user)
            
            serializer = UserProfileUpdateSerializer(
                instance={'user': user, 'patient_profile': patient_profile},
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                updated_data = serializer.save()
                return ResponseManager.success_response(updated_data)
            
            return ResponseManager.validation_error_response(serializer.errors)
            
        except Exception as e:
            return ResponseManager.error_response(
                f"Error updating profile: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CheckEmailView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not ValidationManager.validate_email(email):
            return ResponseManager.error_response(
                'Please enter a valid email address'
            )
       
        exists = UserManager.check_user_exists(email, 'patient')
        
        if exists:
            return ResponseManager.success_response({'exists': True})
        else:
            return ResponseManager.error_response(
                'No patient account found with this email address'
            )


class SendPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not ValidationManager.validate_email(email):
            return ResponseManager.error_response(
                'Please enter a valid email address'
            )
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'patient')
            if not user:
                return ResponseManager.error_response(
                    'No patient account found with this email address'
                )
            
            # Generate and send password reset OTP
            otp = OTPManager.create_otp_verification(user, 'password_reset')
            
            email_sent = EmailManager.send_password_reset_otp(user.email, otp, 'patient')
            if not email_sent:
                return ResponseManager.error_response(
                    'Failed to send OTP email',
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return ResponseManager.success_response(
                data={'user_id': user.id, 'success': True},
                message='OTP sent successfully'
            )
            
        except Exception as e:
            return ResponseManager.error_response(
                f'An error occurred: {str(e)}',
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        entered_otp = request.data.get('otp')
        
        if not email or not entered_otp:
            return ResponseManager.error_response('Missing email or OTP')
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'patient')
            if not user:
                return ResponseManager.error_response(
                    'User not found',
                    status.HTTP_404_NOT_FOUND
                )
            
            # Verify OTP using utility
            result = OTPManager.verify_otp(user, entered_otp, 'password_reset')
            
            if result['success']:
                return ResponseManager.success_response(
                    data={
                        'success': True,  
                        'reset_token': 'generate_a_token_here_if_needed'
                    },
                    message='OTP verified successfully'
                )
            else:
                return ResponseManager.error_response(result['error'])
                
        except Exception as e:
            return ResponseManager.error_response(
                str(e),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        
        if not email or not new_password:
            return ResponseManager.error_response(
                'Email and new password are required'
            )
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'patient')
            if not user:
                return ResponseManager.error_response(
                    'No patient account found with this email',
                    status.HTTP_404_NOT_FOUND
                )
            
            result = PasswordManager.reset_password(user, new_password)
            
            if result['success']:
                return ResponseManager.success_response(
                    data={'success': True},
                    message=result['message']
                )
            else:
                return ResponseManager.error_response(result['error'])
            
        except Exception as e:
            return ResponseManager.error_response(
                str(e),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is a patient
        if request.user.role != 'patient':
            return ResponseManager.error_response(
                'This endpoint is only for patients',
                status.HTTP_403_FORBIDDEN
            )

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return ResponseManager.error_response(
                'Both old and new passwords are required'
            )
        
        result = PasswordManager.change_password(request.user, old_password, new_password)
        
        if result['success']:
            return ResponseManager.success_response(
                data={'success': True},
                message=result['message']
            )
        else:
            return ResponseManager.error_response(result['error'])


class GoogleLoginView(APIView):
    def post(self, request):
        access_token = request.data.get('token')

        if not access_token:
            return ResponseManager.error_response('Access token is required')
        
        try:
            # Get user info from Google
            google_result = GoogleAuthManager.get_user_info(access_token)
            if not google_result['success']:
                return ResponseManager.error_response(google_result['error'])
            
            email = google_result['userinfo']['email']

            try:
                user = User.objects.get(email=email)

                if not user.is_verified:
                    user.is_verified = True
                    user.save()

                if user.role != 'patient':
                    return ResponseManager.error_response(
                        'This login is for patients only'
                    )

            except User.DoesNotExist:
                # Create new patient user
                username = GoogleAuthManager.generate_unique_username(email)
                
                user = User.objects.create(
                    username=username,
                    email=email,
                    role='patient',
                    is_verified=True
                )          

                PatientProfile.objects.create(user=user)

            # Generate JWT tokens
            tokens = GoogleAuthManager.create_jwt_tokens(user)

            # Check if profile is complete
            try:
                patient_profile = PatientProfile.objects.get(user=user)
                is_profile_complete = patient_profile.age is not None
            except PatientProfile.DoesNotExist:
                is_profile_complete = False

            return ResponseManager.success_response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'is_profile_complete': is_profile_complete
            })
        

        except Exception as e:
            return ResponseManager.error_response(
                f'Authentication failed: {str(e)}',
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except TokenError:    
                    pass
                except Exception as e:
                    logger.error(f'Error blacklisting token: {str(e)}')
                    pass
            
            return ResponseManager.success_response(
                data={'logout': True},
                message='Successfully logged out',
                status_code=status.HTTP_200_OK
            )
        
        except Exception as e:
            logger.error(f'Logout error: {str(e)}')
            return ResponseManager.success_response(
                data={'logout': True},
                message='Logged out with warnings',
                status_code=status.HTTP_200_OK
            )
                
              
        
class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'gender', 'experience']
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'hospital']  
    ordering_fields = ['experience', 'created_at']
    ordering = ['-experience']

    def get_queryset(self):
        queryset = DoctorProfile.objects.filter(
            is_approved=True,
            user__is_active=True 
        ).select_related('user')

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(specialization__icontains=search_query) |
                Q(hospital__icontains=search_query)
            )
        
        country = self.request.query_params.get('country', None)
        if country:
            pass
            
        return queryset     

class DoctorDetailView(APIView):
    def get(self, request, slug):
        try:
            doctor =   DoctorProfile.objects.get(slug=slug, is_approved = True)
            serializer = DoctorProfileSerializer(doctor)
            return ResponseManager.success_response(data=serializer.data)
        except DoctorProfile.DoesNotExist:
            return ResponseManager.error_response(error_message="Doctor not found", status_code=404)
        
class DoctorSlotsView(APIView):
    def get(self, request, slug): 
        today = timezone.now().date()

        slots = DoctorSlot.objects.filter(
            doctor__user__username=slug,
            date__gte=today,
            is_booked=False
        ).order_by('date', 'start_time')


        slots_by_date = {}
        for slot in slots:
            date_str = slot.date.strftime('%Y-%m-%d')
            if date_str not in slots_by_date:
                slots_by_date[date_str] = []

            time_str = slot.start_time.strftime('%I:%M %p')
            slots_by_date[date_str].append({
                'id': slot.id,
                'time': time_str,
                'duration': slot.duration,
                'type': slot.get_consultation_type_display(),
                'max_patients': slot.max_patients
            })

        return Response({
            'success': True,
            'data': slots_by_date,
            'message': 'Slots fetched successfully'
        }, status=status.HTTP_200_OK)
        
class BookAppointmentView(APIView):
    def post(self, request):
        slot_id = request.data.get('slot_id')
        doctor_id = request.data.get('doctor_id')
        notes = request.data.get('notes', '')
        
        try:
            slot = DoctorSlot.objects.get(id=slot_id, is_booked=False)
        except DoctorSlot.DoesNotExist:
            return ResponseManager.error_response(
                {'error': 'Slot not available or already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
       
        appointment = Appointment.objects.create(
            patient=request.user,
            doctor_id=doctor_id,
            slot=slot,
            notes=notes,
            status='scheduled'
        )
        
        slot.is_booked = True
        slot.save()
        
        return ResponseManager.success_response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )    