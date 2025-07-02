import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp } from 'lucide-react';
import { adminAxios } from '../../axios/AdminAxios';
import AdminSidebar from './AdminSidebar';

const DoctorEarningsReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorEarnings, setDoctorEarnings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch doctor earnings from the API
  useEffect(() => {
    const fetchDoctorEarnings = async () => {
      try {
        const response = await adminAxios.get('/doctor-earnings/');
        if (response.data.status === 'success') {
          setDoctorEarnings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching doctor earnings:', error);
      }
    };

    fetchDoctorEarnings();
  }, []);

  // Calculate total revenue
  const totalRevenue = doctorEarnings.reduce((sum, doctor) => sum + parseFloat(doctor.total_earnings), 0);

  // Filter doctors based on search
  const filteredDoctors = doctorEarnings.filter((doctor) => {
    return doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="w-full flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="text-gray-500 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Earnings Report</h1>
              <p className="text-gray-600 mt-1">Comprehensive earnings analysis for all doctors</p>
            </div>
          </div>
         
        </header>

        {/* Main Section */}
        <main className="p-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-green-500">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search doctors..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Earnings Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(doctor.total_earnings).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile message */}
          <div className="mt-4 text-center text-sm text-gray-500 lg:hidden">
            Scroll horizontally to view all columns on smaller screens
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorEarningsReport;
