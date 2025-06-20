import React, { useState } from "react";
import { Calendar, Users, Clock, Wallet, Settings, LogOut, Home, ChevronDown, ChevronRight, Bell, Search, Filter, MoreVertical, Activity, TrendingUp, Heart, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import DocNav from "./DocNav";
import DocSidebar from "./DocSidebar";


// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
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
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
          {trend && (
            <div className="flex items-center space-x-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-emerald-500 text-sm font-medium">+{trendValue}%</span>
              <span className="text-slate-400 text-sm">vs last month</span>
            </div>
          )}
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

// Enhanced Appointment Card Component
const AppointmentCard = ({ name, date, condition, status, avatar, time, last = false }) => {
  const statusConfig = {
    upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    canceled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const config = statusConfig[status];

  return (
    <div className={`p-6 ${!last ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
              {name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${config.dot} rounded-full border-2 border-white`}></div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{name}</h4>
            <p className="text-slate-500 text-sm">{date}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`text-xs px-3 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
                {condition}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'upcoming' && (
            <>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">
                Start Session
              </button>
              <button className="text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                Reschedule
              </button>
            </>
          )}
          <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth)
  
  const statCards = [
    { title: "Total Patients", value: "1,247", icon: <Users size={20} />, color: "emerald", trend: true, trendValue: "12" },
    { title: "Appointments Today", value: "18", icon: <Calendar size={20} />, color: "blue", trend: true, trendValue: "8" },
    { title: "Avg. Session Time", value: "24m", icon: <Clock size={20} />, color: "purple", trend: false },
    { title: "Monthly Revenue", value: "₹1,42,500", icon: <Wallet size={20} />, color: "amber", trend: true, trendValue: "18" },
  ];

  const appointments = [
    { name: "Emma Rodriguez", date: "Today", time: "9:00 AM", condition: "Cardiology Consultation", status: "upcoming" },
    { name: "Michael Chen", date: "Today", time: "10:30 AM", condition: "Follow-up", status: "upcoming" },
    { name: "Sarah Johnson", date: "Today", time: "2:15 PM", condition: "Heart Checkup", status: "upcoming" },
    { name: "David Wilson", date: "Yesterday", time: "11:00 AM", condition: "Routine Checkup", status: "completed" },
    { name: "Lisa Anderson", date: "Yesterday", time: "3:30 PM", condition: "Consultation", status: "completed" },
  ];

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
  const recentAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <DocSidebar/>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Good morning, Dr. {user?.username}</h2>
                  <p className="text-emerald-100 text-lg">
                    You have {upcomingAppointments.length} appointments scheduled for today
                  </p>
                  <p className="text-emerald-200 text-sm mt-1">
                    {user?.doctor_profile?.hospital} • {user?.doctor_profile?.specialization}
                  </p>
                </div>
                <div className="hidden md:block">
                  <button 
                  onClick={() => navigate("/doctor/settings")}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm">
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <StatCard 
                  key={index}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  trend={card.trend}
                  trendValue={card.trendValue}
                />
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Today's Appointments */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-800">Today's Appointments</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">{upcomingAppointments.length} scheduled</span>
                        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                          <Filter size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {upcomingAppointments.map((appointment, index) => (
                      <AppointmentCard 
                        key={index}
                        name={appointment.name}
                        date={`${appointment.date}, ${appointment.time}`}
                        condition={appointment.condition}
                        status={appointment.status}
                        time={appointment.time}
                        last={index === upcomingAppointments.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl transition-all duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                          <Calendar size={16} className="text-emerald-600" />
                        </div>
                        <span className="font-medium text-slate-700">Schedule Appointment</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Users size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-700">Add New Patient</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Activity size={16} className="text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-700">View Analytics</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {recentAppointments.slice(0, 3).map((appointment, index) => (
                      <div key={index} className="p-4 border-b border-slate-50 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                            {appointment.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 text-sm">{appointment.name}</p>
                            <p className="text-slate-500 text-xs">{appointment.condition}</p>
                          </div>
                          <span className="text-xs text-slate-400">{appointment.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;