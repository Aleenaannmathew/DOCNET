from rest_framework import status
from django.views import View
import json, re
from django.core.mail import send_mail
from django.http import JsonResponse
import random, string, requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from .models import User,OTPVerification
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserLoginSerializer,PatientProfile,UserProfileUpdateSerializer
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from django.contrib.auth import login
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
            try:
                user = serializer.save()

              
                otp = str(random.randint(100000, 999999))
              
                OTPVerification.objects.update_or_create(
                    user=user,
                    defaults={'otp': otp, 'created_at': timezone.now()}
                )
                
                print(f"OTP generated for user {user.id}: {otp}")
               
                send_mail(
                    'Your OTP Code',
                    f'Your OTP is {otp}',
                    'noreply@docnet.com',
                    [user.email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': 'User registered successfully',
                    'user_id': user.id,
                    'email': user.email
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
                
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            entered_otp = request.data.get('otp')
            
            if not user_id or not entered_otp:
                return Response(
                    {'error': 'Missing user_id or OTP'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        
            try:
                user = User.objects.get(id=user_id)
                otp_verification = OTPVerification.objects.get(user=user)
                
              
                if timezone.now() > otp_verification.created_at + timezone.timedelta(minutes=1):
                    return Response(
                        {'error': 'OTP expired, please request a new one'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
              
                if str(otp_verification.otp) != str(entered_otp):
                    return Response(
                        {'error': 'Invalid OTP'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
              
                user.is_verified = True
                user.save()
                
           
                otp_verification.delete()
                
                return Response({
                    'success': True,
                    'message': 'OTP verified successfully',
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            except OTPVerification.DoesNotExist:
                return Response(
                    {'error': 'OTP record not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class ResendOTPView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            
           
            OTPVerification.objects.filter(user=user).delete()
            
          
            otp = str(random.randint(100000, 999999))
            
      
            OTPVerification.objects.create(
                user=user,
                otp=otp,
                created_at=timezone.now()
            )
            
            print(f"New OTP generated for user {user.id}: {otp}")
        
            send_mail(
                'Your DOCNET Verification Code',
                f'Your new OTP for DOCNET registration is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP resent successfully'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PatientProfileView(APIView):
    """
    View to retrieve the patient profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
           
            user = request.user
            
        
            patient_profile, created = PatientProfile.objects.get_or_create(user=user)
            
          
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
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": f"Error retrieving profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PatientProfileUpdateView(APIView):
    """
    View to update the patient profile
    """
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
                return Response(updated_data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {"detail": f"Error updating profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class CheckEmailView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        

        if not email or not re.match(r'^\S+@\S+\.\S+$', email):
            return Response(
                {'exists': False, 'message': 'Please enter a valid email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        exists = User.objects.filter(email=email, role='patient').exists()
        
        if exists:
            return Response({'exists': True}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'exists': False, 'message': 'No patient account found with this email address'},
                status=status.HTTP_400_BAD_REQUEST
            )

class SendPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        
      
        if not email or not re.match(r'^\S+@\S+\.\S+$', email):
            return Response(
                {'success': False, 'message': 'Please enter a valid email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, role='patient')         
            OTPVerification.objects.filter(user=user).delete()
            otp = str(random.randint(100000, 999999))
            
        
            OTPVerification.objects.create(
                user=user,
                otp=otp,
                created_at=timezone.now(),
                purpose='password_reset'
            )
         
            send_mail(
                'DOCNET Password Reset OTP',
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
                {'success': False, 'message': 'No patient account found with this email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'success': False, 'message': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class VerifyPasswordResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        entered_otp = request.data.get('otp')
        
        if not email or not entered_otp:
            return Response(
                {'error': 'Missing email or OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
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
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        
        if not email or not new_password:
            return Response(
                {'error': 'Email and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email, role='patient')
            
           
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
                {'error': 'No patient account found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
       
        if not check_password(old_password, request.user.password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
       
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response(
                {'error': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
        
       
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    def post(self, request):
        access_token = request.data.get('token')

        if not access_token:
            return Response({
                'error':'Access token is required',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            userinfo = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            ).json()

            if 'error' in userinfo:
                raise ValueError(userinfo['error'])
            
            email = userinfo['email']

            try:
                user = User.objects.get(email=email)

                if not user.is_verified:
                    user.is_verified = True
                    user.save()

                if user.role != 'patient':
                    return Response({
                        'error': 'This login is for patients only'
                    }, status=status.HTTP_400_BAD_REQUEST)

            except User.DoesNotExist:
                username = email.split('@')[0]
                base_username = username
                counter = 1

                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter +=1

                user = User.objects.create(
                    username=username,
                    email=email,
                    role='patient',
                    is_verified=True
                )          

                PatientProfile.objects.create(user=user)

            refresh = RefreshToken.for_user(user)

            try:
                patient_profile = PatientProfile.objects.get(user=user)
                is_profile_complete = patient_profile.age is not None
            except PatientProfile.DoesNotExist:
                is_profile_complete = False

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'is_profile_complete': is_profile_complete
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Authentication failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)          