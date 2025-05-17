from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
import random, re
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from accounts.models import OTPVerification
from django.utils import timezone
from .models import DoctorProfile
from .serializers import DoctorRegistrationSerializer, DoctorProfileSerializer, DoctorLoginSerializer, DoctorProfileUpdateSerializer

User = get_user_model()

class DoctorRegistrationView(APIView):
    def post(self, request):
        serializer = DoctorRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
              
                user = serializer.save()
                
                otp = str(random.randint(100000, 999999))
                OTPVerification.objects.update_or_create(
                    user=user,
                    defaults={'otp': otp, 'created_at': timezone.now()}
                )
                print(f"OTP generated for doctor {user.id}: {otp}")

             
                try:
                    send_mail(
                        'DOCNET - Doctor Email Verification',
                        f'Your OTP for DOCNET registration is: {otp}',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print(f"Failed to send OTP email: {str(e)}")

                return Response({
                    'user_id': user.id,
                    'email': user.email,
                    'message': 'Registration successful. Please verify your email with the OTP sent.'
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"detail": "Doctor profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Error retrieving profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
                return Response(updated_data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {"detail": f"Error updating profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        
class DoctorChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is a doctor
        if request.user.role != 'doctor':
            return Response(
                {'error': 'This endpoint is only for doctors'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify old password
        if not check_password(old_password, request.user.password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response(
                {'error': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class DoctorCheckEmailView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not email or not re.match(r'^\S+@\S+\.\S+$', email):
            return Response(
                {'exists': False, 'message': 'Please enter a valid email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        exists = User.objects.filter(email=email, role='doctor').exists()
        
        if exists:
            return Response({'exists': True}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'exists': False, 'message': 'No doctor account found with this email address'},
                status=status.HTTP_400_BAD_REQUEST
            )

class DoctorSendPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        if not email or not re.match(r'^\S+@\S+\.\S+$', email):
            return Response(
                {'success': False, 'message': 'Please enter a valid email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, role='doctor')         
            OTPVerification.objects.filter(user=user).delete()
            otp = str(random.randint(100000, 999999))
            
            OTPVerification.objects.create(
                user=user,
                otp=otp,
                created_at=timezone.now(),
                purpose='password_reset'
            )
         
            send_mail(
                'DOCNET Doctor Password Reset OTP',
                f'Your OTP for password reset is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'OTP sent successfully',
                'user_id': user.id
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {'success': False, 'message': 'No doctor account found with this email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'success': False, 'message': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DoctorVerifyPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        entered_otp = request.data.get('otp')
        
        if not email or not entered_otp:
            return Response(
                {'error': 'Missing email or OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, role='doctor')
            try:
                otp_verification = OTPVerification.objects.get(
                    user=user, 
                    purpose='password_reset'
                )
                
                if timezone.now() > otp_verification.created_at + timezone.timedelta(minutes=5):
                    return Response(
                        {'error': 'OTP expired, please request a new one'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if str(otp_verification.otp) != str(entered_otp):
                    return Response(
                        {'error': 'Invalid OTP'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                return Response({
                    'success': True,
                    'message': 'OTP verified successfully',
                    'reset_token': 'generate_a_token_here_if_needed'
                })
                
            except OTPVerification.DoesNotExist:
                exists = OTPVerification.objects.filter(user=user).exists()
                return Response({
                    'error': 'No password reset OTP found for this user',
                    'details': {
                        'user_exists': True,
                        'any_otp_exists': exists,
                        'suggestion': 'Please request a new OTP'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class DoctorResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
       
        
        if not email or not new_password:
            return Response(
                {'error': 'Email and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, role='doctor')
          
            
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response(
                    {'error': e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.password = make_password(new_password)
            user.save()
            
            OTPVerification.objects.filter(user=user, purpose='password_reset').delete()
            
            return Response({
                'success': True,
                'message': 'Password reset successfully'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'No doctor account found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )