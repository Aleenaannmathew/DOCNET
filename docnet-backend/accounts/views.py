from rest_framework import status
from rest_framework.views import APIView
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import transaction
import requests
from django.http import FileResponse
from django.http import JsonResponse
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.decorators import login_required
from django.utils import timezone 
from rest_framework.response import Response
from datetime import timedelta, datetime
from django.utils.timezone import localtime
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import OTPVerification, PatientProfile, Appointment, Payment,EmergencyPayment, ChatRoom, Message,MedicalRecord, Notification,DoctorReview,DoctorReport
from doctor.models import DoctorProfile
from doctor.serializers import DoctorProfileSerializer
from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Exists, OuterRef
from doctor.models import DoctorProfile, DoctorSlot
from django.shortcuts import get_object_or_404
from doctor.serializers import DoctorProfileSerializer
import logging, json, hashlib, hmac, razorpay
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileUpdateSerializer,
    CreatePaymentSerializer,
    VerifyPaymentSerializer,
    BookingHistorySerializer,
    AppointmentDetailSerializer,
    BookingConfirmationSerializer,
    CreateEmergencyPaymentSerializer,
    VerifyEmergencyPaymentSerializer,
    EmergencyConsultationConfirmationSerializer,
    MedicalRecordSerializer,
    NotificationSerializer,DoctorReviewSerializer,
    ContactMessageSerializer,DoctorReportSerializer
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

                email_queued = EmailManager.send_registration_otp(user.email, otp, 'patient')
                if not email_queued:
                    user_logger.error(f"Failed to queue OTP email for {user.email}")

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
            email_queued = EmailManager.send_registration_otp(user.email, otp, 'patient')
            if not email_queued:
                user_logger.error(f"Failed to queue OTP email for {user.email}")
            
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
            
            email_queued = EmailManager.send_registration_otp(user.email, otp, 'patient')
            if not email_queued:
                user_logger.error(f"Failed to queue OTP email for {user.email}")
            
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

                if user.role != 'patient':
                    return ResponseManager.error_response('This login is for patients only.')

            except User.DoesNotExist:
                username = GoogleAuthManager.generate_unique_username(email)

                user = User.objects.create(
                    username=username,
                    email=email,
                    role='patient',
                    is_verified=True
                )
                PatientProfile.objects.create(user=user)

            
            tokens = GoogleAuthManager.create_jwt_tokens(user)

           
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
        
class ActiveDoctorsView(APIView):
    def get(self, request):
        doctors = DoctorProfile.objects.filter(
            is_approved=True
        ).select_related('user').order_by('-created_at')[:3]
        
        serializer = DoctorProfileSerializer(doctors, many=True)
        return Response(serializer.data)        
       
