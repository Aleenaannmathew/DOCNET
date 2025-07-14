from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils import timezone
from collections import OrderedDict
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import TruncMonth
from doctor.models import DoctorProfile,Wallet
from .serializers import AdminLoginSerializer, AdminUserSerializer, PaymentListSerializer 
from django.shortcuts import get_object_or_404
from .serializers import DoctorProfileListSerializer, DoctorProfileDetailSerializer, AdminAppointmentListSerializer
from accounts.models import User, PatientProfile,Appointment,Payment,DoctorReport
from rest_framework_simplejwt.tokens import OutstandingToken, BlacklistedToken
from .serializers import PatientListSerializer, PatientDetailSerializer,DoctorEarningsSerializer,DoctorReports
from rest_framework_simplejwt.exceptions import TokenError
from django.db.models import Count, Sum, Q, F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User, Appointment, Payment, EmergencyPayment
from doctor.models import DoctorProfile
from decimal import Decimal
from datetime import timedelta
from reportlab.pdfgen import canvas
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
import csv


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
            
            if not is_active and patient.is_active:
                tokens = OutstandingToken.objects.filter(user=patient)
                for token in tokens:
                    BlacklistedToken.objects.get_or_create(token=token)
                    
            
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
        
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100        

class AdminAppointmentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        threshold = now - timedelta(minutes=30)

        # Auto-update outdated scheduled appointments
        Appointment.objects.filter(
            status='scheduled',
            created_at__lte=threshold
        ).update(status='completed')

        # Get filter parameters from request
        search_term = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip().lower()
        date_filter = request.query_params.get('date_filter', '').strip().lower()

        # Base queryset
        queryset = Appointment.objects.select_related(
            'payment', 'payment__slot', 'payment__slot__doctor__user',
            'payment__patient'
        ).order_by('-created_at')

        # Apply filters
        if search_term:
            queryset = queryset.filter(
                Q(payment__patient__user__first_name__icontains=search_term) |
                Q(payment__patient__user__last_name__icontains=search_term) |
                Q(payment__patient__user__email__icontains=search_term) |
                Q(payment__slot__doctor__user__first_name__icontains=search_term) |
                Q(payment__slot__doctor__user__last_name__icontains=search_term) |
                Q(payment__slot__doctor__user__email__icontains=search_term)
            )

        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status__iexact=status_filter)

        if date_filter and date_filter != 'all':
            today = timezone.now().date()
            if date_filter == 'today':
                queryset = queryset.filter(payment__slot__date=today)
            elif date_filter == 'tomorrow':
                tomorrow = today + timedelta(days=1)
                queryset = queryset.filter(payment__slot__date=tomorrow)
            elif date_filter == 'week':
                next_week = today + timedelta(days=7)
                queryset = queryset.filter(
                    payment__slot__date__range=[today, next_week]
                )

      
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = AdminAppointmentListSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'detail': 'Not authorized'}, status=403)

        total_doctors = DoctorProfile.objects.count()
        total_patients = User.objects.filter(role='patient').count()
        total_appointments = Appointment.objects.count()

        total_normal_revenue = Payment.objects.filter(payment_status='success').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_emergency_revenue = EmergencyPayment.objects.filter(payment_status='success').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

        total_revenue = total_normal_revenue + total_emergency_revenue
        admin_profit = total_revenue * Decimal('0.1')

        
        months_list = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
        monthly_revenue = OrderedDict((month, 0) for month in months_list)

        
        normal_payments = Payment.objects.filter(payment_status='success') \
            .annotate(month=TruncMonth('timestamp')) \
            .values('month') \
            .annotate(total=Sum('amount'))

     
        emergency_payments = EmergencyPayment.objects.filter(payment_status='success') \
            .annotate(month=TruncMonth('timestamp')) \
            .values('month') \
            .annotate(total=Sum('amount'))

       
        for payment in normal_payments:
            if payment['month']:
                month_name = payment['month'].strftime('%B')
                monthly_revenue[month_name] += float(payment['total'])

        
        for payment in emergency_payments:
            if payment['month']:
                month_name = payment['month'].strftime('%B')
                monthly_revenue[month_name] += float(payment['total'])

       
        formatted_monthly_revenue = [{'month': month, 'revenue': revenue} for month, revenue in monthly_revenue.items()]

        
        appointments_per_month = Appointment.objects.annotate(month=TruncMonth('created_at')) \
            .values('month') \
            .annotate(count=Count('id')) \
            .order_by('month')

        appointment_analytics = [
            {'month': item['month'].strftime('%B'), 'appointments': item['count']}
            for item in appointments_per_month if item['month']
        ]

        data = {
            'total_doctors': total_doctors,
            'total_patients': total_patients,
            'total_appointments': total_appointments,
            'total_revenue': float(total_revenue),
            'monthly_revenue': formatted_monthly_revenue,
            'admin_profit': float(admin_profit),
            'appointment_analytics': appointment_analytics,
            'trends': {
                'total_doctors_change': '+2.5%',
                'total_patients_change': '+1.8%',
                'total_appointments_change': '+3.2%',
                'total_revenue_change': '+4.7%',
            },
            'recent_activities': [
                {'title': 'New Doctor Registered', 'description': 'Dr. Smith added to the platform', 'time': '2 hours ago', 'status': 'info'},
                {'title': 'Appointment Completed', 'description': 'Patient John Doe completed consultation', 'time': '5 hours ago', 'status': 'success'},
                {'title': 'Payment Received', 'description': 'Payment from patient Jane Doe', 'time': '1 day ago', 'status': 'success'},
            ]
        }

        return Response(data)

    

class AdminPaymentHistoryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        status = request.query_params.get('status')
        search = request.query_params.get('search')

        queryset = Payment.objects.select_related('patient', 'slot__doctor__user').all()

        if status:
            queryset = queryset.filter(payment_status=status.lower())

        if search:
            queryset = queryset.filter(
                Q(patient__username__icontains=search) |
                Q(payment_id__icontains=search) |
                Q(slot__doctor__user__username__icontains=search)
            )

        queryset = queryset.order_by('-timestamp')

       
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PaymentListSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)
    
class DoctorEarningsReportAPIView(APIView):
    permission_classes = [IsAdminUser]  

    def get(self, request):
        wallets = Wallet.objects.select_related('doctor', 'doctor__user').all()
        serializer = DoctorEarningsSerializer(wallets, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })  

class AdminPaymentCSVExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Query all payments (or apply filters if required)
        payments = Payment.objects.all().order_by('-created_at')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="payment_history.csv"'

        writer = csv.writer(response)
        writer.writerow(['Payment ID', 'Patient', 'Doctor', 'Amount', 'Method', 'Date', 'Time', 'Status'])

        for payment in payments:
            writer.writerow([
                payment.payment_id,
                payment.patient.username,
                payment.doctor.user.username,
                payment.amount,
                payment.payment_method,
                payment.created_at.strftime('%Y-%m-%d'),
                payment.created_at.strftime('%H:%M'),
                payment.payment_status
            ])

        return response

class AdminPaymentPDFExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        payments = Payment.objects.all().order_by('-created_at')[:50]  # Limiting to latest 50 for PDF

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="payment_history.pdf"'

        p = canvas.Canvas(response)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(100, 800, "Admin Payment History")

        y = 770
        p.setFont("Helvetica", 10)

        for payment in payments:
            p.drawString(50, y, f"{payment.payment_id} | {payment.patient.username} | {payment.doctor.user.username} | Rs.{payment.amount} | {payment.payment_status}")
            y -= 20
            if y < 50:
                p.showPage()
                y = 800

        p.showPage()
        p.save()
        return response

class DoctorReportsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, doctor_id):
        reports = DoctorReport.objects.filter(doctor_id=doctor_id)
        serializer = DoctorReports(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)