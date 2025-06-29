import React, { useState, useEffect } from "react";
import { Calendar, Users, Clock, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DocSidebar from "./DocSidebar";
import { doctorAxios } from "../../axios/DoctorAxios";

const 
StatCard = ({ title, value, icon, color }) => {
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
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      const response = await doctorAxios.get('dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await doctorAxios.get(`doctor-analytics/?filter=${filter}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCSVDownload = () => {
    window.open('http://127.0.0.1:8000/doctor-csv/', '_blank');
  };

  const handlePDFDownload = () => {
    window.open('http://127.0.0.1:8000/doctor/analytics/pdf/', '_blank');
  };

  if (!dashboardData || !analytics) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const statCards = [
    { title: "Total Appointments", value: dashboardData.total_appointments, icon: <Users size={20} />, color: "emerald" },
    { title: "Appointments Today", value: dashboardData.today_appointments, icon: <Calendar size={20} />, color: "blue" },
    { title: "Completed Appointments", value: dashboardData.completed_appointments, icon: <Clock size={20} />, color: "purple" },
    { title: "Wallet Balance", value: `₹${analytics.wallet_balance}`, icon: <Wallet size={20} />, color: "amber" },
  ];

  const revenueData = [
    { name: 'Today', revenue: parseFloat(analytics.today_revenue) },
    { name: 'This Week', revenue: parseFloat(analytics.weekly_revenue) },
    { name: 'This Month', revenue: parseFloat(analytics.monthly_revenue) },
    { name: 'Expected Week', revenue: parseFloat(analytics.expected_weekly_revenue) },
    { name: 'Expected Month', revenue: parseFloat(analytics.expected_monthly_revenue) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        <DocSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Good morning, Dr. {user?.username}</h2>
                  <p className="text-emerald-100 text-lg">
                    You have {dashboardData.today_appointments} appointments scheduled for today
                  </p>
                  <p className="text-emerald-200 text-sm mt-1">
                    {user?.doctor_profile?.hospital} • {user?.doctor_profile?.specialization}
                  </p>
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
                />
              ))}
            </div>

            {/* Analytics Section */}
            <div className="flex space-x-4 my-4">
              {['all', 'daily', 'weekly', 'monthly', 'yearly'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg ${filter === f ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <button onClick={handleCSVDownload} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Download CSV
              </button>
              <button onClick={handlePDFDownload} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Download PDF
              </button>
            </div>

            {/* Revenue Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>

            {/* Wallet Transactions Table */}
            <div className="overflow-x-auto mt-8">
              <table className="min-w-full border border-gray-200 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">Type</th>
                    <th className="p-3 border">Amount</th>
                    <th className="p-3 border">New Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.transactions.length > 0 ? (
                    analytics.transactions.map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 border">{txn.date}</td>
                        <td className="p-3 border capitalize">{txn.type}</td>
                        <td className="p-3 border">₹{txn.amount}</td>
                        <td className="p-3 border">₹{txn.new_balance}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-4">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
