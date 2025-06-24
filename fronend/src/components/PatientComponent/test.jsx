import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Save, X, ChevronDown, ChevronRight, CheckCircle, FileText, 
  User, Lock, Calendar, Stethoscope, Clipboard, Bell, HelpCircle, 
  LogOut, Search, Edit3, Shield, Award, MapPin, Globe, Clock, 
  Phone, Mail, Building2, Languages, Users, Heart, Filter,
  MoreVertical, Eye, MessageCircle, Video, CheckSquare, XCircle,
  Loader2, AlertCircle, Play, Square, Zap, Activity, Timer
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import DocSidebar from './DocSidebar';
import { doctorAxios } from '../../axios/DoctorAxios';

const EmergencyConsultations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Emergency Consultations');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch emergency consultations from backend
  const fetchEmergencyConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorAxios.get('/emergency-consultations/');
      
      // Ensure the response data is an array
      const data = response.data;
      const consultationsData = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.results) 
          ? data.results 
          : Array.isArray(data?.consultations) 
            ? data.consultations 
            : [];
      
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Error fetching emergency consultations:', error);
      setError('Failed to load emergency consultations. Please try again.');
      setConsultations([]); // Reset to empty array on error
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchEmergencyConsultations();
    }
  }, [user, token]);

  // Helper function to format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      return { date: 'N/A', time: 'N/A' };
    }
  };

  // Safe filtering function
  const filteredConsultations = Array.isArray(consultations) ? consultations.filter(consultation => {
    if (!consultation || typeof consultation !== 'object') return false;
    
    const matchesSearch = searchTerm === '' || 
      (consultation.patient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultation.reason && consultation.reason.toLowerCase().includes(searchTerm.toLowerCase())));

    const today = new Date().toISOString().split('T')[0];
    const consultationDate = consultation.timestamp ? new Date(consultation.timestamp).toISOString().split('T')[0] : null;
    
    switch (selectedFilter) {
      case 'today':
        return matchesSearch && consultationDate === today;
      case 'active':
        return matchesSearch && consultation.payment_status === 'success' && !consultation.consultation_end_time;
      case 'completed':
        return matchesSearch && consultation.consultation_end_time;
      case 'pending':
        return matchesSearch && consultation.payment_status === 'pending';
      default:
        return matchesSearch;
    }
  }) : [];

  // Calculate filter counts with safe checks
  const getFilterCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      all: consultations.length,
      today: consultations.filter(c => c?.timestamp && new Date(c.timestamp).toISOString().split('T')[0] === today).length,
      active: consultations.filter(c => c?.payment_status === 'success' && !c.consultation_end_time).length,
      completed: consultations.filter(c => c?.consultation_end_time).length,
      pending: consultations.filter(c => c?.payment_status === 'pending').length
    };
  };

  // ... [rest of your component code remains the same until the return statement]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <DocSidebar/>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header and stats cards remain the same */}

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              {/* Filter UI remains the same */}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={fetchEmergencyConsultations}
                    className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500 mr-3" />
                  <span className="text-gray-600">Loading emergency consultations...</span>
                </div>
              </div>
            )}

            {/* Consultations List */}
            {!loading && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredConsultations.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency consultations found</h3>
                    <p className="text-gray-500">
                      {selectedFilter === 'all' 
                        ? 'No emergency consultations have been scheduled yet.'
                        : `No ${selectedFilter} emergency consultations found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* Table headers remain the same */}
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredConsultations.map((consultation) => {
                          // Add null checks for consultation properties
                          const patientName = consultation.patient?.username || 'Unknown';
                          const patientEmail = consultation.patient?.email || '';
                          const patientPhone = consultation.patient?.phone || '';
                          const patientImage = consultation.patient?.profile_image || 
                            `https://ui-avatars.com/api/?name=${patientName.split(' ').join('+')}&background=random&color=fff&size=128`;

                          const dateTime = formatDateTime(consultation.timestamp);
                          const startDateTime = formatDateTime(consultation.consultation_start_time);
                          const endDateTime = formatDateTime(consultation.consultation_end_time);
                          
                          return (
                            <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={patientImage}
                                      alt={patientName}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {patientName}
                                    </div>
                                    {patientEmail && (
                                      <div className="text-sm text-gray-500">
                                        {patientEmail}
                                      </div>
                                    )}
                                    {patientPhone && (
                                      <div className="text-sm text-gray-500 flex items-center">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {patientPhone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {/* Rest of the table cells with proper null checks */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmergencyConsultations;