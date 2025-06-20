from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
import random, re,requests
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from accounts.models import OTPVerification
from django.utils import timezone
import logging
from rest_framework.decorators import api_view, permission_classes
from accounts.models import Appointment
from .models import DoctorProfile, DoctorSlot, Wallet
from .serializers import DoctorRegistrationSerializer, DoctorProfileSerializer, DoctorLoginSerializer, DoctorProfileUpdateSerializer, DoctorSlotSerializer, BookedPatientSerializer, EmergencyStatusSerializer, WalletSerializer, AppointmentDetailsSerializer
from core.utils import OTPManager, EmailManager, ValidationManager, PasswordManager, GoogleAuthManager, UserManager, ResponseManager
doctor_logger = logging.getLogger('doctor')
auth_logger = logging.getLogger('authentication')
logger = logging.getLogger(__name__)
User = get_user_model()

class DoctorRegistrationView(APIView):
    def post(self, request):
        serializer = DoctorRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                otp = OTPManager.create_otp_verification(user)
                doctor_logger.info(f"New doctor user created - ID: {user.id}, Email: {user.email}")

                email_sent = EmailManager.send_registration_otp(user.email, otp, 'doctor')
                if not email_sent:
                    doctor_logger.error(f"Failed to send OTP email to {user.email}")

                return ResponseManager.success_response(
                    data={
                        'user_id': user.id,
                        'email': user.email,
                    },
                    message='Registration successful. Please verify your email with the OTP sent.',
                    status_code=status.HTTP_201_CREATED
                )
        
        return ResponseManager.validation_error_response(serializer.errors)

class DoctorLoginView(APIView):
    def post(self, request):
        serializer = DoctorLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    
    
