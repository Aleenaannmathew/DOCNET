import React, { useState, useEffect } from 'react';
import { logout } from '../../store/authSlice';
import { Menu, X, Users, UserRound, CalendarDays, CreditCard, BarChart3, FileText, Settings, LogOut, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminAxios } from '../../axios/AdminAxios';
import { toast } from 'react-toastify';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Using the adminAxios instance that already has authorization headers set up
      const response = await adminAxios.get(`/doctors/?page=${page}`);
      
      // Check if the response includes pagination info
      if (response.data.results) {
        setDoctors(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      } else {
        setDoctors(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
      
      // If unauthorized, logout and redirect
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
        toast.error('Your session has expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Load doctors on component mount and when page changes
  useEffect(() => {
    fetchDoctors();
  }, [page, token]);
  
  const handleApprove = async (id) => {
    try {
      await adminAxios.patch(`/doctors/${id}/approval/`, { action: 'approve' });
      
      // Update local state to reflect changes - only change is_approved to true
      setDoctors(prev =>
        prev.map(doc => doc.id === id ? { ...doc, is_approved: true } : doc)
      );
      
      toast.success('Doctor approved successfully');
    } catch (err) {
      console.error('Error approving doctor:', err);
      toast.error('Failed to approve doctor');
      
      // Handle unauthorized
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };
  
  const handleReject = async (id) => {
    try {
      await adminAxios.patch(`/doctors/${id}/approval/`, { action: 'reject' });
      
      // Update local state to reflect changes
      setDoctors(prev =>
        prev.map(doc => doc.id === id ? { ...doc, is_approved: false } : doc)
      );
      
      toast.success('Doctor rejected successfully');
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      toast.error('Failed to reject doctor');
      
      // Handle unauthorized
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };
  
  const toggleBlock = async (id, currentStatus) => {
    try {
      const action = currentStatus ? 'block' : 'unblock';
      
      await adminAxios.patch(`/doctors/${id}/block/`, { action });
      
      // Update local state to reflect changes
      setDoctors(prev =>
        prev.map(doc => doc.id === id ? { ...doc, is_active: !currentStatus } : doc)
      );
      
      toast.success(`Doctor ${action}ed successfully`);
    } catch (err) {
      console.error(`Error ${currentStatus ? 'blocking' : 'unblocking'} doctor:`, err);
      toast.error(`Failed to ${currentStatus ? 'block' : 'unblock'} doctor`);
      
      // Handle unauthorized
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/admin-login');
  };  
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patient-list' },
    { name: 'Doctors', icon: <UserRound size={20} />, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/admin/appointment-list' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payment-list' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' }
  ];

  const getStatusBadgeClass = (isApproved, isActive) => {
    if (!isActive) return 'bg-gray-100 text-gray-800'; // For blocked status
    if (isApproved === true) return 'bg-green-100 text-green-800';
    if (isApproved === false) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800'; // For pending status (null)
  };
  
  const getStatusText = (isApproved, isActive) => {
    if (!isActive) return 'BLOCKED';
    if (isApproved === true) return 'APPROVED';
    if (isApproved === false) return 'REJECTED';
    return 'PENDING';
  };
  
  const getProfileImage = (doctor) => {
    // Check if user and profile_image exist
    if (doctor?.user?.profile_image) {
      return (
        <img 
          src={doctor.user.profile_image} 
          alt={doctor.name} 
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    
    // Default emoji based on gender
    const emoji = doctor.gender?.toLowerCase() === 'female' ? '👩‍⚕️' : '👨‍⚕️';
    
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
        {emoji}
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
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
          
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path || '#'}
                className={`flex items-center w-full p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="mt-auto p-4 border-t">
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
            <div className="flex items-center">
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
       
          
          {/* Loading and Error States */}
          {loading && (
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center">
              <div className="text-blue-600">Loading doctors...</div>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
              <AlertCircle size={20} className="text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {/* No doctors found */}
          {!loading && !error && doctors.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No doctors found in the system.</p>
            </div>
          )}
          
          {/* Table - Desktop */}
          {!loading && !error && doctors.length > 0 && (
            <div className="hidden md:block overflow-hidden bg-white shadow-sm rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
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
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getProfileImage(doctor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.age || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.gender || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(doctor.is_approved, doctor.is_active)}`}>
                            {getStatusText(doctor.is_approved, doctor.is_active)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {doctor.is_approved === null && (
                              <>
                                <button 
                                  onClick={() => handleApprove(doctor.id)} 
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(doctor.id)} 
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => toggleBlock(doctor.id, doctor.is_active)} 
                              className={`px-3 py-1 ${doctor.is_active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded transition-colors`}
                            >
                              {doctor.is_active ? 'Block' : 'Unblock'}
                            </button>
                            <button 
                              onClick={() => navigate(`/admin/doctor/${doctor.id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Mobile Cards */}
          {!loading && !error && doctors.length > 0 && (
            <div className="md:hidden space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    {getProfileImage(doctor)}
                    <div className="ml-3">
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.email}</div>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(doctor.is_approved, doctor.is_active)}`}>
                        {getStatusText(doctor.is_approved, doctor.is_active)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Age:</span> {doctor.age || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span> {doctor.gender || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {doctor.is_approved === null && (
                      <>
                        <button 
                          onClick={() => handleApprove(doctor.id)} 
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(doctor.id)} 
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                        >
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => toggleBlock(doctor.id, doctor.is_active)} 
                      className={`px-3 py-1 ${doctor.is_active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white text-sm rounded transition-colors`}
                    >
                      {doctor.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/doctor/${doctor.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <MoreHorizontal size={16} className="mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          {/* Pagination */}
          {!loading && !error && doctors.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium 
                    ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Previous</span>
                  &lt;
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium
                      ${page === index + 1 ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium 
                    ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Next</span>
                  &gt;
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

        