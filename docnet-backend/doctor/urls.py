from django.urls import path
from . import views
from .views import DoctorRegistrationView, DoctorLoginView, DoctorProfileRetrieveUpdateView, DoctorProfileUpdateView, DoctorChangePasswordView
from .views import DoctorCheckEmailView, DoctorSendPasswordResetOTPView, DoctorVerifyPasswordResetOTPView, DoctorResetPasswordView, GoogleLoginView, DoctorLogoutView, DoctorSlotCreate, DoctorSlotUpdate, AvailableSlotsView, DoctorBookedPatientsView, DoctorWalletView
from .views import DoctorAppointmentDetailView,EmergencyStatusUpdateView,DoctorEmergencyConsultationListView,EmergencyConsultationDetailView,start_emergency_consultation,end_emergency_consultation,DoctorDashboardView
from .views import DoctorAnalyticsView, DoctorCSVExportView,DoctorPDFExportView,MedicalRecordAPIView,DoctorNotificationListView,MarkNotificationAsReadView,DoctorWalletWithdrawView

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
    path('google-login-doctor/', GoogleLoginView.as_view(), name='google-login-doctor'),
    path('doctor-logout/', DoctorLogoutView.as_view(), name='doctor-logout'),
    path('slots/', DoctorSlotCreate.as_view(), name='doctor-slots'),
    path('slots/<int:pk>/', DoctorSlotUpdate.as_view(), name='doctor-slot-detail'),
    path('slots/available/', AvailableSlotsView.as_view(), name='available-slots'),
    path('doctor-appointments', DoctorBookedPatientsView.as_view(), name='doctor-appointments'),
    path('appointments/<int:appointment_id>/', DoctorAppointmentDetailView.as_view(), name='doctor-appointment-detail'),
    path('doctor-wallet/', DoctorWalletView.as_view(), name='doctor-wallet'),
    path('doctor-emergency-status/',EmergencyStatusUpdateView.as_view(), name='update_emergency_status'),
    path('dashboard/',DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('doctor-analytics/',DoctorAnalyticsView.as_view(), name='doctor-analytics'),
    path('doctor-csv/',DoctorCSVExportView.as_view(), name='doctor-csv'),
    path('doctor-pdf/',DoctorPDFExportView.as_view(), name='doctor-pdf'),
    path('medical-record/<int:appointment_id>/', MedicalRecordAPIView.as_view(), name='medical-record'),
    path('doctor-notifications/', DoctorNotificationListView.as_view(), name='doctor-notifications'),
    path('doctor-notifications/<int:notification_id>/mark-read/', MarkNotificationAsReadView.as_view(), name='mark-notification-read'),
    path('doctor-wallet/withdraw/', DoctorWalletWithdrawView.as_view(), name='doctor_withdraw'),
    path('emergency-consultations/', 
         DoctorEmergencyConsultationListView.as_view(), 
         name='doctor-emergency-consultations'),
    
    path('emergency-consultations/<int:id>/', 
         EmergencyConsultationDetailView.as_view(), 
         name='emergency-consultation-detail'),
    
    path('emergency-consultations/<int:consultation_id>/start/', 
         views.start_emergency_consultation, 
         name='start-emergency-consultation'),
    
    path('emergency-consultations/<int:consultation_id>/end/', 
         views.end_emergency_consultation, 
         name='end-emergency-consultation'),
]
