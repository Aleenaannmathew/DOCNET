from django.urls import path
from .views import UserRegistrationView, UserLoginView, VerifyOTPView, ResendOTPView, PatientProfileView,PatientProfileUpdateView, CheckEmailView,SendPasswordResetOTPView, VerifyPasswordResetOTPView, GoogleLoginView
from .views import ResetPasswordView, ChangePasswordView, UserLogoutView, DoctorListView, DoctorDetailView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(),name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='verify_otp'),
    path('user-profile/', PatientProfileView.as_view(), name='patient_profile'),
    path('user-profile/update/', PatientProfileUpdateView.as_view(), name='patient_profile_update'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('send-password-reset-otp/', SendPasswordResetOTPView.as_view(), name='send_password_reset_otp'),
    path('verify-password-reset-otp/', VerifyPasswordResetOTPView.as_view(), name='verify-password-reset-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('doctors-list/',DoctorListView.as_view(), name='doctors-list' ),
    path('doctor-details/<slug:slug>/', DoctorDetailView.as_view(), name='doctor-details'),
]