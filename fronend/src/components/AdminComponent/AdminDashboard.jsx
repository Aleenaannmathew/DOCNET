import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';
import {
  Calendar,
  ChevronLeft,
  Users,
  UserRound,
  CalendarDays,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  MoreVertical,
  Plus
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
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
    }
  ];

  const recentActivities = dashboardData.recent_activities || [];

  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patient-list' },
    { name: 'Doctors', icon: <UserRound size={20} />, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/admin/appointments' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' }
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
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input type="text" placeholder="Search..." className="bg-transparent text-sm focus:outline-none w-32 lg:w-48" />
              </div>

              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                  <p className="text-sm text-gray-500">Monthly revenue overview</p>
                </div>
              </div>
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 flex items-center justify-center text-gray-400">
                <span>Chart Placeholder</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Latest system updates</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.status === 'success' ? 'bg-emerald-500' : activity.status === 'warning' ? 'bg-amber-500' : activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center"><Clock size={12} className="mr-1" />{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
