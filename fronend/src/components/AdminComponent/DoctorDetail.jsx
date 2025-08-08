import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp, Eye, Check, X, Clock, DollarSign } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { adminAxios } from '../../axios/AdminAxios';
import AdminSidebar from './AdminSidebar';
import { useSelector } from 'react-redux';

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
        toast.error(error.response?.data?.message || 'Failed to load doctor earnings data.');
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
      toast.error(error.response?.data?.message || 'Failed to load withdrawal requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token]);

  const handleApprove = async (id, e) => {
    // Prevent all default behaviors immediately
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    if (loading) return;

    try {
      setLoading(true);
      
      const response = await adminAxios.post(`/admin-withdrawal/${id}/action/`, {
        action: 'approve',
        remarks: null,
      });

      toast.success('Withdrawal request has been approved successfully!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update local state after success
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === id 
            ? { ...w, status: 'approved' }
            : w
        )
      );

      // Optionally refresh data from server
      setTimeout(() => {
        fetchWithdrawals();
      }, 500);

    } catch (error) {
      console.error('Withdrawal approval error:', error);

      let errorMessage = 'Approval failed. Please try again.';
      
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        error.response.data.detail ||
                        `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (withdrawal, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    if (loading) return;

    setSelectedWithdrawal(withdrawal);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a reason for rejection.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (rejectionReason.trim().length < 10) {
      toast.warning('Reason must be at least 10 characters long.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await adminAxios.post(`/admin-withdrawal/${selectedWithdrawal.id}/action/`, {
        action: 'reject',
        remarks: rejectionReason.trim(),
      });

      toast.success('Withdrawal request has been rejected successfully.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update local state after success
      setWithdrawals(prev =>
        prev.map(w =>
          w.id === selectedWithdrawal.id 
            ? { ...w, status: 'rejected' }
            : w
        )
      );

      // Close modal and reset state
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      setRejectionReason('');

      // Optionally refresh data from server
      setTimeout(() => {
        fetchWithdrawals();
      }, 500);

    } catch (error) {
      console.error('Withdrawal rejection error:', error);

      let errorMessage = 'Rejection failed. Please try again.';
      
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        error.response.data.detail ||
                        `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedWithdrawal(null);
    setRejectionReason('');
  };

  // Calculate totals
  const totalRevenue = doctorEarnings.reduce((sum, doctor) => sum + parseFloat(doctor.total_earnings || 0), 0);
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

  // Filter data based on search
  const filteredDoctors = doctorEarnings.filter((doctor) => {
    return doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredWithdrawals = withdrawals.filter((request) => {
    const matchesSearch = (request.doctor_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };

    const statusIcons = {
      pending: <Clock size={14} />,
      approved: <Check size={14} />,
      rejected: <X size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Authentication Required</h2>
          <p className="text-gray-600">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
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

        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-green-500 bg-green-50 p-3 rounded-lg">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Withdrawal Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{totalWithdrawalRequests}</p>
                </div>
                <div className="text-blue-500 bg-blue-50 p-3 rounded-lg">
                  <Eye size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingWithdrawals}</p>
                </div>
                <div className="text-orange-500 bg-orange-50 p-3 rounded-lg">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{totalWithdrawalAmount.toLocaleString()}</p>
                </div>
                <div className="text-purple-500 bg-purple-50 p-3 rounded-lg">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('earnings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'earnings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Doctor Earnings
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'withdrawals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Withdrawal Requests
                  {pendingWithdrawals > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {pendingWithdrawals}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={activeTab === 'earnings' ? "Search doctors..." : "Search by email..."}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'withdrawals' && (
                <div className="w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

          {/* Content Tables */}
          {activeTab === 'earnings' ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
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
                    {filteredDoctors.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          {doctorEarnings.length === 0 ? 'No doctor earnings data available.' : 'No doctors match your search criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDoctors.map((doctor, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(doctor.total_earnings || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{parseFloat(doctor.available_balance || doctor.total_earnings || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
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
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          {withdrawals.length === 0 ? 'No withdrawal requests found.' : 'No withdrawals match your search criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((request, index) => (
                        <tr key={request.id || index} className="hover:bg-gray-50 transition-colors">
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
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleApprove(request.id, e);
                                  }}
                                  disabled={loading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                >
                                  <Check size={12} />
                                  {loading ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRejectClick(request, e);
                                  }}
                                  disabled={loading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                >
                                  <X size={12} />
                                  {loading ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            ) : request.status === 'approved' || request.payout_status === 'success' ? (
                              <div className="text-green-600 text-xs flex items-center gap-1 font-medium">
                                <Check size={12} />
                                {request.payout_status === 'success' ? 'Paid' : 'Approved'}
                              </div>
                            ) : request.status === 'rejected' ? (
                              <div className="text-red-600 text-xs flex items-center gap-1 font-medium">
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

                {/* Pagination */}
                {(nextPage || prevPage) && (
                  <div className="flex justify-between items-center mt-4 px-6 pb-4 border-t border-gray-100 pt-4">
                    <button
                      disabled={!prevPage || loading}
                      onClick={() => fetchWithdrawals(prevPage)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={!nextPage || loading}
                      onClick={() => fetchWithdrawals(nextPage)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500 lg:hidden">
            Scroll horizontally to view all columns on smaller screens
          </div>
        </main>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reject Withdrawal Request</h3>
                <button
                  onClick={closeRejectModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Amount: <span className="font-medium">₹{parseFloat(selectedWithdrawal?.amount || 0).toLocaleString()}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Doctor: <span className="font-medium">{selectedWithdrawal?.doctor_email || 'N/A'}</span>
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
                  rows="4"
                  placeholder="Please provide a detailed reason for rejection..."
                  style={{ minHeight: '100px' }}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeRejectModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
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
        theme="light"
        toastStyle={{
          fontFamily: 'inherit',
          fontSize: '14px'
        }}
      />
    </div>
  );
};

export default DoctorEarningsReport;