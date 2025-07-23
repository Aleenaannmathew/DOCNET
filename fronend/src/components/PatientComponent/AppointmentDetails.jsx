import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, MapPin, Phone, Mail, User, CreditCard, FileText, Download, MessageCircle, Video, Star, Bell, LogOut, HelpCircle, Lock, History, HistoryIcon, Zap, AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { userAxios } from '../../axios/UserAxios';
import { logout } from '../../store/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import VideoCallButton from '../Constants/VideoCallButton';
import ChatAccessButton from '../Constants/MessageButton';
import PatientSidebar from './SideBar';
import DocnetLoading from '../Constants/Loading';

export default function AppointmentDetails() {
  const [activeTab, setActiveTab] = useState('details');
  const [appointmentData, setAppointmentData] = useState(null);
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth)
  const [slotId, setSlotId] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const sidebarItems = [
    { name: 'Profile Information', icon: User },
    { name: 'Change Password', icon: Lock },
    { name: 'Booking History', icon: History },
    { name: 'Medical Records', icon: FileText },
    { name: 'Notifications', icon: Bell },
    { name: 'Help & Support', icon: HelpCircle },
    { name: 'Logout', icon: LogOut }
  ];

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);

        // First try to fetch as regular appointment
        try {
          const response = await userAxios.get(`appointment-details/${id}`);
          if (response.data.success) {
            setAppointmentData(response.data.data);
            setIsEmergency(false);
            return;
          }
        } catch (error) {
        }

        // If not a regular appointment, try emergency consultation
        const emergencyResponse = await userAxios.get(`emergency-consultation-details/${id}`);
        if (emergencyResponse.data) {
          setEmergencyData(emergencyResponse.data);
          setIsEmergency(true);
        } else {
          toast.error('Failed to fetch appointment details');
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        toast.error('Error loading appointment details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const handleDoctorClick = () => {
  if (appointmentData?.doctor_info?.slug) {
    navigate(`/doctor-details/${appointmentData.doctor_info.slug}`);
  }
};



  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEmergencyTimeRange = (startTime, endTime) => {
    if (!startTime) return 'Not started';
    const start = formatTime(startTime);
    const end = endTime ? formatTime(endTime) : 'Ongoing';
    return `${start} - ${end}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
      case 'success':
        return 'Completed';
      case 'cancelled':
      case 'failed':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const calculateTax = (amount) => {
    if (!amount) return '0.00';
    return (parseFloat(amount) * 0.18).toFixed(2);
  };

  const calculateServiceFee = (amount) => {
    if (!amount) return '0.00';
    return (parseFloat(amount) * 0.05).toFixed(2);
  };

  const calculateSubtotal = (amount) => {
    if (!amount) return '0.00';
    const total = parseFloat(amount);
    const tax = parseFloat(calculateTax(amount));
    const serviceFee = parseFloat(calculateServiceFee(amount));
    return (total - tax - serviceFee).toFixed(2);
  };

  if (loading) {
    return (
      <DocnetLoading/>
    );
  }

  if (!appointmentData && !emergencyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Appointment not found</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      /> */}
      {/* Header */}
      <Navbar />

      <div className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border ${isEmergency ? 'border-orange-200' : 'border-white/20'}`}>
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  {user?.profile_image ? (
                    <img
                      src={getProfileImageUrl()}
                      alt={user.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.username}</h1>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Patient
                    </span>
                    {isEmergency && (
                      <span className="ml-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Emergency Consultation
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                  {isEmergency ? (
                    <AlertTriangle className="text-white" size={20} />
                  ) : (
                    <Clock className="text-white" size={20} />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEmergency ? 'Emergency Consultation' : 'Appointment Details'}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border ${isEmergency ? 'border-orange-200' : 'border-white/20'} overflow-hidden`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      {isEmergency ? (
                        <Zap className="text-white" size={20} />
                      ) : (
                        <HistoryIcon className="text-white" size={20} />
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">
                      {isEmergency ? 'Emergency Consultation Details' : 'Appointment Information'}
                    </h1>
                  </div>

                  {/* Appointment Header */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {isEmergency ? 'Emergency Consultation' : 'Appointment'} #{isEmergency ? emergencyData.id : appointmentData.id}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span className={`w-2 h-2 rounded-full ${(isEmergency ? emergencyData.payment_status : appointmentData.status) === 'scheduled' ||
                                (isEmergency ? emergencyData.payment_status : appointmentData.status) === 'upcoming' ? 'bg-orange-500' :
                                (isEmergency ? emergencyData.payment_status : appointmentData.status) === 'completed' ||
                                  (isEmergency ? emergencyData.payment_status : appointmentData.status) === 'success' ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                            <span>{getStatusText(isEmergency ? emergencyData.payment_status : appointmentData.status)}</span>
                          </span>
                          <span>#{isEmergency ? emergencyData.payment_id : appointmentData.payment_id}</span>
                          <span className="text-green-600 font-medium">
                            Rs. {isEmergency ? emergencyData.amount : appointmentData.payment_amount}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4 md:mt-0">
                        {!isEmergency && appointmentData.consultation_type === 'video' && appointmentData.status === 'scheduled' && (
                          <VideoCallButton slotId={appointmentData.slot_id} token={token} />
                        )}
                        {isEmergency && emergencyData.payment_status === 'success' && !emergencyData.consultation_started && (
                          <button
                            onClick={() => navigate(`/emergency-consultation/${emergencyData.id}`)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            Start Consultation
                          </button>
                        )}
                        {isEmergency && emergencyData.consultation_started && !emergencyData.consultation_end_time && (
                          <button
                            onClick={() => navigate(`/emergency-consultation/${emergencyData.id}`)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Join Consultation
                          </button>
                        )}
                        <ChatAccessButton slotId={isEmergency ? emergencyData.id : appointmentData.slot_id} />
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8">
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {isEmergency ? 'Consultation Details' : 'Appointment Details'}
                        </button>
                        <button
                          onClick={() => setActiveTab('doctor')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'doctor'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          Doctor Information
                        </button>
                        <button
                          onClick={() => setActiveTab('payment')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'payment'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          Payment Details
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Appointment Info */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {isEmergency ? 'Emergency Consultation Information' : 'Appointment Information'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">
                                  {isEmergency ? formatDate(emergencyData.timestamp) : formatDate(appointmentData.appointment_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium text-gray-900">
                                  {isEmergency ?
                                    formatEmergencyTimeRange(emergencyData.consultation_start_time, emergencyData.consultation_end_time) :
                                    formatTime(appointmentData.appointment_time)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="font-medium text-gray-900 capitalize">
                                  {isEmergency ? 'Emergency Video Consultation' : appointmentData.consultation_type}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {!isEmergency && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Duration</p>
                                <p className="font-medium text-gray-900">{appointmentData.duration} minutes</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                isEmergency ? emergencyData.payment_status : appointmentData.status
                              )}`}>
                                {getStatusText(isEmergency ? emergencyData.payment_status : appointmentData.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                              <p className="font-medium text-gray-900">
                                #{isEmergency ? emergencyData.id : appointmentData.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient Information */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium text-gray-900">{user.username}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{user.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Age</p>
                              <p className="font-medium text-gray-900">{user.age || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Blood Group</p>
                              <p className="font-medium text-gray-900">{user.blood_group || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Weight</p>
                              <p className="font-medium text-gray-900">{user.weight ? `${user.weight} kg` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {!isEmergency && appointmentData.slot_notes && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Notes</h3>
                          <p className="text-gray-900">{appointmentData.slot_notes}</p>
                        </div>
                      )}
                      {isEmergency && emergencyData.reason && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Reason</h3>
                          <p className="text-gray-900">{emergencyData.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'doctor' && (
                    <div className="space-y-6">
                      {/* Doctor Profile */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                              {(isEmergency ? emergencyData.doctor_name : appointmentData.doctor_info?.doctor_name)?.charAt(0) || 'D'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h3
                                  onClick={handleDoctorClick}
                                  className="text-xl font-bold text-blue-700 hover:underline cursor-pointer"
                                >
                                  Dr. {isEmergency ? emergencyData.doctor_name : appointmentData.doctor_info?.doctor_name}
                                </h3>
                                <p className="text-blue-600 font-medium">
                                  {isEmergency ? emergencyData.specialization : appointmentData.doctor_info?.specialization}
                                </p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">(4.9) • 324 reviews</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                              Dr. {isEmergency ? emergencyData.doctor_name : appointmentData.doctor_info?.doctor_name} is a specialist in {isEmergency ? emergencyData.specialization : appointmentData.doctor_info?.specialization} with {isEmergency ? emergencyData.experience : appointmentData.doctor_info?.experience} years of experience.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">🏥</span>
                                <span>{isEmergency ? emergencyData.hospital : appointmentData.doctor_info?.hospital}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">🎓</span>
                                <span>Reg. ID: {isEmergency ? emergencyData.registration_id : appointmentData.doctor_info?.registration_id}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">⏰</span>
                                <span>{isEmergency ? emergencyData.experience : appointmentData.doctor_info?.experience} years experience</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'payment' && (
                    <div className="space-y-6">
                      {/* Payment Summary */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Consultation Fee</span>
                            <span className="font-medium">
                              Rs. {isEmergency ?
                                calculateSubtotal(emergencyData.amount) :
                                calculateSubtotal(appointmentData.payment_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="font-medium">
                              Rs. {isEmergency ?
                                calculateServiceFee(emergencyData.amount) :
                                calculateServiceFee(appointmentData.payment_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">
                              Rs. {isEmergency ?
                                calculateTax(emergencyData.amount) :
                                calculateTax(appointmentData.payment_amount)}
                            </span>
                          </div>
                          <hr className="border-gray-200" />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total Amount</span>
                            <span className="text-green-600">
                              Rs. {isEmergency ? emergencyData.amount : appointmentData.payment_amount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {isEmergency ?
                                (emergencyData.payment_method || 'Online Payment') :
                                (appointmentData.payment_method || 'Online Payment')}
                            </p>
                            <p className="text-sm text-gray-500">Razorpay Payment Gateway</p>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>

                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID</span>
                            <span className="font-medium">
                              {isEmergency ? emergencyData.razorpay_payment_id : appointmentData.razorpay_payment_id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID</span>
                            <span className="font-medium">
                              {isEmergency ? emergencyData.payment_id : appointmentData.payment_id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Date</span>
                            <span className="font-medium">
                              {formatDate(isEmergency ? emergencyData.timestamp : appointmentData.payment_date)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(isEmergency ? emergencyData.payment_status : appointmentData.payment_status) === 'success' ?
                                'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {(isEmergency ? emergencyData.payment_status : appointmentData.payment_status) === 'success' ? 'Paid' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {!isEmergency && appointmentData.status === 'scheduled' && (
                      <>


                      </>
                    )}
                    {isEmergency && emergencyData.payment_status === 'pending' && (
                      <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        <span>Complete Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}