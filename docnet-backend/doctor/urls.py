from django.urls import path
from .views import DoctorRegistrationView, DoctorLoginView, DoctorProfileRetrieveUpdateView, DoctorProfileUpdateView, DoctorChangePasswordView
from .views import DoctorCheckEmailView, DoctorSendPasswordResetOTPView, DoctorVerifyPasswordResetOTPView, DoctorResetPasswordView, GoogleLoginView

urlpatterns = [
    path('doctor-register/', DoctorRegistrationView.as_view(), name='doctor-register'),
    path('doctor-login/', DoctorLoginView.as_view(), name='doctor-login'),
    path('doctor-profile/', DoctorProfileRetrieveUpdateView.as_view(), name='doctor-profile'),
    path('doctor-profile/update', DoctorProfileUpdateView.as_view(), name='doctor-profile-update'),
    path('change-password/', DoctorChangePasswordView.as_view(), name='doctor-change-password'),
    path('check-email/', DoctorCheckEmailView.as_view(), name='doctor-check-email'),
    path('send-password-reset-otp/', DoctorSendPasswordResetOTPView.as_view(), name='doctor-send-password-reset-otp'),
    path('verify-password-reset-otp/', DoctorVerifyPasswordResetOTPView.as_view(), name='doctor-verify-password-reset-otp'),
    path('doctor-reset-password/', DoctorResetPasswordView.as_view(), name='doctor-reset-password'),
    path('google-login-doctor/', GoogleLoginView.as_view(), name='google-login-doctor')
]
