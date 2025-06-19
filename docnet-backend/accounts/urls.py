from django.urls import path
from .views import UserRegistrationView, UserLoginView, VerifyOTPView, ResendOTPView, PatientProfileView,PatientProfileUpdateView, CheckEmailView,SendPasswordResetOTPView, VerifyPasswordResetOTPView, GoogleLoginView,BookingConfirmationByPaymentView
from .views import ResetPasswordView, ChangePasswordView, UserLogoutView, DoctorListView, DoctorDetailView, DoctorSlotsView, CreatePaymentView, VerifyPaymentView, BookingHistoryView,AppointmentDetailView, ValidateVideoCallAPI,EmergencyDoctorListView
from.views import CreateEmergencyPaymentView, VerifyEmergencyPaymentView
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
    path('doctor-slots/<slug:slug>/', DoctorSlotsView.as_view(), name='doctor-slots'),
    path('payments/create/', CreatePaymentView.as_view(), name='create-payment'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('patient-bookings/', BookingHistoryView.as_view(), name='patient-booking-history'),
    path('appointment-details/<int:appointment_id>',AppointmentDetailView.as_view(), name='appointment-details'),
    path('validate-videocall/<int:slot_id>/', ValidateVideoCallAPI.as_view(), name='validate_videocall'),
    path('booking-confirmation/payment/<str:payment_id>/',BookingConfirmationByPaymentView.as_view(),name='booking-confirmation-by-payment'),
    path('emergency-doctors/', EmergencyDoctorListView.as_view(), name='emergency-doctors'),
    path('emergency-payments/create/', CreateEmergencyPaymentView.as_view(), name='create-emergency-payment'),
    path('emergency-payments/verify/', VerifyEmergencyPaymentView.as_view(), name='verify-emergency-payment'),
   
]