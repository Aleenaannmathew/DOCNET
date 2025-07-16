import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';
import {
  Menu, UserRound, Users, CalendarDays, CreditCard,
  TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminSidebar from './AdminSidebar';

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAxios.get('/admin-dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/admin-login');
  };

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Doctors',
      value: dashboardData.total_doctors,
      change: dashboardData.trends.total_doctors_change,
      trend: dashboardData.trends.total_doctors_change.startsWith('+') ? 'up' : 'down',
      color: 'border-l-blue-500',
      icon: <UserRound className="text-blue-500" size={24} />
    },
    {
      title: 'Total Patients',
      value: dashboardData.total_patients,
      change: dashboardData.trends.total_patients_change,
      trend: dashboardData.trends.total_patients_change.startsWith('+') ? 'up' : 'down',
      color: 'border-l-emerald-500',
      icon: <Users className="text-emerald-500" size={24} />
    },
    {
      title: 'Appointments',
      value: dashboardData.total_appointments,
      change: dashboardData.trends.total_appointments_change,
      trend: dashboardData.trends.total_appointments_change.startsWith('+') ? 'up' : 'down',
      color: 'border-l-purple-500',
      icon: <CalendarDays className="text-purple-500" size={24} />
    },
    {
      title: 'Total Revenue',
      value: `Rs.${dashboardData.total_revenue}`,
      change: dashboardData.trends.total_revenue_change,
      trend: dashboardData.trends.total_revenue_change.startsWith('+') ? 'up' : 'down',
      color: 'border-l-amber-500',
      icon: <CreditCard className="text-amber-500" size={24} />
    },
    {
      title: 'Admin Profit',
      value: `Rs.${dashboardData.admin_profit}`,
      change: '+10%',
      trend: 'up',
      color: 'border-l-pink-500',
      icon: <TrendingUp className="text-pink-500" size={24} />
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden" onClick={toggleSidebar}>
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back, Administrator</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <span className="font-semibold text-white text-sm">{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Statistic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${card.color} border-l-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{card.change}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="mr-2" /> Monthly Revenue
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
