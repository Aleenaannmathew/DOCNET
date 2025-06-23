from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retires=3)
def send_email_task(self,subject,message,recipient_list,from_email=None):
    try:
        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL

        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )    
        logger.info(f"Email sent successfully to {recipient_list}")
        return f"Email sent successfully to {recipient_list}"
    except Exception as exc:
        logger.error(f"Email sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown = 60* (2**self.request.retries))
    
@shared_task(bind=True, max_retries=2)
def send_registration_otp_task(self, email, otp):
    try:
        subject = 'DOCNET - User Email Verification'
        message = f'Your OTP for DOCNET registration is: {otp}'

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )    
        logger.info(f"Registration OTP send successfully to {email}")
        return f"Registration OTP send to {email}"
    
    except Exception as exc:
        logger.error(f"Registration OTP sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60*(2**self.request.retries))
    
@shared_task(bind=True, max_retires=3)
def send_password_reset_otp_task(self,email,otp):
    try:
        subject = 'DOCNET - Password Reset OTP'
        message = f'Your OTP for password reset is: {otp}'

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"Password reset OTP sent successfully to {email}")
        return f"Password reset OTP sent to {email}"
    except Exception as exc:
        logger.error(f"Password reset OTP sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
    
       