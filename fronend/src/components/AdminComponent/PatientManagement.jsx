import React, { useState, useEffect } from 'react';
import { logout } from '../../store/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, X, Users, UserRound, CalendarDays, CreditCard, BarChart3, FileText, Settings, LogOut, Search, AlertTriangle } from 'lucide-react';
import { adminAxios } from '../../axios/AdminAxios';

export default function PatientsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patient-list' },
    { name: 'Doctors', icon: <UserRound size={20} />, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: <CalendarDays size={20} /> },
    { name: 'Payments', icon: <CreditCard size={20} /> },
    { name: 'Reports', icon: <FileText size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> }
  ];

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

  const handleToggleAccess = async (id, isBlocked) => {
    try {
      // Optimistically update UI
      setPatients(prev =>
        prev.map(patient =>
          patient.id === id
            ? {
                ...patient,
                is_active: !isBlocked,
                status: isBlocked ? 'Allowed' : 'Blocked'
              }
            : patient
        )
      );
      
      // Call API to update the user's blocked status
      await adminAxios.put(`/patients/${id}/toggle-status/`, {
        is_active: !isBlocked
      });
      
    } catch (error) {
      console.error('Error toggling patient access:', error);
      // Revert on error
      setPatients(prev => [...prev]);
      let errorMessage = 'Failed to update patient status. Please try again.';
    if (error.response) {
      if (error.response.status === 500) {
        errorMessage = 'Server error occurred. Please contact support.';
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      }
    }
    
    alert(errorMessage);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/admin-login');
  };

  const filteredPatients = patients.filter(patient =>
    patient.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-xl font-semibold">Patients Management</h1>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-700">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-semibold mb-4 md:mb-0">Patients</h2>
            
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
            </div>
          </div>
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 p-4 mb-6 rounded-lg border border-red-100 flex items-center text-red-700">
              <AlertTriangle size={20} className="mr-2" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              {/* Table - Desktop */}
              <div className="hidden md:block overflow-hidden bg-white shadow-sm rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients.map((patient, index) => (
                        <tr 
                          key={patient.id} 
                          className={`hover:bg-gray-50 ${!patient.is_active ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.date_joined ? new Date(patient.date_joined).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              {patient.profile_image ? 
                                <img src={patient.profile_image} alt={patient.username} className="w-8 h-8 rounded-full object-cover" /> :
                                <span>👤</span>
                              }
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{patient.username}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.patient_profile?.age || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.patient_profile?.gender || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              patient.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {patient.is_active ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleAccess(patient.id, patient.is_active)}
                              className={`px-3 py-1 text-xs font-medium rounded text-white ${
                                patient.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                              } transition-colors`}
                            >
                              {patient.is_active ? 'Block' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredPatients.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className={`bg-white p-4 rounded-lg shadow-sm ${!patient.is_active ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                          {patient.profile_image ? 
                            <img src={patient.profile_image} alt={patient.username} className="w-8 h-8 rounded-full object-cover" /> :
                            <span>👤</span>
                          }
                        </div>
                        <div>
                          <div className="font-medium">{patient.username}</div>
                          <div className="text-xs text-gray-500">{patient.email}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                      <div>
                        <span className="block text-gray-700 font-medium">Join Date</span>
                        {patient.date_joined ? new Date(patient.date_joined).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="block text-gray-700 font-medium">Age</span>
                        {patient.patient_profile?.age || 'N/A'}
                      </div>
                      <div>
                        <span className="block text-gray-700 font-medium">Gender</span>
                        {patient.patient_profile?.gender || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleToggleAccess(patient.id, patient.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded text-white ${
                          patient.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        } transition-colors`}
                      >
                        {patient.is_active ? 'Block' : 'Unblock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Empty state */}
          {!loading && filteredPatients.length === 0 && (
            <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg shadow-sm">
              <Users size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No patients found</h3>
              <p className="text-gray-500 mt-2 text-center">
                {searchTerm ? 'Try a different search term' : 'There are no registered patients yet'}
              </p>
            </div>
          )}
          
          {/* Pagination - add loading state checks */}
          {!loading && filteredPatients.length > 0 && (
            <div className="mt-6 flex items-center justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  &lt;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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