class DoctorProfileRetrieveUpdateView(APIView): 
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            doctor_profile = DoctorProfile.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(doctor_profile)
            return ResponseManager.success_response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return ResponseManager.error_response(
                "Doctor Profile not found",
                status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return ResponseManager.error_response(
                f"Error retrieving profile: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DoctorProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        try:
            user = request.user
            doctor_profile = get_object_or_404(DoctorProfile, user=user)
            
            serializer = DoctorProfileUpdateSerializer(
                instance={'user': user, 'doctor_profile': doctor_profile},
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


        
class DoctorChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is a doctor
        if request.user.role != 'doctor':
            return ResponseManager.error_response(
                'This endpoint is only for doctors',
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

class DoctorCheckEmailView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not ValidationManager.validate_email(email):
            return ResponseManager.error_response(
                'Please enter a valid email address'
            )
       
        exists = UserManager.check_user_exists(email, 'doctor')
        
        if exists:
            return ResponseManager.success_response({'exists': True})
        else:
            return ResponseManager.error_response(
                'No doctor account found with this email address'
            )

class DoctorSendPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not ValidationManager.validate_email(email):
            return ResponseManager.error_response(
                'Please enter a valid email address'
            )
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'doctor')
            if not user:
                return ResponseManager.error_response(
                    'No doctor account found with this email address'
                )
            
            # Generate and send password reset OTP
            otp = OTPManager.create_otp_verification(user, 'password_reset')
            
            email_sent = EmailManager.send_password_reset_otp(user.email, otp, 'doctor')
            if not email_sent:
                return ResponseManager.error_response(
                    'Failed to send OTP email',
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return ResponseManager.success_response(
                data={'user_id': user.id},
                message='OTP sent successfully'
            )
            
        except Exception as e:
            return ResponseManager.error_response(
                f'An error occurred: {str(e)}',
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class DoctorVerifyPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        entered_otp = request.data.get('otp')
        
        if not email or not entered_otp:
            return ResponseManager.error_response('Missing email or OTP')
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'doctor')
            if not user:
                return ResponseManager.error_response(
                    'Doctor not found', 
                    status.HTTP_404_NOT_FOUND
                )
            
            # Verify OTP using utility
            result = OTPManager.verify_otp(user, entered_otp, 'password_reset')
            
            if result['success']:
                return ResponseManager.success_response(
                    data={'reset_token': 'generate_a_token_here_if_needed'},
                    message='OTP verified successfully'
                )
            else:
                return ResponseManager.error_response(result['error'])
                
        except Exception as e:
            return ResponseManager.error_response(
                str(e),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DoctorResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        
        if not email or not new_password:
            return ResponseManager.error_response(
                'Email and new password are required'
            )
        
        try:
            user = UserManager.get_user_by_email_and_role(email, 'doctor')
            if not user:
                return ResponseManager.error_response(
                    'No doctor account found with this email',
                    status.HTTP_404_NOT_FOUND
                )
            
            # Reset password using utility
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

                if user.role != 'doctor':
                    return ResponseManager.error_response(
                        'This login is for doctors only'
                    )

            except User.DoesNotExist:
                # Create new doctor user
                username = GoogleAuthManager.generate_unique_username(email)
                
                user = User.objects.create(
                    username=username,
                    email=email,
                    role='doctor',
                    is_verified=True
                )          

                DoctorProfile.objects.create(user=user)

            # Generate JWT tokens
            tokens = GoogleAuthManager.create_jwt_tokens(user)

            # Check if profile is complete
            try:
                doctor_profile = DoctorProfile.objects.get(user=user)
                is_profile_complete = doctor_profile.age is not None
            except DoctorProfile.DoesNotExist:
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

class DoctorLogoutView(APIView):
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
        
class DoctorSlotCreate(generics.ListCreateAPIView):
    serializer_class = DoctorSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        doctor_profile = self.request.user.doctor_profile
        queryset = DoctorSlot.objects.filter(doctor=doctor_profile)
    
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass 

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass 

        return queryset.order_by('date', 'start_time')       

    def perform_create(self,serializer):
        doctor_profile = self.request.user.doctor_profile
        serializer.save(doctor=doctor_profile)

class DoctorSlotUpdate(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DoctorSlotSerializer
    permission_classes =[permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_profile = self.request.user.doctor_profile
        return DoctorSlot.objects.filter(doctor=doctor_profile)

class AvailableSlotsView(generics.ListAPIView):
    serializer_class = DoctorSlotSerializer
    pagination_class = None

    def get_queryset(self):
        date = self.request.query_params.get('date', None)
        doctor_id = self.request.query_params.get('doctor_id', None)

        queryset = DoctorSlot.objects.filter(
            is_booked = False,
            date__gte=timezone.now().date()
        )

        if date:
            try:
                # Parse the date string properly
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                pass
                
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        return queryset.order_by('date', 'start_time')  


class DoctorBookedPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            doctor_profile = DoctorProfile.objects.get(user=request.user)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor profile not found.'}, status=404)

        appointments = Appointment.objects.filter(
            payment__slot__doctor=doctor_profile,
            payment__isnull=False,
            payment__payment_status='success',
        ).select_related('payment__slot', 'payment__patient').order_by('-created_at')

        serializer = BookedPatientSerializer(appointments, many=True)
        return Response(serializer.data)
    
class DoctorWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = Wallet.objects.get(doctor__user=request.user)
            serializer = WalletSerializer(wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response({'detail': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)    
        
class DoctorAppointmentDetailView(generics.RetrieveAPIView):
    serializer_class = AppointmentDetailsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        appointment_id = self.kwargs.get('appointment_id')
        doctor_profile = get_object_or_404(DoctorProfile, user=self.request.user)
        appointment = get_object_or_404(
            Appointment,
            id=appointment_id,
            payment__slot__doctor=doctor_profile
        )
        return appointment
    
    def retrieve(self, request, *args, **kwargs):
        try:
            appointment = self.get_object()
            serializer = self.get_serializer(appointment)
            
            return Response({
                'success': True,
                'message': 'Appointment details retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error retrieving appointment details: {str(e)}',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ValidateVideoCallAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slot_id):
        try:
            now = timezone.now()
            appointment = Appointment.objects.get(
                payment__slot__id=slot_id,
                status='scheduled',
                payment__payment_status='success'
            )
            
            slot = appointment.payment.slot
            slot_time = datetime.combine(slot.date, slot.start_time)
            
            # Make slot_time timezone-aware
            slot_time = timezone.make_aware(slot_time, timezone.get_current_timezone())

            # start_window = slot_time - timedelta(minutes=15)
            # end_window = slot_time + timedelta(minutes=slot.duration)
            
            # if not (start_window <= now <= end_window):
            #     return Response(
            #         {"error": "Video call is only available during your scheduled time"},
            #         status=status.HTTP_400_BAD_REQUEST
            #     )
                
            return Response({
                "valid": True,
                "room_name": str(slot_id),
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"error": "No valid appointment found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class EmergencyStatusUpdateView(APIView):
   
    permission_classes = [IsAuthenticated]

    def get(self, request):
      
        logger.info(f"GET request for emergency status from user: {request.user}")
        
        try:
            profile = DoctorProfile.objects.get(user=request.user)
            logger.info(f"Found profile for {request.user}: emergency_status={profile.emergency_status}")
            
            return Response({
                'emergency_status': profile.emergency_status,
                'prefer_24hr_consultation': profile.prefer_24hr_consultation,
                'message': 'Emergency status retrieved successfully'
            }, status=status.HTTP_200_OK)
            
        except DoctorProfile.DoesNotExist:
            logger.error(f"DoctorProfile not found for user: {request.user}")
            return Response(
                {'detail': 'Doctor profile not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Unexpected error in GET: {str(e)}")
            return Response(
                {'detail': 'An error occurred while fetching emergency status.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
      
        logger.info(f"POST request for emergency status from user: {request.user}, data: {request.data}")
        
        serializer = EmergencyStatusSerializer(data=request.data)
        if serializer.is_valid():
            emergency_status = serializer.validated_data['emergency_status']
            
            try:
                profile = DoctorProfile.objects.get(user=request.user)
                
                # Check if doctor has opted for 24hr consultation
                if not profile.prefer_24hr_consultation:
                    logger.warning(f"User {request.user} tried to update emergency status without 24hr consultation preference")
                    return Response(
                        {'detail': 'Doctor has not opted for 24hr consultation.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Update emergency status
                old_status = profile.emergency_status
                profile.emergency_status = emergency_status
                profile.save(update_fields=['emergency_status'])
                
                logger.info(f"Emergency status updated for {request.user}: {old_status} -> {emergency_status}")
                
                return Response({
                    'message': 'Emergency status updated successfully.',
                    'emergency_status': profile.emergency_status
                }, status=status.HTTP_200_OK)
                
            except DoctorProfile.DoesNotExist:
                logger.error(f"DoctorProfile not found for user: {request.user}")
                return Response(
                    {'detail': 'Doctor profile not found.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                logger.error(f"Unexpected error in POST: {str(e)}")
                return Response(
                    {'detail': 'An error occurred while updating emergency status.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def options(self, request, *args, **kwargs):
    
        return Response(status=status.HTTP_200_OK)
