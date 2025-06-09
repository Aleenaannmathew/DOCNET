import React, { useState, useEffect } from 'react';
import { logout } from '../../store/authSlice';
import { 
  Menu, X, Users, UserRound, CalendarDays, CreditCard, BarChart3, 
  FileText, Settings, LogOut, MoreHorizontal, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, Download, Eye, Shield, ShieldOff,
  Clock, UserCheck, UserX, ChevronDown, MoreVertical, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminAxios } from '../../axios/AdminAxios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function DoctorsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);
  
  // State for doctors data
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patient-list' },
    { name: 'Doctors', icon: <UserRound size={20} />, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/admin/appointment-list' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payment-list' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' }
  ];

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await adminAxios.get('/doctors/');
        setDoctors(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load doctors. Please try again later.');
        console.error('Error fetching doctors: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await adminAxios.get('/doctors/');
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to refresh doctors. Please try again.');
      console.error('Error refreshing doctors: ', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Filter doctors for client-side filtering if needed
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && doctor.is_approved) ||
                         (statusFilter === 'pending' && doctor.is_approved === null && doctor.is_active) ||
                         (statusFilter === 'rejected' && doctor.is_approved === false) ||
                         (statusFilter === 'blocked' && !doctor.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats for the dashboard
  const stats = [
    { 
      title: 'Total Doctors', 
      value: doctors.length, 
      icon: <UserRound className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    { 
      title: 'Approved', 
      value: doctors.filter(d => d.is_approved === true).length,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50'
    },
    { 
      title: 'Pending', 
      value: doctors.filter(d => d.is_approved === null).length,
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bg: 'bg-yellow-50'
    },
    { 
      title: 'Blocked', 
      value: doctors.filter(d => !d.is_active).length,
      icon: <ShieldOff className="w-6 h-6 text-red-600" />,
      bg: 'bg-red-50'
    }
  ];

  const showConfirmationDialog = async (title, text, confirmButtonText = 'Confirm') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
  };

  const handleApprove = async (id, doctorName) => {
    const result = await showConfirmationDialog(
      'Approve Doctor',
      `Are you sure you want to approve ${doctorName}?`,
      'Approve'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await adminAxios.patch(`/doctors/${id}/approval/`, { action: 'approve' });
        
        setDoctors(prev =>
          prev.map(doc => doc.id === id ? { ...doc, is_approved: true } : doc)
        );
        
        Swal.fire(
          'Approved!',
          `${doctorName} has been approved successfully.`,
          'success'
        );
      } catch (err) {
        console.error('Error approving doctor:', err);
        Swal.fire(
          'Error!',
          'Failed to approve doctor.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleReject = async (id, doctorName) => {
    const result = await showConfirmationDialog(
      'Reject Doctor',
      `Are you sure you want to reject ${doctorName}? This action cannot be undone.`,
      'Reject'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await adminAxios.patch(`/doctors/${id}/approval/`, { action: 'reject' });
        
        setDoctors(prev =>
          prev.map(doc => doc.id === id ? { ...doc, is_approved: false } : doc)
        );
        
        Swal.fire(
          'Rejected!',
          `${doctorName} has been rejected.`,
          'success'
        );
      } catch (err) {
        console.error('Error rejecting doctor:', err);
        Swal.fire(
          'Error!',
          'Failed to reject doctor.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleBlock = async (id, currentStatus, doctorName) => {
    const action = currentStatus ? 'block' : 'unblock';
    const actionText = currentStatus ? 'block' : 'unblock';
    
    const result = await showConfirmationDialog(
      `${currentStatus ? 'Block' : 'Unblock'} Doctor`,
      `Are you sure you want to ${actionText} ${doctorName}?`,
      currentStatus ? 'Block' : 'Unblock'
    );
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await adminAxios.patch(`/doctors/${id}/block/`, { action });
        
        setDoctors(prev =>
          prev.map(doc => doc.id === id ? { ...doc, is_active: !currentStatus } : doc)
        );
        
        Swal.fire(
          'Success!',
          `Doctor has been ${actionText}ed successfully.`,
          'success'
        );
      } catch (err) {
        console.error(`Error ${actionText}ing doctor:`, err);
        Swal.fire(
          'Error!',
          `Failed to ${actionText} doctor.`,
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    const result = await showConfirmationDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Logout'
    );
    
    if (result.isConfirmed) {
      dispatch(logout());
      navigate('/admin/admin-login');
    }
  };

  const getStatusBadgeClass = (isApproved, isActive) => {
    if (!isActive) return 'bg-gray-100 text-gray-800 border border-gray-200';
    if (isApproved === true) return 'bg-green-100 text-green-800 border border-green-200';
    if (isApproved === false) return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  };
  
  const getStatusText = (isApproved, isActive) => {
    if (!isActive) return 'BLOCKED';
    if (isApproved === true) return 'APPROVED';
    if (isApproved === false) return 'REJECTED';
    return 'PENDING';
  };
  
  const getProfileImage = (doctor) => {
    if (doctor?.user?.profile_image) {
      return (
        <img 
          src={doctor.user.profile_image} 
          alt={doctor.name || 'Doctor'} 
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    
    const emoji = doctor.gender?.toLowerCase() === 'female' ? '👩‍⚕️' : '👨‍⚕️';
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
        {emoji}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-10
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-2xl font-bold text-blue-700">DOCNET</h2>
            <button className="p-1 rounded-full hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path || '#'}
                  className={`flex items-center w-full p-3 mx-2 rounded-lg transition-colors
                    ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Topbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <button 
              className="p-1 rounded-md hover:bg-gray-100 focus:outline-none lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold">Doctors Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Loader2 size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-700">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bg} p-4 rounded-lg shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-full bg-white">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search doctors by name, email or specialization..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="block w-full pl-10 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={16} className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Loading and Error States */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600">Loading doctors...</span>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
              <AlertCircle size={20} className="text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {/* No doctors found */}
          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <UserRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No doctors found</p>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
          
          {/* Table - Desktop */}
          {!loading && !error && filteredDoctors.length > 0 && (
            <>
              <div className="hidden md:block overflow-hidden bg-white shadow-sm rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDoctors.map((doctor, index) => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getProfileImage(doctor)}
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{doctor.name}</div>
                                <div className="text-sm text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{doctor.specialization}</div>
                            <div className="text-sm text-gray-500">{doctor.age} years, {doctor.gender}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.experience || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(doctor.is_approved, doctor.is_active)}`}>
                              {getStatusText(doctor.is_approved, doctor.is_active)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {doctor.is_approved === null && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(doctor.id, doctor.name)} 
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <CheckCircle size={16} className="mr-1" />
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReject(doctor.id, doctor.name)} 
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                                  >
                                    <XCircle size={16} className="mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => toggleBlock(doctor.id, doctor.is_active, doctor.name)} 
                                className={`px-3 py-1 ${doctor.is_active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded transition-colors flex items-center`}
                              >
                                {doctor.is_active ? (
                                  <>
                                    <ShieldOff size={16} className="mr-1" />
                                    Block
                                  </>
                                ) : (
                                  <>
                                    <Shield size={16} className="mr-1" />
                                    Unblock
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => navigate(`/admin/doctor/${doctor.id}`)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <Eye size={16} className="mr-1" />
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {paginatedDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-start mb-3">
                      {getProfileImage(doctor)}
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium">{doctor.specialization}</span>
                          <span className="text-gray-500 ml-2">{doctor.age} years, {doctor.gender}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(doctor.is_approved, doctor.is_active)}`}>
                        {getStatusText(doctor.is_approved, doctor.is_active)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Experience:</span> {doctor.experience || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Joined:</span> {new Date(doctor.joined_date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {doctor.is_approved === null && (
                        <>
                          <button 
                            onClick={() => handleApprove(doctor.id, doctor.name)} 
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(doctor.id, doctor.name)} 
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                          >
                            <XCircle size={16} className="mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => toggleBlock(doctor.id, doctor.is_active, doctor.name)} 
                        className={`px-3 py-1 ${doctor.is_active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white text-sm rounded transition-colors flex items-center`}
                      >
                        {doctor.is_active ? 'Block' : 'Unblock'}
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/doctor/${doctor.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredDoctors.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {filteredDoctors.length}
                  </span>{' '}
                  results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-2 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}