class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'gender', 'experience']
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'hospital']  
    ordering_fields = ['experience', 'created_at']
    ordering = ['-experience']

    def get_queryset(self):
        today = timezone.now().date()
        queryset = DoctorProfile.objects.filter(
            is_approved=True,
            user__is_active=True 
        ).select_related('user').prefetch_related('slots').annotate(
            available_today = Exists(
                DoctorSlot.objects.filter(
                    doctor=OuterRef('pk'),
                    date = today,
                    is_booked = False
                )
            ),
            has_available_slots = Exists(
                DoctorSlot.objects.filter(
                    doctor=OuterRef('pk'),
                    date__gte=today,
                    is_booked=False
                )
            )
        )

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(specialization__icontains=search_query) |
                Q(hospital__icontains=search_query)
            )
        
        availability = self.request.query_params.get('availability',None)
        if availability:
            if availability == 'Available today':
                queryset = queryset.filter(available_today=True)
            elif availability == 'Next 3 days':
                next_3_days = today + timedelta(days=3)
                queryset = queryset.filter(
                    slots__date__range=[today, next_3_days],
                    slots__is_booked=False
                ).distinct()
            elif availability == 'This Week':
                week_end = today + timedelta(days=7)
                queryset = queryset.filter(
                    slots__date__range=[today, week_end],
                    slots__is_booked=False
                ).distinct()        
        country = self.request.query_params.get('country', None)
        if country:
            pass

        show_only_available = self.request.query_params.get('only_available', 'false')
        if show_only_available.lower() == 'true':
            queryset = queryset.filter(has_available_slots=True)
            
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
        now = localtime() 
        today = localtime().date()
        current_time = now.time()

        slots = DoctorSlot.objects.filter(
            doctor__user__username=slug,
            date__gte=today,
            is_booked=False
        ).order_by('date', 'start_time')

        slots_by_date = {}
        for slot in slots:
            if slot.date == today and slot.start_time <= current_time:
                continue
            date_str = slot.date.strftime('%Y-%m-%d')
            if date_str not in slots_by_date:
                slots_by_date[date_str] = []

            time_str = slot.start_time.strftime('%I:%M %p')
            slots_by_date[date_str].append({
                'id': slot.id,
                'time': time_str,
                'duration': slot.duration,
                'type': slot.get_consultation_type_display(),
                'max_patients': slot.max_patients,
                'fee': slot.fee
            })

        return Response({
            'success': True,
            'data': slots_by_date,
            'message': 'Slots fetched successfully'
        }, status=status.HTTP_200_OK)
        
