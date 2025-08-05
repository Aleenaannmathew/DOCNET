from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils import timezone
from itertools import chain
from django.core.paginator import Paginator
from itertools import chain
from collections import OrderedDict
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import TruncMonth
from doctor.models import DoctorProfile,Wallet
from .serializers import AdminLoginSerializer, AdminUserSerializer, PaymentListSerializer 
from django.shortcuts import get_object_or_404
from .serializers import DoctorProfileListSerializer, DoctorProfileDetailSerializer, AdminAppointmentListSerializer
from accounts.models import User, PatientProfile,Appointment,Payment,DoctorReport
from rest_framework_simplejwt.tokens import OutstandingToken, BlacklistedToken
from .serializers import PatientListSerializer, PatientDetailSerializer,DoctorEarningsSerializer,DoctorReports,UnifiedPaymentSerializer,EmergencyAppointmentSerializer,WithdrawalSerializer
from rest_framework_simplejwt.exceptions import TokenError
from django.db.models import Count, Sum, Q, F
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User, Appointment, Payment, EmergencyPayment
from doctor.models import DoctorProfile,Withdrawal,Wallet,WalletHistory
from decimal import Decimal
from datetime import timedelta
from reportlab.pdfgen import canvas
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
import csv
from rest_framework.generics import ListAPIView
from utilities.cashfree_payout import get_beneficiary_v2, create_beneficiary_v2, standard_transfer_v2
import uuid,logging,requests


