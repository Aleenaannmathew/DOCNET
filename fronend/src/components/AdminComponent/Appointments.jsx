import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, User, Stethoscope, Search, Filter, Download,
  CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon,
  Phone, Mail, MapPin, Eye, MoreVertical, RefreshCw, UserCheck,
  Clock3, Activity, Ban, CheckCheck, AlertTriangle, Menu, X,
  BarChart3, Users, UserRound, CalendarDays, CreditCard, FileText, Settings
} from 'lucide-react';

export default function AppointmentsList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: Users, path: '/admin/patient-list' },
    { name: 'Doctors', icon: UserRound, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: CalendarDays, path: '/admin/appointment-list' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payment-list' },
    { name: 'Reports', icon: FileText, path: '/admin/reports' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/admin-login');
    toast.success('Logged out successfully');
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get('/appointments-list/');
      console.log('API Response:', response.data); 
      setAppointments(response.data || []);
      
      // Calculate stats
      const appointmentData = response.data || [];
      const newStats = appointmentData.reduce((acc, appointment) => {
        acc.total++;
        switch (appointment.status?.toLowerCase()) {
          case 'confirmed':
            acc.confirmed++;
            break;
          case 'pending':
            acc.pending++;
            break;
          case 'completed':
            acc.completed++;
            break;
          case 'cancelled':
            acc.cancelled++;
            break;
          default:
            acc.pending++; // Default to pending if status is unclear
            break;
        }
        return acc;
      }, { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0 });
      
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments');
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
        toast.error('Your session has expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: CheckCircle
      },
      pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock3
      },
      completed: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCheck
      },
      cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: Ban
      }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon size={14} />
        {status || 'Pending'}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Handle both time formats - direct time string or full datetime
    let time;
    if (timeString.includes('T')) {
      time = new Date(timeString);
    } else {
      time = new Date(`2000-01-01T${timeString}`);
    }
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Extract patient and doctor info from nested structure
    const patient = appointment.patient;
    const doctor = appointment.slot?.doctor;
    const appointmentDate = appointment.slot?.date;
    
    const matchesSearch = searchTerm === '' || 
      patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status?.toLowerCase() === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      if (!appointmentDate) return false;
      
      const apptDate = new Date(appointmentDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      switch (dateFilter) {
        case 'today':
          return apptDate.toDateString() === today.toDateString();
        case 'tomorrow':
          return apptDate.toDateString() === tomorrow.toDateString();
        case 'week':
          return apptDate >= today && apptDate <= weekFromNow;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 border border-opacity-20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  const AppointmentRow = ({ appointment, index }) => {
    const patient = appointment.patient;
    const doctor = appointment.slot?.doctor;
    const slot = appointment.slot;
    
    // Helper function to get patient display name
    const getPatientName = () => {
  if (patient?.username) return patient.username;
  if (patient?.first_name || patient?.last_name) {
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
  }
  if (patient?.name) return patient.name;
  return 'N/A';
};

    // Helper function to get doctor display name
    const getDoctorName = () => {
      if (doctor?.name) return doctor.name;
      if (doctor?.user?.first_name && doctor?.user?.last_name) {
        return `${doctor.user.first_name} ${doctor.user.last_name}`;
      }
      if (doctor?.user?.first_name) return doctor.user.first_name;
      return 'N/A';
    };

    // Helper function to get patient email
    const getPatientEmail = () => {
      return patient?.user?.email || patient?.email || 'N/A';
    };

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {index + 1}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-semibold text-blue-700">
              {getPatientName().charAt(0) || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{getPatientName()}</p>
              <p className="text-sm text-gray-500">{getPatientEmail()}</p>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-lg">
              {doctor?.gender?.toLowerCase() === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{getDoctorName()}</p>
              <p className="text-sm text-gray-500">{doctor?.specialization || 'General'}</p>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <CalendarIcon size={16} className="text-gray-400" />
            {formatDate(slot?.date)}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <Clock size={16} className="text-gray-400" />
            {formatTime(slot?.start_time)}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(appointment.status)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center gap-2 justify-end">
            <Link
              to={`/admin/appointment/${appointment.id}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Eye size={16} />
              View
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(showActionMenu === appointment.id ? null : appointment.id)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={16} className="text-gray-400" />
              </button>
              
              {showActionMenu === appointment.id && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appointment.id);
                      toast.success('Appointment ID copied');
                      setShowActionMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Copy ID
                  </button>
                  <button
                    onClick={() => {
                      // Add export functionality
                      const appointmentData = {
                        id: appointment.id,
                        patient: getPatientName(),
                        doctor: getDoctorName(),
                        date: formatDate(slot?.date),
                        time: formatTime(slot?.start_time),
                        status: appointment.status
                      };
                      console.log('Export data:', appointmentData);
                      toast.success('Appointment data logged to console');
                      setShowActionMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Export Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DOCNET</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <Menu size={24} />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage all appointments</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchAppointments}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                  <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Appointments"
                value={stats.total}
                icon={Calendar}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                title="Confirmed"
                value={stats.confirmed}
                icon={CheckCircle}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={Clock3}
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCheck}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatCard
                title="Cancelled"
                value={stats.cancelled}
                icon={Ban}
                color="text-red-600"
                bgColor="bg-red-50"
              />
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient, doctor, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">Next 7 Days</option>
                    </select>
                  </div>
                </div>

                {/* Results count */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAppointments.length} of {appointments.length} appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No appointments have been scheduled yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((appointment, index) => (
                        <AppointmentRow
                          key={appointment.id}
                          appointment={appointment}
                          index={index}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}