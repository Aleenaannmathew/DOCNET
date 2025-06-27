import React, { useState } from 'react';
import { Search, Download, Filter, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const DoctorEarningsReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('This Month');

  // Sample data for doctor earnings
  const doctorEarnings = [
    {
      id: 1,
      name: 'Dr. Joyal Kumar',
      specialization: 'Cardiologist',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 125000,
      consultations: 45,
      emergencies: 8,
      lastActive: 'Jun 24, 2025',
      status: 'active'
    },
    {
      id: 2,
      name: 'Dr. Alisha Patel',
      specialization: 'Neurologist',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 98500,
      consultations: 38,
      emergencies: 12,
      lastActive: 'Jun 23, 2025',
      status: 'active'
    },
    {
      id: 3,
      name: 'Dr. Rajesh Singh',
      specialization: 'Orthopedic',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 87200,
      consultations: 32,
      emergencies: 5,
      lastActive: 'Jun 23, 2025',
      status: 'active'
    },
    {
      id: 4,
      name: 'Dr. Priya Sharma',
      specialization: 'Pediatrician',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 76800,
      consultations: 41,
      emergencies: 3,
      lastActive: 'Jun 22, 2025',
      status: 'active'
    },
    {
      id: 5,
      name: 'Dr. Arun Nair',
      specialization: 'Dermatologist',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 65400,
      consultations: 28,
      emergencies: 2,
      lastActive: 'Jun 21, 2025',
      status: 'inactive'
    },
    {
      id: 6,
      name: 'Dr. Meera Joseph',
      specialization: 'Gynecologist',
      avatar: '/api/placeholder/40/40',
      totalEarnings: 92300,
      consultations: 35,
      emergencies: 7,
      lastActive: 'Jun 20, 2025',
      status: 'active'
    }
  ];

  // Calculate summary statistics
  const totalRevenue = doctorEarnings.reduce((sum, doctor) => sum + doctor.totalEarnings, 0);
  const activeDoctors = doctorEarnings.filter(doctor => doctor.status === 'active').length;
  const totalConsultations = doctorEarnings.reduce((sum, doctor) => sum + doctor.consultations, 0);

  // Filter doctors based on search and status
  const filteredDoctors = doctorEarnings.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || 
                         (statusFilter === 'Active' && doctor.status === 'active') ||
                         (statusFilter === 'Inactive' && doctor.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-800">DOCNET</span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Users size={20} />
              <span>Patients</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Users size={20} />
              <span>Doctors</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Calendar size={20} />
              <span>Appointments</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <DollarSign size={20} />
              <span>Payments</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 rounded-lg">
              <TrendingUp size={20} />
              <span>Reports</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Earnings Report</h1>
              <p className="text-gray-600 mt-1">Comprehensive earnings analysis for all doctors</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <span className="sr-only">Notifications</span>
                🔔
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Doctors</p>
                  <p className="text-2xl font-bold text-gray-800">{activeDoctors}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Consultations</p>
                  <p className="text-2xl font-bold text-gray-800">{totalConsultations}</p>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg per Doctor</p>
                  <p className="text-2xl font-bold text-gray-800">₹{Math.round(totalRevenue / doctorEarnings.length).toLocaleString()}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>

                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                </div>

                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultations</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergencies</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor, index) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-600 text-sm font-medium">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">ID: {doctor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{doctor.totalEarnings.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.consultations}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.emergencies}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.lastActive}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doctor.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile responsive message */}
          <div className="mt-4 text-center text-sm text-gray-500 lg:hidden">
            Scroll horizontally to view all columns on smaller screens
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarningsReport;