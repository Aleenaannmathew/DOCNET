import React, { useState, useEffect } from "react";
import { Calendar, Users, Clock, Wallet, Settings, LogOut, Home, Bell, Search, Filter, Activity, TrendingUp, Stethoscope, ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign, Download, Plus, AlertCircle, Loader } from "lucide-react";
import { doctorAxios } from "../../axios/DoctorAxios";
import { useNavigate } from "react-router-dom";

// Sidebar Item Component
const SidebarItem = ({ icon, text, active, onClick, badge }) => {
  return (
    <li 
      className={`relative group cursor-pointer transition-all duration-200 ${
        active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-700'
      } rounded-xl mx-2 my-1`}
      onClick={onClick}
    >
      <div className="flex items-center px-4 py-3">
        <span className="mr-3 flex-shrink-0">{icon}</span>
        <span className="font-medium">{text}</span>
        {badge && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </div>
      {active && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </li>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, last = false }) => {
  const isCredit = transaction.type === 'credit';
  const statusConfig = {
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const config = statusConfig['completed']; // Default to completed for now

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${diffInDays} days ago, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getTransactionDescription = (type) => {
    return type === 'credit' ? 'Payment Received' : 'Withdrawal';
  };

  return (
    <div className={`p-6 ${!last ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${isCredit ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {isCredit ? (
              <ArrowDownLeft size={20} className="text-emerald-600" />
            ) : (
              <ArrowUpRight size={20} className="text-red-600" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{getTransactionDescription(transaction.type)}</h4>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`text-xs px-3 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
                Completed
              </span>
              <span className="text-slate-400 text-xs">{formatDate(transaction.updated_date)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
            {isCredit ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">
            Balance: ₹{parseFloat(transaction.new_balance).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Wallet Stats Card
const WalletStatCard = ({ title, value, icon, color, description, loading = false }) => {
  const colors = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-slate-200 rounded animate-pulse mb-1"></div>
          ) : (
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
          )}
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader className="animate-spin h-8 w-8 text-emerald-500" />
    <span className="ml-2 text-slate-600">Loading wallet details...</span>
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <span className="text-red-700">{message}</span>
    </div>
    <button
      onClick={onRetry}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Retry
    </button>
  </div>
);

const DoctorWallet = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Wallet');
  const [filterType, setFilterType] = useState('all');
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mock user data - replace with actual user context
  const user = {
    username: "Joyal",
    doctor_profile: {
      specialization: "Neurology",
      hospital: "Aster Medicity"
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorAxios.get('/doctor-wallet/');
      
      // Check if response is successful
      if (response.status === 200) {
        setWalletData(response.data);
      } else {
        throw new Error(`Failed to fetch wallet data: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      
      // Handle specific error cases
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (err.response.status === 404) {
          setError('Wallet not found. Please contact support.');
        } else {
          setError(`Failed to fetch wallet data: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleLogout = async () => {
    console.log("Logout clicked");
    // Implement logout logic
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const sidebarItems = [
    { name: "Dashboard", icon: <Home size={20} />, onClick: () => handleNavigation("/doctor/dashboard") },
    { name: "Patients", icon: <Users size={20} />, onClick: () => handleNavigation("/doctor/patients"), badge: 3 },
    { name: "Appointments", icon: <Calendar size={20} />, onClick: () => handleNavigation("/doctor/appointments"), badge: 8 },
    { name: "Analytics", icon: <Activity size={20} />, onClick: () => handleNavigation("/doctor/analytics") },
    { name: "Wallet", icon: <Wallet size={20} />, onClick: () => handleNavigation("/doctor/doctor-wallet") },
    { name: "Settings", icon: <Settings size={20} />, onClick: () => handleNavigation("/doctor/settings") },
  ];

  // Process wallet data for display
  const processWalletStats = () => {
    if (!walletData) return [];

    const currentBalance = parseFloat(walletData.balance || 0);
    const history = walletData.history || [];
    
    // Calculate monthly earnings (transactions from this month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = history
      .filter(transaction => {
        const transactionDate = new Date(transaction.updated_date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               transaction.type === 'credit';
      })
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Calculate pending amount (assuming recent transactions might be pending)
    const pendingAmount = history
      .filter(transaction => {
        const transactionDate = new Date(transaction.updated_date);
        const daysDiff = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 1 && transaction.type === 'credit';
      })
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    // Calculate total withdrawn
    const totalWithdrawn = history
      .filter(transaction => transaction.type === 'debit')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    return [
      { 
        title: "Available Balance", 
        value: `₹${currentBalance.toLocaleString('en-IN')}`, 
        icon: <Wallet size={20} />, 
        color: "emerald", 
        description: "Ready for withdrawal" 
      },
      { 
        title: "This Month", 
        value: `₹${monthlyEarnings.toLocaleString('en-IN')}`, 
        icon: <TrendingUp size={20} />, 
        color: "blue", 
        description: "Total earnings" 
      },
      { 
        title: "Pending Amount", 
        value: `₹${pendingAmount.toLocaleString('en-IN')}`, 
        icon: <Clock size={20} />, 
        color: "amber", 
        description: "Processing payments" 
      },
      { 
        title: "Total Withdrawn", 
        value: `₹${totalWithdrawn.toLocaleString('en-IN')}`, 
        icon: <CreditCard size={20} />, 
        color: "purple", 
        description: "All time withdrawals" 
      },
    ];
  };

  const walletStats = processWalletStats();

  const filteredTransactions = walletData?.history?.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  }) || [];

  const handleWithdraw = () => {
    // Implement withdrawal logic
    console.log('Withdraw funds clicked');
  };

  const handleExport = () => {
    // Implement export logic
    console.log('Export data clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Stethoscope size={16} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  DOCNET
                </h1>
                <span className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-1 rounded-full font-medium">
                  PROFESSIONAL
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-slate-100 rounded-xl px-4 py-2">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="bg-transparent text-sm text-slate-600 placeholder-slate-400 border-none outline-none w-64"
                />
              </div>
              <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-3 bg-slate-100 rounded-xl px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">Dr. {user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.doctor_profile?.specialization}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static z-40 w-72 h-screen bg-gradient-to-b from-slate-800 to-slate-900 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* Profile Section */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Dr. {user?.username}</h3>
                  <p className="text-sm text-slate-300">{user?.doctor_profile?.specialization}</p>
                  <p className="text-xs text-slate-400">{user?.doctor_profile?.hospital}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.name}
                    icon={item.icon}
                    text={item.name}
                    active={activeTab === item.name}
                    badge={item.badge}
                    onClick={() => {
                      item.onClick();
                      setSidebarOpen(false);
                    }}
                  />
                ))}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors duration-200"
              >
                <LogOut size={20} className="mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Wallet</h2>
                <p className="text-slate-500 mt-1">Manage your earnings and withdrawals</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExport}
                  className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleWithdraw}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Withdraw Funds</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <ErrorMessage message={error} onRetry={fetchWalletData} />
            )}

            {/* Loading State */}
            {loading && <LoadingSpinner />}

            {/* Wallet Stats */}
            {!loading && !error && walletData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {walletStats.map((stat, index) => (
                  <WalletStatCard 
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    description={stat.description}
                    loading={loading}
                  />
                ))}
              </div>
            )}

            {/* Balance Overview */}
            {!loading && !error && walletData && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-100 mb-2">Total Available Balance</h3>
                    <p className="text-4xl font-bold mb-2">
                      ₹{parseFloat(walletData.balance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-emerald-200">
                      Last updated: {new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                      <Wallet size={48} className="text-white mb-2" />
                      <p className="text-emerald-100 text-sm">Ready for withdrawal</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History */}
            {!loading && !error && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">Transaction History</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilterType('credit')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            filterType === 'credit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
                          }`}
                        >
                          Income
                        </button>
                        <button
                          onClick={() => setFilterType('debit')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            filterType === 'debit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
                          }`}
                        >
                          Expenses
                        </button>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                        <Filter size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, index) => (
                      <TransactionCard 
                        key={transaction.id}
                        transaction={transaction}
                        last={index === filteredTransactions.length - 1}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Wallet className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-500 mb-2">No transactions found</h3>
                      <p className="text-slate-400">
                        {filterType === 'all' 
                          ? 'Your transaction history will appear here once you start earning.'
                          : `No ${filterType === 'credit' ? 'income' : 'expense'} transactions found.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorWallet;