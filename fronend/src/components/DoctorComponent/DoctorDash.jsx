import React, { useState } from "react";
import { Calendar, Users, Clock, Wallet, Settings, LogOut, Home, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { ToastContainer } from "react-toastify";

// Sidebar Item Component
const SidebarItem = ({ icon, text, active, onClick, isMobile }) => {
  return (
    <li 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        <span>{text}</span>
      </div>
      {active ? (
        <ChevronDown size={16} />
      ) : (
        <ChevronRight size={16} />
      )}
    </li>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-600 font-medium text-sm">{title}</h4>
        <div className={`p-2 rounded-full ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ name, date, condition, status, last = false }) => {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`py-4 ${!last ? "border-b border-gray-200" : ""}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{name}</h4>
            <p className="text-gray-500 text-sm mt-1">{date}</p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{condition}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
            Start Session
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-sm transition-colors">
            Reschedule
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-sm transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Dashboard", icon: "📊", onClick: () => navigate("/doctor/dashboard") },
    { name: "Patients", icon: "👨‍⚕️", onClick: () => navigate("/doctor/patients") },
    { name: "Appointments", icon: "📅", onClick: () => navigate("/doctor/appointments") },
    { name: "Wallet", icon: "💰", onClick: () => navigate("/doctor/wallet") },
    { name: "Settings", icon: "⚙️", onClick: () => navigate("/doctor/settings") },
    { name: "Logout", icon: "🚪", color: "text-red-500", onClick: handleLogout },
  ];

  const statCards = [
    { title: "Total Appointments", value: 24, icon: <Calendar size={18} />, color: "blue" },
    { title: "New Patients", value: 8, icon: <Users size={18} />, color: "green" },
    { title: "Today's Consultations", value: 5, icon: <Clock size={18} />, color: "amber" },
    { title: "Earnings This Month", value: "₹42,500", icon: <Wallet size={18} />, color: "purple" },
  ];

  const appointments = [
    { name: "Jacob Hill", date: "Today, 9:00 AM - 9:30 AM", condition: "Asthma", status: "upcoming" },
    { name: "Emma Rodriguez", date: "Today, 10:30 AM - 11:00 AM", condition: "Annual Checkup", status: "upcoming" },
    { name: "Michael Chan", date: "Today, 2:15 PM - 2:45 PM", condition: "Hypertension", status: "upcoming" },
    { name: "Sarah Johnson", date: "Yesterday, 11:00 AM", condition: "Diabetes", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-600">DOCNET</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Dr. {user?.username}</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static z-30 w-64 h-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Profile Summary */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Dr. {user?.username}</h3>
                
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        item.onClick();
                        setActiveTab(item.name);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.name 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${item.color || ''}`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {activeTab === item.name ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Good morning, Dr. {user?.username}</h2>
                  <p className="text-gray-600 mt-1">
                    {user?.doctor_profile?.hospital ? `${user.doctor_profile.hospital} • ` : ''}
                    {user?.doctor_profile?.specialization ? `${user.doctor_profile.specialization}`: ''}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => navigate("/doctor/settings")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <StatCard 
                  key={index}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                />
              ))}
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.filter(a => a.status === 'upcoming').map((appointment, index) => (
                  <AppointmentCard 
                    key={index}
                    name={appointment.name}
                    date={appointment.date}
                    condition={appointment.condition}
                    status={appointment.status}
                    last={index === appointments.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.filter(a => a.status === 'completed').map((appointment, index) => (
                  <AppointmentCard 
                    key={index}
                    name={appointment.name}
                    date={appointment.date}
                    condition={appointment.condition}
                    status={appointment.status}
                    last={index === appointments.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;