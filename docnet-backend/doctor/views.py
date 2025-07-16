from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from decimal import Decimal
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction, models
from django.db.models import Q, Sum, Count
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
from accounts.models import EmergencyPayment, Appointment, Payment,Notification
from django.utils.timezone import now, localdate, timedelta
from decimal import Decimal
from reportlab.pdfgen import canvas
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
import logging
from rest_framework.decorators import api_view, permission_classes
from accounts.models import Appointment,MedicalRecord
from .models import DoctorProfile, DoctorSlot, Wallet,WalletHistory,Withdrawal
from .serializers import DoctorRegistrationSerializer, DoctorProfileSerializer, DoctorLoginSerializer, DoctorProfileUpdateSerializer, DoctorSlotSerializer, BookedPatientSerializer, EmergencyStatusSerializer, WalletSerializer, AppointmentDetailsSerializer,EmergencyConsultationDetailSerializer,EmergencyConsultationListSerializer,MedicalRecordSerializer,NotificationSerializer,NotificationMarkAsReadSerializer,WithdrawalSerializer
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

                email_queued = EmailManager.send_registration_otp(user.email, otp, 'doctor')
                if not email_queued:
                    doctor_logger.error(f"Failed to queue OTP email for {user.email}")

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
            email_queued = EmailManager.send_registration_otp(user.email, otp, 'doctor')
            if not email_queued:
                doctor_logger.error(f"Failed to queue OTP email for {user.email}")
            
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
            
            email_queued = EmailManager.send_registration_otp(user.email, otp, 'doctor')
            if not email_queued:
                doctor_logger.error(f"Failed to queue OTP email for {user.email}")
            
            return ResponseManager.success_response(
                data={'user_id': user.id, 'success': True},
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
        code = request.data.get('code')  

        if not code:
            return ResponseManager.error_response('Authorization code is required')

        try:
           
            token_response = requests.post('https://oauth2.googleapis.com/token', data={
                'code': code,
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': 'postmessage',
                'grant_type': 'authorization_code',
            })

            if token_response.status_code != 200:
                return ResponseManager.error_response('Failed to exchange code for tokens.')

            token_data = token_response.json()
            access_token = token_data.get('access_token')

            if not access_token:
                return ResponseManager.error_response('Access token not received from Google.')

           
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
                    return ResponseManager.error_response('This login is for doctor only.')

            except User.DoesNotExist:
                username = GoogleAuthManager.generate_unique_username(email)

                user = User.objects.create(
                    username=username,
                    email=email,
                    role='doctor',
                    is_verified=True
                )
                DoctorProfile.objects.create(user=user)

            
            tokens = GoogleAuthManager.create_jwt_tokens(user)

           
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

            start_window = slot_time - timedelta(minutes=15)
            end_window = slot_time + timedelta(minutes=slot.duration)
            
            if not (start_window <= now <= end_window):
                return Response(
                    {"error": "Video call is only available during your scheduled time"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
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

class DoctorEmergencyConsultationListView(generics.ListAPIView):
    """List all emergency consultations for a doctor"""
    serializer_class = EmergencyConsultationListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Ensure user is a doctor
        if not hasattr(self.request.user, 'doctor_profile'):
            return EmergencyPayment.objects.none()
        
        doctor_profile = self.request.user.doctor_profile
        queryset = EmergencyPayment.objects.filter(
            doctor=doctor_profile
        ).select_related('patient', 'doctor__user').order_by('-timestamp')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            if status_filter == 'today':
                today = timezone.now().date()
                queryset = queryset.filter(timestamp__date=today)
            elif status_filter == 'active':
                queryset = queryset.filter(
                    payment_status='success',
                    consultation_end_time__isnull=True
                )
            elif status_filter == 'completed':
                queryset = queryset.filter(consultation_end_time__isnull=False)
            elif status_filter == 'pending':
                queryset = queryset.filter(payment_status='pending')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(patient__username__icontains=search) |
                Q(patient__email__icontains=search) |
                Q(reason__icontains=search)
            )
        
        return queryset

class EmergencyConsultationDetailView(generics.RetrieveAPIView):
    serializer_class = EmergencyConsultationDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'doctor_profile'):
            return EmergencyPayment.objects.none()
        
        return EmergencyPayment.objects.filter(
            doctor=self.request.user.doctor_profile
        ).select_related('patient', 'doctor__user')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_emergency_consultation(request, consultation_id):
    try:
        if not hasattr(request.user, 'doctor_profile'):
            return Response(
                {'error': 'Only doctors can start consultations'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        consultation = EmergencyPayment.objects.get(
            id=consultation_id,
            doctor=request.user.doctor_profile,
            payment_status='success'
        )
        
        if consultation.consultation_started:
            return Response(
                {'error': 'Consultation already started'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultation.start_consultation()
        
        return Response({
            'message': 'Consultation started successfully',
            'consultation_start_time': consultation.consultation_start_time
        })
        
    except EmergencyPayment.DoesNotExist:
        return Response(
            {'error': 'Consultation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_emergency_consultation(request, consultation_id):
    try:
        if not hasattr(request.user, 'doctor_profile'):
            return Response(
                {'error': 'Only doctors can end consultations'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        consultation = EmergencyPayment.objects.get(
            id=consultation_id,
            doctor=request.user.doctor_profile,
            consultation_started=True,
            consultation_end_time__isnull=True
        )
        
        consultation.end_consultation()
        
        return Response({
            'message': 'Consultation ended successfully',
            'consultation_end_time': consultation.consultation_end_time
        })
        
    except EmergencyPayment.DoesNotExist:
        return Response(
            {'error': 'Active consultation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'doctor_profile'):
            return Response({"detail": "Doctor profile not found."}, status=404)

        doctor = user.doctor_profile

        try:
            wallet = doctor.wallet.first()  
            total_revenue = wallet.balance
        except:
            total_revenue = Decimal('0.00')

        appointments = Appointment.objects.filter(payment__slot__doctor=doctor)
        total_appointments = appointments.count()
        completed_appointments = appointments.filter(status='completed').count()
        today_appointments = appointments.filter(payment__slot__date=localdate()).count()
        emergency_payments = EmergencyPayment.objects.filter(doctor=doctor, payment_status='success')
        total_emergency_revenue = emergency_payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        emergency_appointments = emergency_payments.count()
        recent_appointments = appointments.filter(status='completed').order_by('-created_at')[:3]
        recent_list = []
        for appt in recent_appointments:
            recent_list.append({
                "patient_name": appt.payment.patient.username,
                "date": appt.payment.slot.date,
                "time": appt.payment.slot.start_time.strftime("%I:%M %p"),
                "condition": appt.reason or "General Consultation",
                "status": appt.status
            })

        return Response({
            "total_revenue": total_revenue, 
            "emergency_revenue": total_emergency_revenue,
            "total_appointments": total_appointments,
            "today_appointments": today_appointments,
            "completed_appointments": completed_appointments,
            "emergency_appointments": emergency_appointments,
            "recent_appointments": recent_list
        })

class DoctorAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        filter_type = request.query_params.get('filter', 'all')

        if not hasattr(user, 'doctor_profile'):
            return Response({"detail": "Doctor profile not found."}, status=404)

        doctor = user.doctor_profile
        wallet = doctor.wallet.first()

        
        if not wallet:
            return Response({
                "wallet_balance": Decimal('0.00'),
                "transactions": [],
                "monthly_revenue": Decimal('0.00'),
                "weekly_revenue": Decimal('0.00'),
                "today_revenue": Decimal('0.00'),
                "expected_weekly_revenue": Decimal('0.00'),
                "expected_monthly_revenue": Decimal('0.00')
            })

        balance = wallet.balance
        transactions = wallet.history.all().order_by('-updated_date')

        today = localdate()
        current_month = today.month
        current_year = today.year

        week_start = today - timedelta(days=today.weekday())

        if filter_type == 'daily':
            filtered_txns = transactions.filter(updated_date__date=today)
        elif filter_type == 'weekly':
            filtered_txns = transactions.filter(updated_date__date__gte=week_start)
        elif filter_type == 'monthly':
            filtered_txns = transactions.filter(updated_date__month=current_month, updated_date__year=current_year)
        elif filter_type == 'yearly':
            filtered_txns = transactions.filter(updated_date__year=current_year)
        else:
            filtered_txns = transactions

        txn_list = [{
            "date": txn.updated_date.strftime('%Y-%m-%d %H:%M'),
            "type": txn.type,
            "amount": txn.amount,
            "new_balance": txn.new_balance
        } for txn in filtered_txns]

        month_revenue = wallet.history.filter(updated_date__month=current_month, updated_date__year=current_year, type='credit').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        week_revenue = wallet.history.filter(updated_date__date__gte=week_start, type='credit').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        today_revenue = wallet.history.filter(updated_date__date=today, type='credit').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        expected_weekly_revenue = (month_revenue / today.day) * 7 if today.day else Decimal('0.00')
        expected_monthly_revenue = (month_revenue / today.day) * 30 if today.day else Decimal('0.00')

        return Response({
            "wallet_balance": balance,
            "transactions": txn_list,
            "monthly_revenue": month_revenue,
            "weekly_revenue": week_revenue,
            "today_revenue": today_revenue,
            "expected_weekly_revenue": expected_weekly_revenue,
            "expected_monthly_revenue": expected_monthly_revenue
        })
    
class DoctorCSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'doctor_profile'):
            return Response({"detail": "Doctor profile not found."}, status=404)

        doctor = user.doctor_profile

        try:
            wallet = doctor.wallet.first()
            transactions = wallet.history.all().order_by('-updated_date')
        except:
            return Response({"detail": "Wallet not found."}, status=404)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="wallet_transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Type', 'Amount', 'New Balance'])

        for txn in transactions:
            writer.writerow([txn.updated_date.strftime('%Y-%m-%d %H:%M'), txn.type, txn.amount, txn.new_balance])

        return response

class DoctorPDFExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'doctor_profile'):
            return Response({"detail": "Doctor profile not found."}, status=404)

        doctor = user.doctor_profile

        try:
            wallet = doctor.wallet.first()
            transactions = wallet.history.all().order_by('-updated_date')[:10]
        except:
            return Response({"detail": "Wallet not found."}, status=404)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="wallet_report.pdf"'

        p = canvas.Canvas(response)
        p.drawString(100, 800, f"Wallet Report for Dr. {doctor.user.username}")

        y = 750
        for txn in transactions:
            p.drawString(100, y, f"{txn.updated_date.strftime('%Y-%m-%d %H:%M')} - {txn.type} - {txn.amount} - New Balance: {txn.new_balance}")
            y -= 20

        p.showPage()
        p.save()
        return response
    

class MedicalRecordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(
                id=appointment_id,
                payment__slot__doctor__user=request.user
            )
            record, created = MedicalRecord.objects.get_or_create(
                appointment=appointment,
                defaults={
                    'patient': appointment.payment.patient,
                    'doctor': appointment.payment.slot.doctor.user
                }
            )
            serializer = MedicalRecordSerializer(record)
            return Response(serializer.data)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found or you don't have access."}, 
                          status=status.HTTP_404_NOT_FOUND)

    def post(self, request, appointment_id):
        if request.user.role != 'doctor':
            return Response(
                {"error": "Only doctors are allowed to update medical records."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            appointment = Appointment.objects.get(
                id=appointment_id,
                payment__slot__doctor__user=request.user
            )
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found or you don't have access."},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data.copy()
        data['appointment'] = appointment_id
        data['patient'] = appointment.payment.patient.id
        data['doctor'] = appointment.payment.slot.doctor.user.id

        # Get or create medical record
        record, created = MedicalRecord.objects.get_or_create(
            appointment=appointment,
            defaults={
                'patient': appointment.payment.patient,
                'doctor': appointment.payment.slot.doctor.user
            }
        )

        serializer = MedicalRecordSerializer(record, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DoctorNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)  

class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id, receiver=request.user)

        if notification.is_read:
            return Response({"message": "Notification already marked as read."}, status=status.HTTP_200_OK)

        notification.is_read = True
        notification.save()

        serializer = NotificationMarkAsReadSerializer(notification)
        return Response({"message": "Notification marked as read.", "notification": serializer.data}, status=status.HTTP_200_OK) 
    
class DoctorWalletWithdrawView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_profile = DoctorProfile.objects.get(user=request.user)
        wallet = Wallet.objects.get(doctor=doctor_profile)
        amount = Decimal(request.data.get('amount', 0))

        if amount <= 0:
            return Response({'detail': 'Enter a valid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if wallet.balance < amount:
            return Response({'detail': 'Insufficient wallet balance.'}, status=status.HTTP_400_BAD_REQUEST)

        wallet.balance -= amount
        wallet.save()

        WalletHistory.objects.create(
            wallet=wallet,
            type='debit',
            amount=amount,
            new_balance=wallet.balance
        )

        # Save withdrawal entry
        withdrawal = Withdrawal.objects.create(
            doctor=doctor_profile,
            amount=amount,
            status='pending'  # You can update this later from the admin side
        )

        return Response({
            'message': 'Withdrawal successful.',
            'balance': wallet.balance,
            'transaction': {
                'id': withdrawal.id,
                'amount': amount,
                'type': 'debit',
                'updated_date': withdrawal.requested_at,
                'new_balance': wallet.balance,
            }
        }, status=status.HTTP_200_OK)
