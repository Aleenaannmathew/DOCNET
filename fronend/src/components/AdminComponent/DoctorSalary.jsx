import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp, Eye, Check, X, Clock, DollarSign } from 'lucide-react';
import { adminAxios } from '../../axios/AdminAxios';
import AdminSidebar from './AdminSidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const { token } = useSelector((state) => state.auth);

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
      const { value: inputRemarks, isConfirmed } = await Swal.fire({
        title: 'Enter reason for rejection',
        input: 'text',
        inputPlaceholder: 'Enter rejection reason',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });

      if (!isConfirmed || !inputRemarks) {
        toast.info('Rejection cancelled', toastOptions);
        return;
      }

      remarks = inputRemarks;
    }

    try {
      setActionLoadingId(id);
      await adminAxios.post(`/admin-withdrawal/${id}/action/`, {
        action: actionType,
        remarks: remarks,
      });

      await Swal.fire({
        icon: 'success',
        title: `Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-end'
      });

      setWithdrawals(prev =>
        prev.map(w =>
          w.id === id ? { ...w, status: actionType } : w
        )
      );
    } catch (error) {
      console.error('Action error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Action failed. Please try again.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalRevenue = doctorEarnings.reduce((sum, doc) => sum + parseFloat(doc.total_earnings || 0), 0);
  const totalWithdrawalRequests = withdrawals.length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const totalWithdrawalAmount = withdrawals
    .filter(req => req.status === 'pending')
    .reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);

  const filteredDoctors = doctorEarnings.filter((doctor) =>
    doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card label="Total Revenue" value={totalRevenue} icon={<TrendingUp size={24} />} color="green" />
            <Card label="Withdrawal Requests" value={totalWithdrawalRequests} icon={<Eye size={24} />} color="blue" />
            <Card label="Pending Requests" value={pendingWithdrawals} icon={<Clock size={24} />} color="orange" />
            <Card label="Pending Amount" value={totalWithdrawalAmount} icon={<DollarSign size={24} />} color="purple" />
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <Tab label="Doctor Earnings" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
                <Tab label="Withdrawal Requests" active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} />
              </nav>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={activeTab === 'earnings' ? "Search doctors..." : "Search by email..."}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'withdrawals' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>

          {activeTab === 'earnings' ? (
            <EarningsTable doctors={filteredDoctors} />
          ) : (
            <WithdrawalsTable
              requests={filteredWithdrawals}
              getStatusBadge={getStatusBadge}
              handleAction={handleAction}
              actionLoadingId={actionLoadingId}
              nextPage={nextPage}
              prevPage={prevPage}
              fetchWithdrawals={fetchWithdrawals}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const Card = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">₹{parseFloat(value).toLocaleString()}</p>
      </div>
      <div className={`text-${color}-500`}>{icon}</div>
    </div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-4 px-1 border-b-2 font-medium text-sm ${active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
  >
    {label}
  </button>
);

const EarningsTable = ({ doctors }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Available Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {doctors.map((doctor, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{doctor.specialization}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{parseFloat(doctor.total_earnings || 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm font-medium text-green-600">₹{parseFloat(doctor.available_balance || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const WithdrawalsTable = ({ requests, getStatusBadge, handleAction, actionLoadingId, nextPage, prevPage, fetchWithdrawals }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Doctor Email</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.length === 0 ? (
            <tr><td colSpan="6" className="text-center text-gray-500 py-4">No withdrawal requests found.</td></tr>
          ) : (
            requests.map((req, index) => (
              <tr key={req.id || index}>
                <td className="px-6 py-4 text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-sm">{req.doctor_email || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-medium">₹{parseFloat(req.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{new Date(req.request_date || req.updated_date).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                <td className="px-6 py-4">
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, 'approve')}
                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded"
                      >
                        {actionLoadingId === req.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, 'reject')}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded"
                      >
                        {actionLoadingId === req.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">{req.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex justify-between px-6 py-4">
        <button disabled={!prevPage} onClick={() => fetchWithdrawals(prevPage)} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
        <button disabled={!nextPage} onClick={() => fetchWithdrawals(nextPage)} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  </div>
);

export default DoctorEarningsReport;
