import React, { useEffect, useState } from 'react';
import { doctorAxios } from '../../axios/DoctorAxios';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DocSidebar from './DocSidebar';

const DoctorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    doctorAxios.get('doctor-analytics/')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error('Error loading analytics', err));
  }, []);

  const handleCSVDownload = () => {
    window.open('http://127.0.0.1:8000/doctor-csv/', '_blank');
  };

  const handlePDFDownload = () => {
    window.open('http://127.0.0.1:8000/doctor/analytics/pdf/', '_blank');
  };

  if (!analytics) return <div>Loading...</div>;

  const revenueData = [
    { name: 'Today', revenue: parseFloat(analytics.today_revenue) },
    { name: 'This Week', revenue: parseFloat(analytics.weekly_revenue) },
    { name: 'This Month', revenue: parseFloat(analytics.monthly_revenue) },
    { name: 'Expected Week', revenue: parseFloat(analytics.expected_weekly_revenue) },
    { name: 'Expected Month', revenue: parseFloat(analytics.expected_monthly_revenue) }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DocSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Doctor Analytics</h2>

        <div className="flex space-x-4">
          <button onClick={handleCSVDownload} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Download CSV
          </button>
          <button onClick={handlePDFDownload} className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Download PDF
          </button>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
