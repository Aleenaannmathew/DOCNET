import React, { useState, useEffect } from 'react';
import { logout } from '../../store/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Menu, X, Users, UserRound, CalendarDays, CreditCard, BarChart3, 
  FileText, Settings, LogOut, Search, Filter, Download, Plus,
  Eye, Shield, ShieldOff, AlertCircle, Clock, Mail, User,
  Calendar, ChevronLeft, ChevronRight, MoreVertical, RefreshCw
} from 'lucide-react';
import { adminAxios } from '../../axios/AdminAxios';
import AdminSidebar from './AdminSidebar';

// SweetAlert2 (simulated with modern modal)
const Swal = {
  fire: ({ title, text, icon, showCancelButton, confirmButtonText, cancelButtonText, confirmButtonColor, cancelButtonColor }) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
      
      const iconColors = {
        warning: 'text-amber-500',
        error: 'text-red-500',
        success: 'text-green-500',
        info: 'text-blue-500'
      };
      
      const iconBgs = {
        warning: 'bg-amber-50',
        error: 'bg-red-50',
        success: 'bg-green-50',
        info: 'bg-blue-50'
      };
      
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform animate-scale-in">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconBgs[icon]} mb-4">
              <svg class="h-8 w-8 ${iconColors[icon]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icon === 'warning' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>' : ''}
                ${icon === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' : ''}
                ${icon === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' : ''}
                ${icon === 'info' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>' : ''}
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
            <p class="text-sm text-gray-600 mb-6">${text}</p>
            <div class="flex ${showCancelButton ? 'justify-between' : 'justify-center'} gap-3">
              ${showCancelButton ? `<button id="cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">${cancelButtonText}</button>` : ''}
              <button id="confirm-btn" class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" style="background-color: ${confirmButtonColor}">${confirmButtonText}</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const confirmBtn = modal.querySelector('#confirm-btn');
      const cancelBtn = modal.querySelector('#cancel-btn');
      
      confirmBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve({ isConfirmed: true });
      };
      
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          document.body.removeChild(modal);
          resolve({ isConfirmed: false });
        };
      }
      
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve({ isConfirmed: false });
        }
      };
    });
  }
};

export default function PatientsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
 

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await adminAxios.get('/patients/list/');
        setPatients(response.data);    
        setError(null);
      } catch (err) {
        setError('Failed to load patients. Please try again later.');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await adminAxios.get('/patients/list/');
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to refresh patients. Please try again.');
      console.error('Error refreshing patients:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleStatus = async (patient) => {
    const action = patient.is_active ? 'block' : 'unblock';
    const actionText = action === 'block' ? 'Block' : 'Unblock';
    
    const result = await Swal.fire({
      title: `${actionText} Patient?`,
      text: `Are you sure you want to ${action} ${patient.username}? ${action === 'block' ? 'They will lose access to their account.' : 'They will regain access to their account.'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'block' ? '#dc2626' : '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Optimistically update UI
        setPatients(prev =>
          prev.map(p =>
            p.id === patient.id
              ? { ...p, is_active: !patient.is_active }
              : p
          )
        );
        
        await adminAxios.put(`/patients/${patient.id}/toggle-status/`, {
          is_active: !patient.is_active
        });
        
        await Swal.fire({
          title: 'Success!',
          text: `Patient has been ${action}ed successfully.`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#16a34a'
        });
        
      } catch (error) {
        console.error('Error toggling patient status:', error);
        
        // Revert on error
        setPatients(prev =>
          prev.map(p =>
            p.id === patient.id
              ? { ...p, is_active: patient.is_active }
              : p
          )
        );
        
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to update patient status. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };


  // Filter and pagination logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && patient.is_active) ||
                         (selectedStatus === 'blocked' && !patient.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.is_active).length,
    blocked: patients.filter(p => !p.is_active).length
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and monitor patient accounts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-medium text-sm">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <ShieldOff className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blocked Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.blocked}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}

            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center text-red-700">
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading patients...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Patients Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demographics</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedPatients.map((patient, index) => (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {patient.profile_image ? 
                                  <img src={patient.profile_image} alt={patient.username} className="w-10 h-10 rounded-lg object-cover" /> :
                                  patient.username.charAt(0).toUpperCase()
                                }
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{patient.username}</div>
                                <div className="text-sm text-gray-500">Patient ID: #{patient.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail size={16} className="mr-2 text-gray-400" />
                              {patient.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Age: {patient.patient_profile?.age || 'N/A'}</div>
                            <div>Gender: {patient.patient_profile?.gender || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={16} className="mr-2" />
                              {patient.date_joined ? new Date(patient.date_joined).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {patient.is_active ? (
                                <>
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                                  Active
                                </>
                              ) : (
                                <>
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1"></div>
                                  Blocked
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleStatus(patient)}
                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                  patient.is_active 
                                    ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
                                    : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                                }`}
                              >
                                {patient.is_active ? (
                                  <>
                                    <ShieldOff size={14} className="mr-1" />
                                    Block
                                  </>
                                ) : (
                                  <>
                                    <Shield size={14} className="mr-1" />
                                    Unblock
                                  </>
                                )}
                              </button>
                              <button 
                                // onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {paginatedPatients.map((patient) => (
                    <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {patient.profile_image ? 
                              <img src={patient.profile_image} alt={patient.username} className="w-10 h-10 rounded-lg object-cover" /> :
                              patient.username.charAt(0).toUpperCase()
                            }
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{patient.username}</div>
                            <div className="text-sm text-gray-500">ID: #{patient.id}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.is_active ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                              Active
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1"></div>
                              Blocked
                            </>
                          )}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          <span>{patient.email}</span>
                        </div>
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <span>Age: {patient.patient_profile?.age || 'N/A'} • {patient.patient_profile?.gender || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          <span>Joined: {patient.date_joined ? new Date(patient.date_joined).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(patient)}
                            className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              patient.is_active 
                                ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
                                : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            {patient.is_active ? (
                              <>
                                <ShieldOff size={14} className="mr-1" />
                                Block
                              </>
                            ) : (
                              <>
                                <Shield size={14} className="mr-1" />
                                Unblock
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/patient-details/${patient.id}`)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty State */}
              {paginatedPatients.length === 0 && !loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Users size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                    <p className="text-gray-500 max-w-sm">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                        : 'No patients have been registered yet. New patients will appear here once they sign up.'
                      }
                    </p>
                    {(searchTerm || selectedStatus !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                          setCurrentPage(1);
                        }}
                        className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{filteredPatients.length}</span>{' '}
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
            </>
          )}
        </main>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}