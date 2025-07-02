import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, MoreHorizontal, CreditCard, DollarSign, AlertCircle, TrendingUp, Menu, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { adminAxios } from '../../axios/AdminAxios';
import { useSelector } from 'react-redux';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const pageSize = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await adminAxios.get('/admin-payments/', {
          params: {
            status: statusFilter !== 'All Status' ? statusFilter.toLowerCase() : undefined,
            search: searchTerm || undefined,
            page: currentPage
          }
        });

        setPayments(response.data?.results || []);
        setCount(response.data?.count || 0);
      } catch (err) {
        console.error('Error fetching payments', err);
        setPayments([]); // prevent null state
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [searchTerm, statusFilter, currentPage]);

  const getStatusColor = (status = '') => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard className="w-4 h-4" />;
      case 'Cash':
        return <DollarSign className="w-4 h-4" />;
      case 'Insurance':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalAmount = (payments || []).reduce(
    (sum, payment) => payment.payment_status === 'success' ? sum + parseFloat(payment.amount || 0) : sum, 0
  );

  const completedPayments = (payments || []).filter(p => p.payment_status === 'success').length;
  const pendingPayments = (payments || []).filter(p => p.payment_status === 'pending').length;
  const failedPayments = (payments || []).filter(p => p.payment_status === 'failed').length;

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900 mr-2">
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                  <p className="text-gray-600 mt-1">All payments including emergency & scheduled consultations</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600"><Bell className="w-6 h-6" /></button>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs.{totalAmount.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPayments}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{failedPayments}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex space-x-4 w-full lg:w-auto">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>All Status</option>
                  <option>Success</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
            </div>
           
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">TRANSACTION</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">PATIENT</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">DOCTOR</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">AMOUNT</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">METHOD</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">DATE & TIME</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : (payments || []).length === 0 ? (
                  <tr><td colSpan="9" className="py-8 text-center text-gray-400">No transactions found.</td></tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="py-4 px-6">
                        <p className="font-medium">{payment.payment_id || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{payment.type}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {payment.patient_avatar ? (
                            <img src={payment.patient_avatar} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center">
                              {payment.patient_name?.[0] || 'P'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{payment.patient_name}</p>
                            <p className="text-sm text-gray-500">ID: {payment.patient_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">{payment.doctor_name}</td>
                      <td className="py-4 px-6 font-semibold">Rs.{parseFloat(payment.amount || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span>{payment.payment_method}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p>{payment.date}</p>
                        <p className="text-sm text-gray-500">{payment.time}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">Showing {Math.min(count, pageSize * currentPage)} of {count} results</p>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
