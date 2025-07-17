import random
import re
import requests
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from accounts.models import OTPVerification
from accounts.tasks import send_registration_otp_task, send_password_reset_otp_task
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class OTPManager:
    @staticmethod
    def generate_otp():
        return str(random.randint(100000,999999))
    
    @staticmethod
    def create_otp_verification(user, purpose='registration'):
        otp = OTPManager.generate_otp()
        OTPVerification.objects.update_or_create(
            user = user,
            defaults={
                'otp': otp,
                'created_at': timezone.now(),
                'purpose': purpose
            }
        )
        return otp
    
    @staticmethod
    def verify_otp(user, entered_otp, purpose='registration', expiry_minutes=5):
        try:
            otp_verification = OTPVerification.objects.get(
                user = user,
                purpose = purpose
            )

            if timezone.now() > otp_verification.created_at + timezone.timedelta(minutes=expiry_minutes):
                return { 'success': False, 'error': 'OTP expired, please request a new one'}
            
            if str(otp_verification.otp) != str(entered_otp):
                return { 'success': False, 'error': 'Invalid OTP'}
            
            return { 'success': True, 'otp_verification': otp_verification}
        
        except OTPVerification.DoesNotExist:
            return { 'success': False, 'error': 'OTP record not found'}
        
class EmailManager:
    @staticmethod
    def send_registration_otp(email, otp, user_type='user'):
        try:
            task = send_registration_otp_task.delay(email,otp)
            return True
        except Exception as e:
            logger.error(f"Failed to queue registration OTP email task: {str(e)}")
            return False
        
    @staticmethod
    def send_password_reset_otp(email, otp, user_type='user'):
        try:
            task = send_password_reset_otp_task.delay(email, otp)
            logger.info(f"Password reset OTP task queued for {email}, Task ID: {task.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to queue password reset OTP email task: {str(e)}")
            return False
        
class ValidationManager:
    @staticmethod
    def validate_email(email):
        if not email or not re.match(r'^\S+@\S+\.\S+$', email):
            return False
        return True
    
    @staticmethod
    def validate_new_password(password, user):
        try:
            validate_password(password, user)
            return {'valid': True}
        except ValidationError as e:
            return {'valid': False, 'errors': e.messages}
        
class PasswordManager:
    @staticmethod
    def verify_old_password(user, old_password):
        return check_password(old_password, user.password)
    
    @staticmethod
    def change_password(user, old_password, new_password):
        if not PasswordManager.verify_old_password(user, old_password):
            return { 'success': False, 'error': 'Current password is incorrect'}
        
        validation_result = ValidationManager.validate_new_password(new_password, user)
        if not validation_result['valid']:
            return { 'success': False, 'error': validation_result['errors']}
        
        user.set_password(new_password)
        user.save()

        return {'success': True, 'message': 'Password changes successfully'}
    
    @staticmethod
    def reset_password(user, new_password):
        validation_result = ValidationManager.validate_new_password(new_password, user)
        if not validation_result['valid']:
            return {'success': False, 'error': validation_result['errors']}
        
        user.password = make_password(new_password)
        user.save()

        OTPVerification.objects.filter(user=user, purpose='password_reset').delete()

        return { 'success': True, 'message': 'Password reset successfully'}
    
class GoogleAuthManager:
    @staticmethod
    def get_user_info(access_token):
        try:
            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            if response.status_code != 200:
                return {'success': False, 'error': 'Failed to fetch user info from Google.'}

            userinfo = response.json()

            if 'error' in userinfo:
                return {'success': False, 'error': userinfo['error']}

            return {'success': True, 'userinfo': userinfo}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    @staticmethod
    def generate_unique_username(email):
        username = email.split('@')[0]
        base_username = username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        return username 

    @staticmethod
    def create_jwt_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }


class UserManager:
    @staticmethod
    def check_user_exists(email, role):
        return User.objects.filter(email=email, role=role).exists()
    
    @staticmethod
    def get_user_by_email_and_role(email, role):
        try:
            return User.objects.get(email=email, role=role)
        except User.DoesNotExist:
            return None           
         
class ResponseManager:
    @staticmethod
    def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
        response_data = {}
        if data:
            response_data.update(data)
        if message:
            response_data['message'] = message
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error_response(error_message, status_code=status.HTTP_400_BAD_REQUEST, details=None):
        response_data = {'error': error_message}
        if details:
            response_data['details'] = details
        return Response(response_data, status=status_code)
    
    @staticmethod
    def validation_error_response(errors):
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)         