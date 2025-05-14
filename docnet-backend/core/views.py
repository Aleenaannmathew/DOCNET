from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from doctor.models import DoctorProfile
from .serializers import AdminLoginSerializer, AdminUserSerializer 
from django.shortcuts import get_object_or_404
from .serializers import DoctorProfileListSerializer, DoctorProfileDetailSerializer
from accounts.models import User, PatientProfile
from .serializers import PatientListSerializer, PatientDetailSerializer


class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = AdminLoginSerializer 
    
    def post(self, request):
       
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
       
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
       
        if not user.is_superuser and user.role != 'admin':
            return Response(
                {'error': 'You must be an admin to access this portal'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        
        refresh = RefreshToken.for_user(user)
        
        
        user_serializer = AdminUserSerializer(user)
        
       
        response_data = {
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

class AdminVerifyToken(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
      
        user = request.user
        
        if not user.is_superuser and user.role != 'admin':
            return Response(
                {'error': 'You must be an admin to access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
       
        user_serializer = AdminUserSerializer(user)
        
        return Response({
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    



class DoctorListView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
      
        doctors = DoctorProfile.objects.select_related('user').all()
        serializer = DoctorProfileListSerializer(doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DoctorDetailView(APIView):
  
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, doctor_id):
        doctor = get_object_or_404(DoctorProfile, id=doctor_id)
        serializer = DoctorProfileDetailSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DoctorApprovalView(APIView):
    """
    API endpoint for approving or rejecting doctor accounts
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, doctor_id):
        doctor = get_object_or_404(DoctorProfile, id=doctor_id)
        action = request.data.get('action')
        
        if action == 'approve':
            doctor.is_approved = True
            doctor.user.is_active = True 
            doctor.save()
            doctor.user.save()
            return Response(
                {'message': f'Doctor {doctor.user.username} has been approved'},
                status=status.HTTP_200_OK
            )
        elif action == 'reject':
            doctor.is_approved = False
            doctor.save()
            return Response(
                {'message': f'Doctor {doctor.user.username} has been rejected'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid action. Use "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
class DoctorBlockView(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, doctor_id):
        doctor = get_object_or_404(DoctorProfile, id=doctor_id)
        action = request.data.get('action')
        
        if action == 'block':
            doctor.user.is_active = False
            doctor.user.save()
            return Response(
                {'message': f'Doctor {doctor.user.username} has been blocked'},
                status=status.HTTP_200_OK
            )
        elif action == 'unblock':
            doctor.user.is_active = True
            doctor.user.save()
            return Response(
                {'message': f'Doctor {doctor.user.username} has been unblocked'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid action. Use "block" or "unblock"'},
                status=status.HTTP_400_BAD_REQUEST
            )    


class AdminPatientListView(APIView):
  
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
           
            patients = User.objects.filter(
                role='patient',
                is_verified=True
            ).select_related('patientprofile')
            
            serializer = PatientListSerializer(patients, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": f"Error retrieving patients: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PatientStatusToggleView(APIView):
   
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, patient_id):
        try:
          
            try:
                patient = User.objects.get(id=patient_id, role='patient')
            except User.DoesNotExist:
                return Response(
                    {"detail": "Patient not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
           
            is_active = request.data.get('is_active')
            
            if is_active is None:
                return Response(
                    {"detail": "is_active field is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
          
            patient.is_active = is_active
            patient.save()
            
            return Response({
                "id": patient.id,
                "username": patient.username,
                "is_active": patient.is_active
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": f"Error updating patient status: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PatientDetailView(APIView):
   
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, patient_id):
        try:
           
            try:
                patient = User.objects.get(id=patient_id, role='patient')
            except User.DoesNotExist:
                return Response(
                    {"detail": "Patient not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = PatientDetailSerializer(patient)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": f"Error retrieving patient details: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )        