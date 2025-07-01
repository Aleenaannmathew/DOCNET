import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { userAxios } from '../../axios/UserAxios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Lock,
  History,
  Bell,
  HelpCircle,
  LogOut,
  FileText,
  Loader,
  AlertTriangle,
  Zap
} from 'lucide-react';
import PatientSidebar from './SideBar';

const BookingHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('Booking History');
  const [bookings, setBookings] = useState([]);
  const [emergencyConsultations, setEmergencyConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bookingsPerPage = 5;

  // Fetch booking data from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        // Fetch regular appointments
        const appointmentsResponse = await userAxios.get('/patient-bookings/');

        // Fetch emergency consultations
        const emergencyResponse = await userAxios.get('/emergency-consultations/');

        // Transform regular appointment data
        const transformedBookings = appointmentsResponse.data.map(booking => ({
          id: booking.id,
          doctorName: booking.doctor_name,
          specialty: booking.specialty || 'General Practice',
          date: booking.slot_date,
          time: `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
          status: mapStatus(booking.status),
          type: 'In-person',
          location: booking.location || 'Medical Center',
          paymentStatus: booking.payment_status,
          amount: booking.amount,
          createdAt: booking.created_at,
          isEmergency: false
        }));

        // Transform emergency consultation data
        const transformedEmergencies = emergencyResponse.data.map(consultation => ({
          id: consultation.id,
          doctorName: consultation.doctor_name,
          specialty: consultation.specialty || 'Emergency Consultation',
          date: consultation.timestamp,
          time: consultation.consultation_start_time ?
            `${formatDateTime(consultation.consultation_start_time)} - ${formatDateTime(consultation.consultation_end_time || 'Ongoing')}` :
            'Not started',
          status: mapEmergencyStatus(consultation.payment_status, consultation.consultation_started),
          type: 'Emergency Video',
          location: 'Online',
          notes: consultation.reason || 'Emergency consultation',
          paymentStatus: consultation.payment_status,
          amount: consultation.amount,
          createdAt: consultation.timestamp,
          isEmergency: true,
          consultationStarted: consultation.consultation_started,
          consultationStartTime: consultation.consultation_start_time,
          consultationEndTime: consultation.consultation_end_time
        }));

        setBookings([...transformedBookings, ...transformedEmergencies]);
        setError(null);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load booking history');
        toast.error('Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'patient') {
      fetchBookings();
    }
  }, [user]);

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to format datetime
  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return '';
    const date = new Date(datetimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to map API status to component status
  const mapStatus = (apiStatus) => {
    const statusMap = {
      'pending': 'upcoming',
      'confirmed': 'upcoming',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'no_show': 'cancelled'
    };
    return statusMap[apiStatus] || 'upcoming';
  };

  // Helper function to map emergency consultation status
  const mapEmergencyStatus = (paymentStatus, consultationStarted) => {
    if (paymentStatus === 'success') {
      return consultationStarted ? 'completed' : 'upcoming';
    }
    return paymentStatus === 'pending' ? 'upcoming' : 'cancelled';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'upcoming':
        return '⏰';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your booking history</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'patient') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to patients</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Home
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

      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
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
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
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
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <History className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Booking History</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Booking History Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <History className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Your Appointments</h1>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by doctor, specialty, or booking ID..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="p-6">
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                      <span className="text-gray-600">Loading your bookings...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">⚠</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
                      <p className="text-gray-500 mb-4">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Bookings List */}
                {!loading && !error && (
                  <div className="p-6">
                    {currentBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">
                          {filteredBookings.length === 0 && bookings.length > 0
                            ? "Try adjusting your search or filter criteria."
                            : "You haven't made any appointments yet."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentBookings.map((booking) => (
                          <div key={booking.id} className={`border-2 ${booking.isEmergency ? 'border-orange-200' : 'border-gray-100'} rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200`}>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  {booking.isEmergency && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Emergency
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    <span className="mr-1">{getStatusIcon(booking.status)}</span>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                  <span className="text-sm font-medium text-gray-500">#{booking.id}</span>
                                  {booking.amount && (
                                    <span className="text-sm font-medium text-green-600">₹{booking.amount}</span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <User className="w-4 h-4 text-blue-500" />
                                      <span className="font-semibold text-gray-900">{booking.doctorName}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 ml-6">{booking.specialty}</p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                                      <MapPin className="w-4 h-4 text-gray-400" />
                                      <span>{booking.location}</span>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Calendar className="w-4 h-4 text-green-500" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {booking.isEmergency ? formatDate(booking.consultationStartTime || booking.createdAt) : formatDate(booking.date)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2 ml-6">
                                      <Clock className="w-4 h-4 text-orange-500" />
                                      <span className="text-sm text-gray-600">{booking.time}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-6">
                                      <span className="font-medium">Type:</span> {booking.type}
                                    </div>
                                    {booking.paymentStatus && (
                                      <div className="text-sm text-gray-600 ml-6 mt-1">
                                        <span className="font-medium">Payment:</span>
                                        <span className={`ml-1 capitalize ${booking.paymentStatus === 'completed' || booking.paymentStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                                          {booking.paymentStatus}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {booking.notes && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium text-blue-800">Notes:</span> {booking.notes}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                                {booking.status === 'upcoming' && booking.isEmergency && booking.paymentStatus === 'success' && (
                                  <button
                                    onClick={() => navigate(`/emergency-consultation/${booking.id}`)}
                                    className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 transform hover:scale-105"
                                  >
                                    Start Consultation
                                  </button>
                                )}

                                {booking.status === 'upcoming' && !booking.isEmergency && (
                                  <button
                                    className="px-4 py-2 text-sm font-medium text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                                  >
                                    Reschedule
                                  </button>
                                )}

                                {/* View Report should always be shown */}
                                <button
                                  onClick={() => booking.isEmergency ?
                                    navigate(`/emergency-consultation-details/${booking.id}`) :
                                    navigate(`/booking-details/${booking.id}`)}
                                  className="px-4 py-2 text-sm font-medium text-green-600 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
                                >
                                  View Report
                                </button>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${currentPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'border-2 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingHistoryPage;