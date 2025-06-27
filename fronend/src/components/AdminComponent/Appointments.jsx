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
import AdminSidebar from './AdminSidebar';

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
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get('/appointments-list/', { 
        params: { 
          page, 
          page_size: pageSize,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          date_filter: dateFilter !== 'all' ? dateFilter : undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { data } = response;
      setAppointments(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));

      // Calculate stats from the full dataset (consider getting these from backend)
      const newStats = {
        total: data.count || 0,
        confirmed: 0,
        pending: 0,
        completed: 0,
      };
      
      (data.results || []).forEach(appointment => {
        switch ((appointment.status || '').toLowerCase()) {
          case 'confirmed': newStats.confirmed++; break;
          case 'pending': newStats.pending++; break;
          case 'completed': newStats.completed++; break;
          default: newStats.pending++; break;
        }
      });
      
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
  }, [page, searchTerm, statusFilter, dateFilter, token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon size={14} />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
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
    const patient = appointment.patient || {};
    const doctor = appointment.slot?.doctor || {};
    const slot = appointment.slot || {};

    const getPatientName = () => {
      if (patient.username) return patient.username;
      if (patient.first_name || patient.last_name) {
        return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
      }
      if (patient.name) return patient.name;
      return 'N/A';
    };

    const getDoctorName = () => {
      if (doctor.name) return doctor.name;
      if (doctor.user?.first_name && doctor.user?.last_name) {
        return `${doctor.user.first_name} ${doctor.user.last_name}`;
      }
      if (doctor.user?.first_name) return doctor.user.first_name;
      return 'N/A';
    };

    const getPatientEmail = () => {
      return patient.user?.email || patient.email || 'N/A';
    };

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {(page - 1) * pageSize + index + 1}
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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
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
                    onClick={() => {
                      setPage(1);
                      fetchAppointments();
                    }}
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

        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
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
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient, doctor, or email..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1); // Reset to first page when searching
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1); // Reset to first page when changing status filter
                      }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setPage(1); // Reset to first page when changing date filter
                      }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">Next 7 Days</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {appointments.length} of {stats.total} appointments
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {appointments.length === 0 ? (
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
                <>
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
                        {appointments.map((appointment, index) => (
                          <AppointmentRow
                            key={appointment.id}
                            appointment={appointment}
                            index={index}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(page * pageSize, stats.total)}</span> of{' '}
                          <span className="font-medium">{stats.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">First</span>
                            &laquo;
                          </button>
                          <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Next
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Last</span>
                            &raquo;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}