class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            return Response({
                "payment_id": result["payment"].id,
                "razorpay_order": result["order"]
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save()
            return Response({
                "message": "Payment verified and appointment created.",
                "appointment_id": appointment.id
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'patient':
            return Response({"detail": "Access denied."}, status=403)

        appointments = Appointment.objects.filter(payment__patient=user).select_related('payment__slot__doctor__user').order_by('-created_at')
        serializer = BookingHistorySerializer(appointments, many=True)
        return Response(serializer.data)   

        
class AppointmentDetailView(generics.RetrieveAPIView):
    serializer_class = AppointmentDetailSerializer
    permission_classes = [IsAuthenticated]

    
    def get_object(self):
        appointment_id = self.kwargs.get('appointment_id')
        patient_profile = get_object_or_404(PatientProfile, user=self.request.user)
        appointment = get_object_or_404(
            Appointment,
            id=appointment_id,
            payment__patient=self.request.user
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

class EmergencyConsultationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'patient':
            return Response({"detail": "Access denied."}, status=403)

        consultations = EmergencyPayment.objects.filter(patient=user).select_related('doctor__user').order_by('-timestamp')
        
        data = []
        for consultation in consultations:
            data.append({
                'id': consultation.id,
                'doctor_name': f"Dr. {consultation.doctor.user.username}",
                'specialty': consultation.doctor.specialization or 'Emergency Consultation',
                'timestamp': consultation.timestamp,
                'consultation_start_time': consultation.consultation_start_time,
                'consultation_end_time': consultation.consultation_end_time,
                'payment_status': consultation.payment_status,
                'amount': str(consultation.amount),
                'reason': consultation.reason,
                'consultation_started': consultation.consultation_started
            })
        
        return Response(data)

class EmergencyConsultationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, consultation_id):
        try:
            consultation = EmergencyPayment.objects.get(
                id=consultation_id,
                patient=request.user
            )
            
            data = {
                'id': consultation.id,
                'doctor_name': consultation.doctor.user.username,
                'specialization': consultation.doctor.specialization,
                'hospital': consultation.doctor.hospital,
                'registration_id': consultation.doctor.registration_id,
                'experience': consultation.doctor.experience,
                'timestamp': consultation.timestamp,
                'consultation_start_time': consultation.consultation_start_time,
                'consultation_end_time': consultation.consultation_end_time,
                'payment_status': consultation.payment_status,
                'payment_method': consultation.payment_method,
                'razorpay_payment_id': consultation.razorpay_payment_id,
                'payment_id': consultation.id, 
                'amount': str(consultation.amount),
                'reason': consultation.reason,
                'consultation_started': consultation.consultation_started
            }
            
            return Response(data)
            
        except EmergencyPayment.DoesNotExist:
            return Response(
                {'detail': 'Emergency consultation not found or access denied.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        
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
        
class BookingConfirmationByPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, payment_id):
        try:
            # Ensure user is a patient
            if request.user.role != 'patient':
                return Response({
                    'success': False,
                    'message': 'Access denied. This endpoint is for patients only.',
                    'data': None
                }, status=status.HTTP_403_FORBIDDEN)
            
            appointment = Appointment.objects.select_related(
                'payment__patient',
                'payment__slot__doctor__user',
                'payment__slot__doctor'
            ).get(
                payment__razorpay_payment_id=payment_id,
                payment__patient=request.user,
                payment__payment_status='success'
            )
            
            # Serialize the appointment data
            serializer = BookingConfirmationSerializer(appointment)
            
            return Response({
                'success': True,
                'message': 'Booking confirmation retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Appointment.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No confirmed booking found for this payment ID.',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error in BookingConfirmationByPaymentView: {str(e)}")
            return Response({
                'success': False,
                'message': f'An error occurred while retrieving booking confirmation: {str(e)}',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmergencyDoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'gender']
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'hospital']
    ordering_fields = ['experience', 'created_at']
    ordering = ['-experience']

    def get_queryset(self):
        return DoctorProfile.objects.filter(
            emergency_status=True,
            is_approved=True,
            user__is_active=True
        ).select_related('user')
    
class CreateEmergencyPaymentView(APIView):
   
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        serializer = CreateEmergencyPaymentSerializer(
            data=request.data, 
            context={'request': request}
        )
       
        
        if serializer.is_valid():
            try:
                result = serializer.save()
                return Response({
                    "success": True,
                    "message": "Payment order created successfully",
                    "payment_id": result["payment"].id,
                    "razorpay_order": result["razorpay_order"],
                    "doctor_name": result["payment"].doctor.user.username,
                    "amount": str(result["payment"].amount),
                    "reason": result["payment"].reason
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "success": False,
                    "message": f"Failed to create payment: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": False,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmergencyPaymentView(APIView):
   
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyEmergencyPaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                payment = serializer.save()
                self._create_notification(payment)
                return Response({
                    "success": True,
                    "message": "Emergency payment verified successfully",
                    "payment_id": payment.id,
                    "doctor_name": payment.doctor.user.username,
                    "doctor_specialization": payment.doctor.specialization,
                    "consultation_fee": str(payment.amount),
                    "consultation_started": payment.consultation_started,
                    "reason":payment.reason
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "success": False,
                    "message": f"Payment verification failed: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": False,
            "message": "Invalid payment data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_notification(self, payment):
        # Create notification in database
        notification = Notification.objects.create(
            sender=payment.patient,
            receiver=payment.doctor.user,
            message=f"Emergency payment verified successfully. You can start the consultation.",
            notification_type='emergency',
            content_type=ContentType.objects.get_for_model(payment),
            object_id=payment.id
        )

        # Send real-time notification using channels
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'notifications_{payment.doctor.user.id}',  # Doctor's WebSocket group
            {
                'type': 'send_notification',
                'message': notification.message,
                'notification_type': notification.notification_type,
                'sender': notification.sender.username,
            }
        )


class ValidateEmergencyVideoCallAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, emergency_id):
        try:
            emergency_payment = EmergencyPayment.objects.select_related(
                'doctor__user', 
                'patient'
            ).get(
                id=emergency_id,
                payment_status='success'
            )
            
            # Check if user is authorized (doctor or patient)
            user = request.user
            is_doctor = emergency_payment.doctor.user.id == user.id
            is_patient = emergency_payment.patient.id == user.id
            
            if not (is_doctor or is_patient):
                return Response(
                    {"error": "You are not authorized to join this emergency consultation"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if consultation has ended
            if emergency_payment.consultation_end_time:
                return Response(
                    {"error": "This emergency consultation has already ended"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response({
                "valid": True,
                "room_name": f"emergency_{emergency_id}",
                "is_doctor": is_doctor,
                "is_patient": is_patient,
                "doctor_name": emergency_payment.doctor.user.username,
                "patient_name": emergency_payment.patient.username,
                "consultation_started": emergency_payment.consultation_started,
                "start_time": emergency_payment.consultation_start_time,
                "amount": str(emergency_payment.amount)
            })
            
        except EmergencyPayment.DoesNotExist:
            return Response(
                {"error": "No valid emergency consultation found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error validating emergency video call: {e}")
            return Response(
                {"error": "Something went wrong. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EmergencyConsultationConfirmationView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, payment_id):
        
        payment = get_object_or_404(EmergencyPayment, id=payment_id)
        
        # Check if user has permission to access this consultation
        if self.request.user != payment.patient and self.request.user != payment.doctor.user:
            return None
        return payment
    
    def get(self, request, payment_id):
        payment = self.get_object(payment_id)
        
        if payment is None:
            return Response(
                {"error": "You don't have permission to access this consultation"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EmergencyConsultationConfirmationSerializer(payment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, payment_id):
        payment = self.get_object(payment_id)
        
        if payment is None:
            return Response(
                {"error": "You don't have permission to access this consultation"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')
        
        if action == 'start_consultation':
            return self._handle_start_consultation(payment)
        elif action == 'end_consultation':
            return self._handle_end_consultation(payment)
        else:
            return Response(
                {"error": "Invalid action. Use 'start_consultation' or 'end_consultation'"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _handle_start_consultation(self, payment):
        if payment.consultation_started:
            return Response(
                {"error": "Consultation already started"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if payment.payment_status != 'success':
            return Response(
                {"error": "Payment must be completed before starting consultation"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.consultation_started = True
        payment.consultation_start_time = timezone.now()
        payment.save()
        
        serializer = EmergencyConsultationConfirmationSerializer(payment)
        return Response({
            "message": "Consultation started successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def _handle_end_consultation(self, payment):
        if not payment.consultation_started:
            return Response(
                {"error": "Consultation has not been started yet"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if payment.consultation_end_time:
            return Response(
                {"error": "Consultation already ended"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.consultation_end_time = timezone.now()
        
        # Calculate duration if start time exists
        if payment.consultation_start_time:
            duration = payment.consultation_end_time - payment.consultation_start_time
            payment.duration_minutes = int(duration.total_seconds() / 60)
        
        payment.save()
        
        serializer = EmergencyConsultationConfirmationSerializer(payment)
        return Response({
            "message": "Consultation ended successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    

class ValidateChatAccessAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slot_id):
        user = request.user

        try:
            # Find a valid appointment
            appointment = Appointment.objects.get(
                payment__slot__id=slot_id,
                payment__payment_status='success',
                status='completed'
            )

            # Check if consultation is still valid
            consultation_end = appointment.updated_at
            if timezone.now() > consultation_end + timedelta(days=7):
                return Response(
                    {"error": "Chat window has expired"},
                    status=status.HTTP_403_FORBIDDEN
                )

            doctor_user = appointment.payment.slot.doctor.user
            patient_user = appointment.payment.patient

            # Determine if the logged-in user is doctor or patient
            if user == doctor_user:
                room, _ = ChatRoom.objects.get_or_create(
                    doctor=doctor_user,
                    patient=patient_user
                )
            elif user == patient_user:
                room, _ = ChatRoom.objects.get_or_create(
                    doctor=doctor_user,
                    patient=patient_user
                )
            else:
                return Response(
                    {"error": "You are not authorized for this chat"},
                    status=status.HTTP_403_FORBIDDEN
                )

            return Response({"valid": True, "room_id": room.id})

        except Appointment.DoesNotExist:
            return Response(
                {"error": "No valid completed appointment found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class MedicalRecordListView(generics.ListAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['appointment__status']
    search_fields = ['diagnosis', 'prescription', 'notes', 'doctor__username', 'patient__username']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return MedicalRecord.objects.filter(doctor=user)
        elif user.role == 'patient':
            return MedicalRecord.objects.filter(patient=user)
        return MedicalRecord.objects.none()

class MedicalRecordDetailView(generics.RetrieveAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]   

class UserNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch notifications for the logged-in user
        notifications = Notification.objects.filter(receiver=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)   

class DoctorReviewListView(generics.ListAPIView):
    serializer_class = DoctorReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')
        return DoctorReview.objects.filter(doctor__user__username=username).order_by('-created_at')


class SubmitDoctorReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        try:
            doctor = DoctorProfile.objects.get(user__username=username)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

        patient = request.user
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        if not rating or not comment:
            return Response({'detail': 'Rating and comment are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the patient had a completed consultation
        appointment = Appointment.objects.filter(
            payment__patient=patient,
            payment__slot__doctor=doctor,
            status='completed'
        ).first()

        # Check if the patient had a completed emergency consultation
        emergency_payment = EmergencyPayment.objects.filter(
            patient=patient,
            doctor=doctor,
            payment_status='success',
            consultation_started=True,
            consultation_end_time__isnull=False
        ).first()

        if not appointment and not emergency_payment:
            return Response({'detail': 'You can only review doctors you have consulted with.'}, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate reviews
        if DoctorReview.objects.filter(patient=patient, doctor=doctor).exists():
            return Response({'detail': 'You have already reviewed this doctor.'}, status=status.HTTP_400_BAD_REQUEST)

        review = DoctorReview.objects.create(
            patient=patient,
            doctor=doctor,
            appointment=appointment if appointment else None,
            emergency_payment=emergency_payment if emergency_payment else None,
            rating=rating,
            comment=comment
        )

        # Serialize the review to return it to the frontend
        serializer = DoctorReviewSerializer(review)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class HasConsultedDoctorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            doctor = DoctorProfile.objects.get(user__username=username)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

        patient = request.user

        has_appointment = Appointment.objects.filter(
            payment__patient=patient,
            payment__slot__doctor=doctor,
            status='completed'
        ).exists()

        has_emergency_payment = EmergencyPayment.objects.filter(
            patient=patient,
            doctor=doctor,
            payment_status='success',
            consultation_started=True,
            consultation_end_time__isnull=False
        ).exists()

        has_consulted = has_appointment or has_emergency_payment

        return Response({'has_consulted': has_consulted}, status=status.HTTP_200_OK)


class DownloadReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id, payment__patient=request.user)
            if appointment.receipt_file:
                file_path = appointment.receipt_file.path
                return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=f"Receipt_{appointment_id}.pdf")
            else:
                return Response({"detail": "Receipt not available"}, status=404)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found"}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)
        
class ContactMessageView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Message sent successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmitDoctorReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        try:
            doctor = DoctorProfile.objects.get(user__username=username)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', '').strip()

        if not reason:
            return Response({'reason': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        patient = request.user

        # Check if the patient had a completed consultation (normal)
        appointment = Appointment.objects.filter(
            payment__patient=patient,
            payment__slot__doctor=doctor,
            status='completed'
        ).exists()

        # Check if the patient had a completed emergency consultation
        emergency = EmergencyPayment.objects.filter(
            patient=patient,
            doctor=doctor,
            payment_status='success',
            consultation_started=True,
            consultation_end_time__isnull=False
        ).exists()

        if not appointment and not emergency:
            return Response({'detail': 'You can only report doctors you have consulted with.'}, status=status.HTTP_403_FORBIDDEN)

        
        if DoctorReport.objects.filter(patient=patient, doctor=doctor).exists():
            return Response({'detail': 'You have already reported this doctor.'}, status=status.HTTP_400_BAD_REQUEST)

        report = DoctorReport.objects.create(
            patient=patient,
            doctor=doctor,
            reason=reason
        )

        serializer = DoctorReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
