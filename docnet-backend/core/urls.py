from django.urls import path
from .views import AdminLoginView, AdminVerifyToken, DoctorListView, DoctorDetailView, DoctorApprovalView, DoctorBlockView, AdminPatientListView, PatientDetailView, PatientStatusToggleView


urlpatterns = [
    path('admin-login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin-verify-token/', AdminVerifyToken.as_view(), name='admin_verify_token'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('doctors/<int:doctor_id>/', DoctorDetailView.as_view(), name='doctor_detail'),
    path('doctors/<int:doctor_id>/approval/', DoctorApprovalView.as_view(), name='doctor_approval'),
    path('doctors/<int:doctor_id>/block/', DoctorBlockView.as_view(), name='doctor_block'),
    path('patients/list/', AdminPatientListView.as_view(), name='admin-patient-list'),
    path('patients/<int:patient_id>/', PatientDetailView.as_view(), name='admin-patient-detail'),
    path('patients/<int:patient_id>/toggle-status/', PatientStatusToggleView.as_view(), name='admin-patient-toggle-status'),
  
]