logger = logging.getLogger(__name__)

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
        doctors = DoctorProfile.objects.select_related('user').annotate(
            unread_report_count=Count('reported_by', filter=Q(reported_by__is_read=False))
        )
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

        Appointment.objects.filter(
            status='scheduled',
            created_at__lte=threshold
        ).update(status='completed')

        search_term = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip().lower()
        date_filter = request.query_params.get('date_filter', '').strip().lower()

        normal_qs = Appointment.objects.select_related(
            'payment', 'payment__slot', 'payment__slot__doctor__user', 'payment__patient'
        ).all()

        emergency_qs = EmergencyPayment.objects.select_related(
            'doctor__user', 'patient'
        ).all()

        if search_term:
            normal_qs = normal_qs.filter(
                Q(payment__patient__username__icontains=search_term) |
                Q(payment__slot__doctor__user__first_name__icontains=search_term)
            )
            emergency_qs = emergency_qs.filter(
                Q(patient__username__icontains=search_term) |
                Q(doctor__user__first_name__icontains=search_term)
            )

        if status_filter and status_filter != 'all':
            normal_qs = normal_qs.filter(status=status_filter)
            emergency_qs = emergency_qs.filter(payment_status=status_filter)

        if date_filter and date_filter != 'all':
            today = timezone.now().date()
            if date_filter == 'today':
                normal_qs = normal_qs.filter(payment__slot__date=today)
                emergency_qs = emergency_qs.filter(timestamp__date=today)
            elif date_filter == 'tomorrow':
                tomorrow = today + timedelta(days=1)
                normal_qs = normal_qs.filter(payment__slot__date=tomorrow)
                emergency_qs = emergency_qs.filter(timestamp__date=tomorrow)
            elif date_filter == 'week':
                next_week = today + timedelta(days=7)
                normal_qs = normal_qs.filter(payment__slot__date__range=[today, next_week])
                emergency_qs = emergency_qs.filter(timestamp__date__range=[today, next_week])

        normal_data = AdminAppointmentListSerializer(normal_qs, many=True).data
        emergency_data = EmergencyAppointmentSerializer(emergency_qs, many=True).data

        for e in emergency_data:
            e["is_emergency"] = True
        for n in normal_data:
            n["is_emergency"] = False

        combined_data = sorted(
            chain(normal_data, emergency_data),
            key=lambda x: x.get("created_at", ""), reverse=True
        )

        page_size = int(request.query_params.get("page_size", 10))
        page_number = int(request.query_params.get("page", 1))
        paginator = Paginator(combined_data, page_size)
        page = paginator.page(page_number)

        return Response({
            "count": paginator.count,
            "results": list(page),
        })
    
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'detail': 'Not authorized'}, status=403)

        total_doctors = DoctorProfile.objects.count()
        total_patients = User.objects.filter(role='patient').count()
        total_appointments = Appointment.objects.count()

        total_normal_revenue = Payment.objects.filter(payment_status='success').aggregate(
            Sum('amount')
        )['amount__sum'] or Decimal('0')
        total_emergency_revenue = EmergencyPayment.objects.filter(payment_status='success').aggregate(
            Sum('amount')
        )['amount__sum'] or Decimal('0')

        total_revenue = total_normal_revenue + total_emergency_revenue
        admin_commission_rate = Decimal('0.10')
        admin_profit = total_revenue * admin_commission_rate

        
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

        today = timezone.now().date()
        last_7_days = [today - timedelta(days=i) for i in range(6,-1,-1,-1)]

        daily_profit = []

        for date in last_7_days:
            normal_amount = Payment.objects.filter(
                payment_status='success',
                timestamp__date = date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            normal_admin_profit = normal_amount * Decimal('0.10')

            emergency_amount = EmergencyPayment.objects.filter(
                payment_status='success',
                timestamp__date=date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            emergency_admin_profit = emergency_amount * Decimal('0.15')

            total_daily_profit = normal_admin_profit + emergency_admin_profit
            daily_profit.append({
                'date': date.strftime('%b %d'),
                'profit': float(total_daily_profit)
            })
        data = {
            'total_doctors': total_doctors,
            'total_patients': total_patients,
            'total_appointments': total_appointments,
            'total_revenue': float(total_revenue),
            'monthly_revenue': formatted_monthly_revenue,
            'admin_profit': float(admin_profit),
            'appointment_analytics': appointment_analytics,
            'daily_profit': daily_profit,
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

        normal_qs = Payment.objects.select_related('patient', 'slot__doctor__user').all()
        if status:
            normal_qs = normal_qs.filter(payment_status=status.lower())
        if search:
            normal_qs = normal_qs.filter(
                Q(patient__username__icontains=search) |
                Q(payment_id__icontains=search) |
                Q(slot__doctor__user__username__icontains=search)
            )

        emergency_qs = EmergencyPayment.objects.select_related('patient', 'doctor__user').all()
        if status:
            emergency_qs = emergency_qs.filter(payment_status=status.lower())
        if search:
            emergency_qs = emergency_qs.filter(
                Q(patient__username__icontains=search) |
                Q(payment_id__icontains=search) |
                Q(doctor__user__username__icontains=search)
            )

        combined = sorted(
            chain(normal_qs, emergency_qs),
            key=lambda x: x.timestamp,
            reverse=True
        )

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(combined, request)
        serializer = UnifiedPaymentSerializer(page, many=True)

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
        payments = Payment.objects.all().order_by('-created_at')[:50] 

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
    
class MarkReportAsReadView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, report_id):
        try:
            report = DoctorReport.objects.get(id=report_id)
            report.is_read = True
            report.save()
            return Response({'message': 'Report marked as read.'}, status=status.HTTP_200_OK)
        except DoctorReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminWithdrawalListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class AdminWithdrawalListAPIView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = WithdrawalSerializer
    pagination_class = AdminWithdrawalListPagination

    def get_queryset(self):
        Withdrawal.objects.filter(status='pending', payout_status='RECEIVED').update(status='completed')

        queryset = Withdrawal.objects.select_related('doctor__user').order_by('-requested_at')
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if status:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(doctor__user__username__icontains=search) |
                Q(doctor__user__first_name__icontains=search) |
                Q(doctor__user__last_name__icontains=search)
            )

        return queryset

        
class AdminWithdrawalActionView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        action_type = request.data.get('action')
        remarks = request.data.get('remarks', '')

        try:
            withdrawal = Withdrawal.objects.select_related('doctor__wallet', 'doctor__user').get(id=pk)
        except Withdrawal.DoesNotExist:
            return Response({'error': 'Withdrawal not found'}, status=404)

        if withdrawal.status != 'pending':
            return Response({'error': 'Already processed'}, status=400)

        if action_type == 'reject':
            withdrawal.status = 'rejected'
            withdrawal.processed_at = timezone.now()
            withdrawal.remarks = remarks or 'Rejected by admin'
            withdrawal.save()
            return Response({'message': 'Withdrawal rejected successfully'})

        elif action_type == 'approve':
            try:
                wallet = withdrawal.doctor.wallet
            except AttributeError:
                return Response({'error': 'Doctor wallet not found'}, status=400)

            if wallet.balance < withdrawal.amount:
                return Response({'error': 'Insufficient wallet balance'}, status=400)

            if not withdrawal.doctor.bank_account or not withdrawal.doctor.ifsc_code:
                return Response({'error': 'Doctor banking details not complete'}, status=400)

            beneficiary_id = withdrawal.doctor.beneficiary_id or f"dr_{withdrawal.doctor.id}"
            transfer_id = f"wd_{withdrawal.id}_{uuid.uuid4().hex[:6]}"

            try:
                with transaction.atomic():
                    beneficiary_exists = False
                    try:
                        if get_beneficiary_v2(beneficiary_id=beneficiary_id):
                            beneficiary_exists = True
                    except Exception:
                        pass

                    if not beneficiary_exists:
                        doctor_name = withdrawal.doctor.user.get_full_name() or withdrawal.doctor.user.username
                        beneficiary_data = {
                            "beneficiary_id": beneficiary_id,
                            "beneficiary_name": doctor_name,
                            "bank_account_number": withdrawal.doctor.bank_account,
                            "bank_ifsc": withdrawal.doctor.ifsc_code,
                            "beneficiary_email": withdrawal.doctor.user.email or "",
                            "beneficiary_phone": getattr(withdrawal.doctor, 'phone_number', "") or ""
                        }
                        try:
                            create_beneficiary_v2(beneficiary_data)
                            withdrawal.doctor.beneficiary_id = beneficiary_id
                            withdrawal.doctor.save()
                        except Exception as e:
                            logger.error(f"Create beneficiary failed: {e}")
                            return Response({'error': str(e)}, status=500)

                    payout_response = standard_transfer_v2(
                        transfer_id=transfer_id,
                        amount=withdrawal.amount,
                        beneficiary_id=beneficiary_id,
                        remarks=remarks or f"Withdrawal for {withdrawal.doctor.user.username}"
                    )

                    if not isinstance(payout_response, dict):
                        return Response({'error': 'Invalid response from Cashfree'}, status=500)

                    payout_status = payout_response.get('status', 'UNKNOWN')
                    payout_data = payout_response.get('data', {})

                    cashfree_reference = (
                        payout_response.get('cf_transfer_id') or
                        payout_response.get('cfTransferId') or
                        payout_response.get('referenceId') or
                        payout_data.get('cf_transfer_id') or
                        payout_data.get('referenceId') or
                        payout_data.get('utr')
                    )

                    if payout_status in ['SUCCESS', 'RECEIVED', 'ACCEPTED']:
                        final_status = 'completed'
                    elif payout_status in ['PENDING', 'PROCESSING']:
                        final_status = 'pending'
                    else:
                        return Response({
                            'error': f"Payout failed or unknown status: {payout_status}",
                            'payout_response': payout_response
                        }, status=500)

                    withdrawal.status = final_status
                    withdrawal.processed_at = timezone.now()
                    withdrawal.remarks = remarks or f'Processed via Cashfree ({payout_status})'
                    withdrawal.payout_reference_id = transfer_id
                    withdrawal.payout_status = payout_status
                    if hasattr(withdrawal, 'cashfree_reference_id') and cashfree_reference:
                        withdrawal.cashfree_reference_id = cashfree_reference
                    withdrawal.save()

                    if final_status == 'completed':
                        wallet.balance -= withdrawal.amount
                        wallet.save()
                        WalletHistory.objects.create(
                            wallet=wallet,
                            type=WalletHistory.DEBIT,
                            amount=withdrawal.amount,
                            new_balance=wallet.balance
                        )

                    return Response({
                        'message': f'Withdrawal {final_status} via Cashfree',
                        'cashfree_status': payout_status,
                        'transfer_id': transfer_id,
                        'reference': cashfree_reference
                    })

            except Exception as e:
                logger.exception(f"Withdrawal processing failed: {e}")
                return Response({'error': str(e)}, status=500)

        return Response({'error': 'Invalid action type'}, status=400)
