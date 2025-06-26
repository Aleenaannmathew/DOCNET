import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, MapPin, Phone, Mail, User, CreditCard, FileText, Download, MessageCircle, Video, Star, Bell, LogOut, HelpCircle, Lock, History, HistoryIcon } from 'lucide-react';
import Navbar from './Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { userAxios } from '../../axios/UserAxios';
import { logout } from '../../store/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import VideoCallButton from '../Constants/VideoCallButton';
import ChatAccessButton from '../Constants/MessageButton';

export default function AppointmentDetails() {
  const [activeTab, setActiveTab] = useState('details');
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); 
  const {token} = useSelector((state)=>state.auth)
  const [slotId, setSlotId] = useState('');

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
        const response = await userAxios.get(`appointment-details/${id}`);
        if (response.data.success) {
          setAppointmentData(response.data.data);
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

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Change Password') {
      navigate('/new-password');
    } else if (tab === 'Profile Information') {
      navigate('/profile');
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await userAxios.post('/logout/', {
          refresh: refreshToken
        });
      }
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    const endTime = new Date(time.getTime() + (appointmentData?.duration || 30) * 60000);
    
    return `${time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const calculateTax = (amount) => {
    return (parseFloat(amount) * 0.18).toFixed(2); // Assuming 18% tax
  };

  const calculateServiceFee = (amount) => {
    return (parseFloat(amount) * 0.05).toFixed(2); // Assuming 5% service fee
  };

  const calculateSubtotal = (amount) => {
    const total = parseFloat(amount);
    const tax = parseFloat(calculateTax(amount));
    const serviceFee = parseFloat(calculateServiceFee(amount));
    return (total - tax - serviceFee).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointmentData) {
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
      {/* Header */}
      <Navbar/>

      <div className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  {appointmentData.patient_profile_image ? (
                    <img 
                      src={appointmentData.patient_profile_image} 
                      alt={appointmentData.patient_name} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {appointmentData.patient_name?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{appointmentData.patient_name}</h1>
                  <p className="text-gray-600 mb-2">{appointmentData.patient_email}</p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Patient
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Mobile Dropdown */}
              <div className="lg:hidden mb-6">
                <select 
                  className="w-full p-4 bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={activeTab}
                  onChange={(e) => {
                    if (e.target.value === 'Logout') {
                      handleLogout();
                    } else if (e.target.value === 'Change Password') {
                      navigate('/new-password');
                    } else if (e.target.value === 'Profile Information') {
                      navigate('/profile');
                    } else {
                      setActiveTab(e.target.value);
                    }
                  }}
                >
                  {sidebarItems.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Desktop Sidebar */}
              <div className="hidden lg:block bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 ${
                        activeTab === item.name 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${item.name === 'Logout' ? 'border-t border-gray-200' : ''}`}
                      onClick={() => handleTabClick(item.name)}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <HistoryIcon className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Appointment Information</h1>
                  </div>

                  {/* Appointment Header */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment #{appointmentData.id}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span className={`w-2 h-2 rounded-full ${appointmentData.status === 'scheduled' ? 'bg-orange-500' : appointmentData.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{getStatusText(appointmentData.status)}</span>
                          </span>
                          <span>#{appointmentData.payment_id}</span>
                          <span className="text-green-600 font-medium">${appointmentData.payment_amount}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4 md:mt-0">
                        {appointmentData.consultation_type === 'video' && appointmentData.status === 'scheduled' && (
                          <VideoCallButton slotId={appointmentData.slot_id} token={token} />
                        )}
                        <ChatAccessButton slotId={appointmentData.slot_id} />
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8">
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'details'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Appointment Details
                        </button>
                        <button
                          onClick={() => setActiveTab('doctor')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'doctor'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Doctor Information
                        </button>
                        <button
                          onClick={() => setActiveTab('payment')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'payment'
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">{formatDate(appointmentData.appointment_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium text-gray-900">{formatTime(appointmentData.appointment_time)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="font-medium text-gray-900 capitalize">{appointmentData.consultation_type}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Duration</p>
                              <p className="font-medium text-gray-900">{appointmentData.duration} minutes</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointmentData.status)}`}>
                                {getStatusText(appointmentData.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                              <p className="font-medium text-gray-900">#{appointmentData.id}</p>
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
                              <p className="font-medium text-gray-900">{appointmentData.patient_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{appointmentData.patient_email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{appointmentData.patient_phone}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Age</p>
                              <p className="font-medium text-gray-900">{appointmentData.patient_profile?.age || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Blood Group</p>
                              <p className="font-medium text-gray-900">{appointmentData.patient_profile?.blood_group || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Weight</p>
                              <p className="font-medium text-gray-900">{appointmentData.patient_profile?.weight ? `${appointmentData.patient_profile.weight} kg` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {appointmentData.slot_notes && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Notes</h3>
                          <p className="text-gray-900">{appointmentData.slot_notes}</p>
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
                              {appointmentData.doctor_info?.doctor_name?.charAt(0) || 'D'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Dr. {appointmentData.doctor_info?.doctor_name}</h3>
                                <p className="text-blue-600 font-medium">{appointmentData.doctor_info?.specialization}</p>
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
                              Dr. {appointmentData.doctor_info?.doctor_name} is a specialist in {appointmentData.doctor_info?.specialization} with {appointmentData.doctor_info?.experience} years of experience.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">🏥</span>
                                <span>{appointmentData.doctor_info?.hospital}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">🎓</span>
                                <span>Reg. ID: {appointmentData.doctor_info?.registration_id}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">⏰</span>
                                <span>{appointmentData.doctor_info?.experience} years experience</span>
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
                            <span className="font-medium">${calculateSubtotal(appointmentData.payment_amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="font-medium">${calculateServiceFee(appointmentData.payment_amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">${calculateTax(appointmentData.payment_amount)}</span>
                          </div>
                          <hr className="border-gray-200" />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total Amount</span>
                            <span className="text-green-600">${appointmentData.payment_amount}</span>
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
                              {appointmentData.payment_method || 'Online Payment'}
                            </p>
                            <p className="text-sm text-gray-500">Razorpay Payment Gateway</p>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                            <Download className="w-4 h-4" />
                            <span>Download Receipt</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID</span>
                            <span className="font-medium">{appointmentData.razorpay_payment_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID</span>
                            <span className="font-medium">{appointmentData.payment_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Date</span>
                            <span className="font-medium">{formatDate(appointmentData.payment_date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointmentData.payment_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {appointmentData.payment_status === 'success' ? 'Paid' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {appointmentData.status === 'scheduled' && (
                      <>
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Calendar className="w-4 h-4" />
                          <span>Reschedule</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                          <span>Cancel Appointment</span>
                        </button>
                      </>
                    )}
<button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      <Download className="w-4 h-4" />
                      <span>Download Details</span>
                    </button>
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