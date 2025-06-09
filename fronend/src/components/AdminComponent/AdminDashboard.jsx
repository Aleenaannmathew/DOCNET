import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/authSlice';
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
  Filter,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) =>state.auth)
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patient-list' },
    { name: 'Doctors', icon: <UserRound size={20} />, path: '/admin/doctor-list' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/admin/appointments' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' }
  ];

  const statCards = [
    { 
      title: 'Total Doctors', 
      value: '3,400', 
      change: '+12%',
      trend: 'up',
      color: 'border-l-blue-500',
      icon: <UserRound className="text-blue-500" size={24} />
    },
    { 
      title: 'Total Patients', 
      value: '5,000', 
      change: '+8%',
      trend: 'up',
      color: 'border-l-emerald-500',
      icon: <Users className="text-emerald-500" size={24} />
    },
    { 
      title: 'Appointments', 
      value: '5,000', 
      change: '+15%',
      trend: 'up',
      color: 'border-l-purple-500',
      icon: <CalendarDays className="text-purple-500" size={24} />
    },
    { 
      title: 'Total Revenue', 
      value: '$500K', 
      change: '-3%',
      trend: 'down',
      color: 'border-l-amber-500',
      icon: <CreditCard className="text-amber-500" size={24} />
    }
  ];

  const recentActivities = [
    {
      type: 'appointment',
      title: 'New appointment scheduled',
      description: 'Dr. Sarah Johnson with Patient #1234',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      type: 'payment',
      title: 'Payment received',
      description: 'Patient #5678 paid $250 consultation fee',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      type: 'doctor',
      title: 'New doctor registered',
      description: 'Dr. Michael Chen joined Cardiology dept.',
      time: '1 hour ago',
      status: 'info'
    },
    {
      type: 'alert',
      title: 'System maintenance',
      description: 'Scheduled maintenance at 2:00 AM tonight',
      time: '2 hours ago',
      status: 'warning'
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/admin-login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-10
        border-r border-gray-200
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                DOCNET
              </h2>
            </div>
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden" 
              onClick={toggleSidebar}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path || '#'}
                  className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={`mr-4 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            >
              <LogOut size={20} className="mr-4 group-hover:scale-105 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back, Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent text-sm focus:outline-none w-32 lg:w-48"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Profile */}
              <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
          <span className="font-semibold text-white text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900">
            {user?.username || user?.username || 'Admin'}
          </p>
          <p className="text-xs text-gray-500">Super Admin</p>
        </div>
      </div>
    </div>
  </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${card.color} border-l-4`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {card.icon}
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {card.trend === 'up' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
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

          {/* Charts and Activity Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                  <p className="text-sm text-gray-500">Monthly revenue overview</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Enhanced Chart Placeholder */}
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="h-full flex flex-col justify-end space-y-4">
                  {[0.8, 0.6, 0.9, 0.7, 0.95, 0.75, 0.85].map((height, index) => (
                    <div key={index} className="flex items-end space-x-2">
                      <div className="text-xs text-gray-500 w-8">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-sm h-4 relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm transition-all duration-1000"
                          style={{ width: `${height * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 w-12 text-right">
                        ${Math.floor(height * 10000)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Latest system updates</p>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-emerald-500' :
                      activity.status === 'warning' ? 'bg-amber-500' :
                      activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Frequently used functions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Add Doctor', icon: <Plus size={20} />, color: 'bg-blue-500 hover:bg-blue-600' },
                  { name: 'New Patient', icon: <Users size={20} />, color: 'bg-emerald-500 hover:bg-emerald-600' },
                  { name: 'Schedule', icon: <Calendar size={20} />, color: 'bg-purple-500 hover:bg-purple-600' },
                  { name: 'Reports', icon: <FileText size={20} />, color: 'bg-amber-500 hover:bg-amber-600' }
                ].map((action, index) => (
                  <button
                    key={index}
                    className={`${action.color} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {action.icon}
                      <span className="text-sm font-medium">{action.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modern Calendar */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">October 2025</h3>
                <div className="flex space-x-2">
                  <button className="p-1 rounded hover:bg-gray-700 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700 transition-colors">
                    <ChevronLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
              
              {/* Calendar Header */}
              <div className="grid grid-cols-7 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center font-medium text-gray-400 text-xs p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => (
                  <button 
                    key={i} 
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
                      ${i === 17 
                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                        : 'hover:bg-gray-700 text-gray-300'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Today: Oct 18</span>
                  <span>5 appointments</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}