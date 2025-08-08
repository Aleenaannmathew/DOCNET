import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
    CheckCircle,
    Calendar,
    Clock,
    User,
    Stethoscope,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Download,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { userAxios } from '../../axios/UserAxios';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import DocnetLoading from '../Constants/Loading';

export default function AppointmentConfirmation() {
    const [searchParams] = useSearchParams();
    const { payment_id: urlPaymentId } = useParams(); 
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useSelector(state => state.auth); // Get token from Redux

    // Get payment_id from URL params first, then fallback to query params
    const paymentId = urlPaymentId || searchParams.get('payment_id');

   

    useEffect(() => {

        if (!paymentId) {
            setError('Payment ID is missing');
            setLoading(false);
            return;
        }
        
        if (!token) {
            setError('Authentication required');
            navigate('/login');
            return;
        }
        
        fetchBookingConfirmation();
    }, [paymentId, token]); // Add token to dependency array

    const fetchBookingConfirmation = async () => {
        try {
            setLoading(true);

            // Don't check localStorage, use the token from Redux state
            if (!token) {
                setError('Authentication required');
                navigate('/login');
                return;
            }

            
  
            const response = await userAxios.get(`booking-confirmation/payment/${paymentId}/`);

            if (response.data && response.data.success) {
                setBookingData(response.data.data);
            } else if (response.data) {
                // Handle case where API doesn't return success flag
                setBookingData(response.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching booking confirmation:', err);
            if (err.response) {
                // Server responded with error status
                const errorMessage = err.response.data?.message ||
                    err.response.data?.error ||
                    `Server error: ${err.response.status}`;
                setError(errorMessage);
            } else if (err.request) {
                // Network error
                setError('Network error - please check your connection');
            } else {
                // Other error
                setError(err.message || 'Failed to fetch booking confirmation');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const downloadReceipt = () => {
        
    };

    const addToCalendar = () => {
        if (!bookingData) return;

        const startDate = new Date(`${bookingData.appointment_date}T${bookingData.appointment_time}`);
        const endDate = new Date(`${bookingData.appointment_date}T${bookingData.appointment_end_time}`);

        const event = {
            title: `Doctor Appointment - Dr. ${bookingData.doctor_name}`,
            start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
            end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
            description: `Consultation with Dr. ${bookingData.doctor_name} (${bookingData.doctor_specialization})`
        };

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`;
        window.open(calendarUrl, '_blank');
    };

    if (loading) {
        return (
            <DocnetLoading/>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Loading Confirmation</h1>
                        <p className="text-lg text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Go to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!bookingData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
                    <p className="text-lg text-gray-600">Your appointment has been successfully booked</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Appointment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Information */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Doctor Information</h2>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="relative">
                                    
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-xl font-semibold text-gray-900">Dr. {bookingData.doctor_name}</h3>
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-blue-600 font-medium mb-2">{bookingData.doctor_specialization}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{bookingData.doctor_hospital}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span>⭐ {bookingData.doctor_experience} years exp.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <User className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="text-gray-900 font-medium">{bookingData.patient_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                    <p className="text-gray-900 font-medium">{bookingData.patient_phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Reason</label>
                                    <p className="text-gray-900 font-medium">{bookingData.reason}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-gray-900 font-medium">{bookingData.patient_email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Schedule */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Appointment Schedule</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Date</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDate(bookingData.appointment_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Time</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatTime(bookingData.appointment_time)}
                                        </p>
                                        <p className="text-sm text-gray-600">{bookingData.duration} minutes session</p>
                                    </div>
                                </div>
                            </div>

                            {/* Consultation Type */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Consultation Type</span>
                                    <span className="text-sm font-semibold text-gray-900 capitalize">
                                        {bookingData.consultation_type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        {bookingData.appointment_instructions && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Appointment Instructions</h3>
                                <p className="text-blue-700 mb-3">{bookingData.appointment_instructions.message}</p>
                                {bookingData.appointment_instructions.requirements && (
                                    <ul className="space-y-1 text-sm text-blue-700">
                                        {bookingData.appointment_instructions.requirements.map((req, index) => (
                                            <li key={index}>• {req}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Details */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Consultation Fee</span>
                                    <span className="font-semibold text-gray-900">₹{bookingData.slot_fee}</span>
                                </div>
                                <hr className="my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                                    <span className="text-xl font-bold text-green-600">₹{bookingData.payment_amount}</span>
                                </div>
                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">
                                            Payment {bookingData.payment_status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-700 mt-1">
                                        Transaction ID: {bookingData.razorpay_payment_id || bookingData.payment_id}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Method: {bookingData.payment_method}
                                    </p>
                                </div>
                            </div>
                        </div>

                        

                        {/* Appointment ID */}
                        <div className="bg-gray-900 text-white rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2">Booking Reference</h3>
                            <p className="text-2xl font-mono font-bold text-blue-400">
                                {bookingData.booking_reference}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">Keep this ID for your records</p>
                        </div>
                    </div>
                </div>


                {/* Back to Dashboard */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </main>
        </div>
    );
}