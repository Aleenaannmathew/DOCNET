import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Save, X, ChevronDown, ChevronRight, CheckCircle, FileText, 
  User, Lock, Calendar, Stethoscope, Clipboard, Bell, HelpCircle, 
  LogOut, Search, Edit3, Shield, Award, MapPin, Globe, Clock, 
  Phone, Mail, Building2, Languages, Users, Heart, Filter,
  MoreVertical, Eye, MessageCircle, Video, CheckSquare, XCircle,
  Loader2, AlertCircle
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { doctorAxios } from '../../axios/DoctorAxios';

const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Appointments');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar menu items with modern icons
  const sidebarItems = [
    { name: 'Profile Information', icon: User, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { name: 'Change Password', icon: Lock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { name: 'Availability', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { name: 'Appointments', icon: Stethoscope, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
    { name: 'Patient Records', icon: Clipboard, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { name: 'Notifications', icon: Bell, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { name: 'Help & Support', icon: HelpCircle, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
    { name: 'Logout', icon: LogOut, color: 'text-red-400', bgColor: 'bg-red-500/10' }
  ];


  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorAxios.get('/doctor-appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAppointments();
    }
  }, [user, token]);

  // Process appointments data for display
  const processedAppointments = appointments.map(appointment => ({
    id: appointment.id,
    patient: {
      name: appointment.patient.username,
      age: appointment.profile?.age || 'N/A',
      avatar: appointment.profile?.profile_image || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patient.username)}&background=random&color=fff&size=128`,
      phone: appointment.patient.phone,
      email: appointment.patient.email
    },
    date: appointment.slot_date,
    time: formatTime(appointment.slot_time),
    type: 'Consultation', // Default type, you can modify based on your requirements
    status: appointment.status,
    complaint: appointment.profile?.medical_history || 'General consultation',
    duration: '30 min', // Default duration, you can modify based on your slot duration
    profile: appointment.profile,
    created_at: appointment.created_at
  }));

  // Helper function to format time
  function formatTime(timeString) {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  }

  // Filter appointments based on selected filter and search term
  const filteredAppointments = processedAppointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.complaint.toLowerCase().includes(searchTerm.toLowerCase());

    const today = new Date().toISOString().split('T')[0];
    
    switch (selectedFilter) {
      case 'today':
        return matchesSearch && appointment.date === today;
      case 'upcoming':
        return matchesSearch && ['confirmed', 'pending'].includes(appointment.status);
      case 'completed':
        return matchesSearch && appointment.status === 'completed';
      default:
        return matchesSearch;
    }
  });

  // Calculate filter counts
  const getFilterCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      all: processedAppointments.length,
      today: processedAppointments.filter(apt => apt.date === today).length,
      upcoming: processedAppointments.filter(apt => ['confirmed', 'pending'].includes(apt.status)).length,
      completed: processedAppointments.filter(apt => apt.status === 'completed').length
    };
  };

  const filterCounts = getFilterCounts();

  const filterButtons = [
    { key: 'all', label: 'All', count: filterCounts.all },
    { key: 'today', label: 'Today', count: filterCounts.today },
    { key: 'upcoming', label: 'Upcoming', count: filterCounts.upcoming },
    { key: 'completed', label: 'Completed', count: filterCounts.completed }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`;
  };

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Change Password'){
      navigate('/doctor/change-password', {
        state: {
          isDoctor: true,
          email: user.email
        },
        replace: true
      });
    } else if (tab === 'Availability'){
      navigate('/doctor/slots');
    } else if (tab === 'Profile Information'){
      navigate('/doctor/settings');
    } else {
      setActiveTab(tab);
      setMobileSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try{
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await doctorAxios.post('/logout/', {
          refresh: refreshToken
        });
      }
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/doctor-login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/doctor-login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center bg-white rounded-2xl p-8 shadow-2xl">
          <p className="mb-4 text-gray-700">Please log in to view your appointments</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">DOCNET</h1>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">PROFESSIONAL</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search patients, appointments..."
                className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">Dr. {user.username}</p>
                <p className="text-xs text-gray-500">{user?.doctor_profile?.specialization || 'Medical Professional'}</p>
              </div>
              <div className="relative">
                <img 
                  src={getProfileImageUrl()} 
                  alt={user.username} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Modern Dark Sidebar */}
        <aside className={`fixed lg:static z-40 w-72 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Profile Summary */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={getProfileImageUrl()} 
                    alt={user.username} 
                    className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Dr. {user.username}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="text-emerald-400 text-xs font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => handleTabClick(item.name)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                          activeTab === item.name 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                          activeTab === item.name ? 'bg-white/20' : item.bgColor
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            activeTab === item.name ? 'text-white' : item.color
                          }`} />
                        </div>
                        <span className="font-medium">{item.name}</span>
                        {activeTab === item.name && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600 mt-2">Manage your patient appointments and schedule</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                <button 
                  onClick={fetchAppointments}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Today</p>
                    <p className="text-2xl font-bold text-gray-900">{filterCounts.today}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-emerald-600">{filterCounts.upcoming}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{filterCounts.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-purple-600">{filterCounts.all}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {filterButtons.map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedFilter(filter.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedFilter === filter.key
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={fetchAppointments}
                    className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-3" />
                  <span className="text-gray-600">Loading appointments...</span>
                </div>
              </div>
            )}

            {/* Appointments List */}
            {!loading && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search or filter criteria.' : 'You don\'t have any appointments yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                src={appointment.patient.avatar}
                                alt={appointment.patient.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{appointment.patient.name}</h3>
                                <span className="text-sm text-gray-500">Age {appointment.patient.age}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1 capitalize">{appointment.status}</span>
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{appointment.complaint}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{appointment.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{appointment.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  <span>{appointment.patient.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  <span>{appointment.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    appointment.type === 'Video Call' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {appointment.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            {appointment.type === 'Video Call' && (
                              <button className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Video className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;