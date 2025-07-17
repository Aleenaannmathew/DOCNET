from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.utils.timezone import localtime
from accounts.models import Notification,Appointment

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
        return f"Email sent successfully to {recipient_list}"
    except Exception as exc:
        logger.error(f"Email sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown = 60* (2**self.request.retries))
    
@shared_task(bind=True, max_retries=2)
def send_registration_otp_task(self, email, otp):
    try:
        subject = 'Complete Your DOCNET Registration – Verify Your Email'
        message = f"""
        Hi there,

        Thank you for signing up with DOCNET – your trusted telehealth partner.

        To complete your registration, please verify your email by entering the following OTP:

        🔐 OTP: {otp}

        This OTP is valid for 10 minutes. If you didn’t request this, you can safely ignore this email.

        Best regards,  
        The DOCNET Team
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )    
        return f"Registration OTP send to {email}"
    
    except Exception as exc:
        logger.error(f"Registration OTP sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60*(2**self.request.retries))
    
@shared_task(bind=True, max_retires=3)
def send_password_reset_otp_task(self,email,otp):
    try:
        subject = 'DOCNET – Your Password Reset Code'
        message = f"""
            Hi,

            We received a request to reset your password for your DOCNET account.

            Please use the OTP below to proceed:

            🔐 OTP: {otp}

            This OTP is valid for 10 minutes. If you did not request this, no action is needed.

            Stay safe,  
            The DOCNET Team
            """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return f"Password reset OTP sent to {email}"
    except Exception as exc:
        logger.error(f"Password reset OTP sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
  
@shared_task
def send_appointment_day_notifications():
    local_now = localtime()
    today = local_now.date()  
    appointments = Appointment.objects.filter(
        status='scheduled',
        payment__slot__date=today,
        notification_sent=False 
    )
    channel_layer = get_channel_layer()

    for appointment in appointments:
        patient = appointment.payment.patient
        doctor = appointment.payment.slot.doctor.user

        notification = Notification.objects.create(
            sender=doctor,
            receiver=patient,
            message=f"Reminder: You have an appointment today at {appointment.payment.slot.start_time}.",
            notification_type='consultation'
        )
  
        async_to_sync(channel_layer.group_send)(
            f'notifications_{patient.id}',
            {
                'type': 'send_notification',
                'message': notification.message,
                'notification_type': notification.notification_type,
                'sender': notification.sender.username,
            }
        )

        appointment.notification_sent = True
        appointment.save()