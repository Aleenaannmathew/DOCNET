import React, { useState } from 'react';
import { Link, useNavigate , useLocation } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { Calendar, ChevronLeft, Users, UserRound, CalendarDays, CreditCard, BarChart3, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useDispatch} from 'react-redux';

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />,  path: '/admin/admin-dashboard' },
    { name: 'Patients', icon: <Users size={20} /> , path: '/admin/patient-list'},
    { name: 'Doctors', icon: <UserRound size={20} /> ,path: '/admin/doctor-list'},
    { name: 'Appointments', icon: <CalendarDays size={20} /> },
    { name: 'Payments', icon: <CreditCard size={20} /> },
    { name: 'Reports', icon: <FileText size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> }
  ];

  const statCards = [
    { title: 'Total Doctors', value: '3,400', color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Patients', value: '5,000', color: 'bg-green-100 text-green-600' },
    { title: 'Appointments', value: '5,000', color: 'bg-purple-100 text-purple-600' },
    { title: 'Total Earnings', value: '$500K', color: 'bg-amber-100 text-amber-600' }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    // Redirect to admin login page
    navigate('/admin/admin-login');
  };


  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
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
            <button className="p-1 rounded-full hover:bg-gray-100 lg:hidden" onClick={toggleSidebar}>
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
          
          <div className="p-4 border-t">
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
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg shadow-sm ${card.color} flex flex-col items-center justify-center`}
              >
                <h3 className="text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts and Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Total Revenue</h3>
                <select className="border rounded-md p-1 text-sm">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="space-y-4 w-full px-4">
                  <div className="relative">
                    <div className="h-2 bg-blue-100 rounded"></div>
                    <div className="absolute top-0 left-0 h-2 w-3/4 bg-blue-500 rounded"></div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-blue-100 rounded"></div>
                    <div className="absolute top-0 left-0 h-2 w-1/2 bg-blue-500 rounded"></div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-blue-100 rounded"></div>
                    <div className="absolute top-0 left-0 h-2 w-2/3 bg-blue-500 rounded"></div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-blue-100 rounded"></div>
                    <div className="absolute top-0 left-0 h-2 w-4/5 bg-blue-500 rounded"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-gray-900 text-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">October 2025</h3>
              
              {/* Calendar Header */}
              <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center font-medium text-gray-400">{day}</div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded
                      ${i === 17 ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}
                    `}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                    <UserRound size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New appointment scheduled</p>
                    <p className="text-sm text-gray-500">Dr. Smith with Patient #{1000 + index} • {index + 1} hour ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}