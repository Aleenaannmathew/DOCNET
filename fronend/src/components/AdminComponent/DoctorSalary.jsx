import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp, Eye, Check, X, Clock, DollarSign } from 'lucide-react';
import { adminAxios } from '../../axios/AdminAxios';
import AdminSidebar from './AdminSidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const DoctorEarningsReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorEarnings, setDoctorEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('earnings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Get token from Redux store
  const { token } = useSelector((state) => state.auth);

  // Fetch doctor earnings from the API
  useEffect(() => {
  const fetchDoctorEarnings = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get('/doctor-earnings/');
      if (response.data.status === 'success') {
        setDoctorEarnings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctor earnings:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load doctor earnings data.',
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    fetchDoctorEarnings();
  }
}, [token]);


  // Fetch withdrawal requests
  const fetchWithdrawals = async (url = '/admin-withdrawals/') => {
  setLoading(true);
  try {
    const res = await adminAxios.get(url);
    setWithdrawals(res.data.results);
    setNextPage(res.data.next);
    setPrevPage(res.data.previous);
  } catch (error) {
    console.error('Fetch withdrawals error:', error);
    toast.error(
      error.response?.data?.message || 'Failed to load withdrawal requests. Please try again later.',
      toastOptions
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token]);

  const handleAction = async (id, actionType) => {
  let remarks = '';
  if (actionType === 'reject') {
    remarks = prompt('Enter reason for rejection:');
    if (!remarks) {
      toast.warning('Rejection cancelled', toastOptions);
      return;
    }
  }

  try {
    setLoading(true);
    const response = await adminAxios.post(`/admin-withdrawal/${id}/action/`, {
      action: actionType,
      remarks: remarks,
    });

    // Success toast with specific message
    toast.success(
      `Withdrawal request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`, 
      toastOptions
    );

    // Update state without re-fetching
    setWithdrawals(prev =>
      prev.map(w =>
        w.id === id ? { ...w, status: actionType } : w
      )
    );

  } catch (error) {
    console.error('Withdrawal action error:', error);

    let errorMessage = 'Action failed. Please try again.';
    if (error.response) {
      // Handle specific error messages from server if available
      errorMessage = error.response.data.message || 
                    error.response.data.error || 
                    errorMessage;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    }

    toast.error(errorMessage, toastOptions);
  } finally {
    setLoading(false);
  }
};


  // Calculate total revenue
  const totalRevenue = doctorEarnings.reduce((sum, doctor) => sum + parseFloat(doctor.total_earnings || 0), 0);

  // Calculate withdrawal statistics
  const totalWithdrawalRequests = withdrawals.length;
  const pendingWithdrawals = withdrawals.filter(req => req.status === 'pending').length;
  const completedWithdrawals = withdrawals.filter(req => req.status === 'approved').length;
  const rejectedWithdrawals = withdrawals.filter(req => req.status === 'rejected').length;
  const totalWithdrawalAmount = withdrawals
    .filter(req => req.status === 'pending')
    .reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);
  const totalCompletedAmount = withdrawals
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);

  // Filter doctors based on search
  const filteredDoctors = doctorEarnings.filter((doctor) => {
    return doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter withdrawal requests
  const filteredWithdrawals = withdrawals.filter((request) => {
    const matchesSearch = (request.doctor_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusIcons = {
      pending: <Clock size={14} />,
      approved: <Check size={14} />,
      rejected: <X size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Show loading or no token message
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="w-full flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="text-gray-500 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Earnings & Withdrawals</h1>
              <p className="text-gray-600 mt-1">Comprehensive earnings analysis and withdrawal management</p>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-green-500">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Withdrawal Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{totalWithdrawalRequests}</p>
                </div>
                <div className="text-blue-500">
                  <Eye size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingWithdrawals}</p>
                </div>
                <div className="text-orange-500">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{totalWithdrawalAmount.toLocaleString()}</p>
                </div>
                <div className="text-purple-500">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('earnings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'earnings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Doctor Earnings
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'withdrawals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Withdrawal Requests
                </button>
              </nav>
            </div>

            {/* Filters and Search */}
            <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={activeTab === 'earnings' ? "Search doctors..." : "Search by email..."}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'withdrawals' && (
                <div className="w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'earnings' ? (
            /* Earnings Table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map((doctor, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(doctor.total_earnings || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{parseFloat(doctor.available_balance || doctor.total_earnings || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Withdrawal Requests Table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No withdrawal requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((request, index) => (
                        <tr key={request.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.doctor_email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{parseFloat(request.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(request.request_date || request.updated_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' && request.payout_status !== 'success' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAction(request.id, 'approve')}
                                  disabled={loading}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check size={12} />
                                  {loading ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleAction(request.id, 'reject')}
                                  disabled={loading}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X size={12} />
                                  {loading ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            ) : request.status === 'approved' || request.payout_status === 'success' ? (
                              <div className="text-green-600 text-xs flex items-center gap-1">
                                <Check size={12} />
                                {request.payout_status === 'success' ? 'Paid' : 'Approved'}
                              </div>
                            ) : request.status === 'rejected' ? (
                              <div className="text-red-600 text-xs flex items-center gap-1">
                                <X size={12} />
                                Rejected
                              </div>
                            ) : (
                              <div className="text-gray-500 text-xs">-</div>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="flex justify-between mt-4 px-6 pb-4">
                  <button
                    disabled={!prevPage}
                    onClick={() => fetchWithdrawals(prevPage)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!nextPage}
                    onClick={() => fetchWithdrawals(nextPage)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile message */}
          <div className="mt-4 text-center text-sm text-gray-500 lg:hidden">
            Scroll horizontally to view all columns on smaller screens
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorEarningsReport;