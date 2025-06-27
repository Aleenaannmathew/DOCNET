import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Download, Search, Filter, Eye, FileText, Activity, History, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './Navbar';
import PatientSidebar from './SideBar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { userAxios } from '../../axios/UserAxios';

const MedicalRecordsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector((state) => state.auth);
  const [previewImage, setPreviewImage] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const response = await userAxios.get('/records/');
        setRecords(Array.isArray(response?.data?.results) ? response.data.results : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch records');
        toast.error(err.response?.data?.message || 'Failed to fetch records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'normal':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'elevated':
        return 'bg-yellow-100 text-yellow-800';
      case 'abnormal':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (record) => {
    if (record?.prescription) return <Heart className="w-4 h-4" />;
    if (record?.diagnosis?.toLowerCase().includes('lab')) return <Activity className="w-4 h-4" />;
    if (record?.diagnosis?.toLowerCase().includes('x-ray') || record?.diagnosis?.toLowerCase().includes('scan')) 
      return <Eye className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record?.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       record?.prescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (record?.doctor_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'prescription' && record?.prescription) ||
                     (activeTab === 'lab' && record?.diagnosis?.toLowerCase().includes('lab'));
    
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', label: 'All Records', count: records.length },
    { id: 'lab', label: 'Lab Reports', count: records.filter(r => r?.diagnosis?.toLowerCase().includes('lab')).length },
    { id: 'prescription', label: 'Prescriptions', count: records.filter(r => r?.prescription).length },
  ];

  const handleDownload = async (recordId) => {
    try {
      const response = await axios.get(`/api/records/${recordId}/download/`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-record-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download record');
    }
  };

  const handleViewPrescription = (record) => {
    setSelectedRecord(record);
    setShowPrescriptionModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ToastContainer />
      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  <img 
                    src={getProfileImageUrl()} 
                    alt={user?.username || 'User'} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{user?.username || 'User'}</h1>
                  <p className="text-gray-600 mb-2">{user?.email || ''}</p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {user?.role || 'patient'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <History className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Medical Records</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
                      <p className="text-gray-600 mt-1">View and manage your medical history</p>
                    </div>
                    <button 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => toast.info('Feature coming soon!')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search records, doctors, or types..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => toast.info('Filter feature coming soon!')}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                        <span className="ml-2 bg-gray-100 text-gray-900 rounded-full px-2 py-1 text-xs">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Records List */}
                <div className="divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'Your medical records will appear here.'}
                      </p>
                    </div>
                  ) : (
                    filteredRecords.map((record) => (
                      <div 
                        key={record.id} 
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewPrescription(record)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getCategoryIcon(record)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {record.diagnosis || 'Medical Consultation'}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.appointment_info?.status)}`}>
                                  {record.appointment_info?.status || 'Completed'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {record.prescription ? 'Prescription' : 'Medical Consultation'}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>By Dr. {record.doctor_info?.name || 'Unknown'}</span>
                                <span>•</span>
                                <span>
                                  {new Date(record.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPrescription(record);
                              }}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(record.id);
                              }}
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Medical Record Details</h2>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedRecord.diagnosis || 'Medical Consultation'}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>By Dr. {selectedRecord.doctor_info?.name || 'Unknown'}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedRecord.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Appointment Details</h4>
                  <p className="text-gray-700">
                    <span className="font-medium">Reason:</span> {selectedRecord.appointment_info?.reason || 'Not specified'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRecord.appointment_info?.status)}`}>
                      {selectedRecord.appointment_info?.status || 'Completed'}
                    </span>
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Prescription</h4>
                  {selectedRecord.prescription ? (
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                      {selectedRecord.prescription}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No prescription provided</p>
                  )}
                </div>

                {selectedRecord.notes && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Doctor's Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedRecord.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => handleDownload(selectedRecord.id)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;