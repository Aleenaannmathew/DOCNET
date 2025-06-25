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
import VideoCallButton from '../Constants/VideoCallButton';
import EmergencyVideoCallButton from '../Constants/EmergencyVideoButton';

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
            console.log(data)
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

    // Filter consultations based on selected filter and search term
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

    // Calculate filter counts
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

    const filterCounts = getFilterCounts();

    const filterButtons = [
        { key: 'all', label: 'All', count: filterCounts.all },
        { key: 'today', label: 'Today', count: filterCounts.today },
        { key: 'active', label: 'Active', count: filterCounts.active },
        { key: 'completed', label: 'Completed', count: filterCounts.completed },
        { key: 'pending', label: 'Pending', count: filterCounts.pending }
    ];

    const getStatusColor = (consultation) => {
        if (consultation.payment_status !== 'success') {
            switch (consultation.payment_status) {
                case 'pending':
                    return 'bg-yellow-100 text-yellow-800';
                case 'failed':
                    return 'bg-red-100 text-red-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        }

        if (consultation.consultation_end_time) {
            return 'bg-blue-100 text-blue-800';
        } else if (consultation.consultation_started) {
            return 'bg-green-100 text-green-800';
        } else {
            return 'bg-emerald-100 text-emerald-800';
        }
    };

    const getStatusIcon = (consultation) => {
        if (consultation.payment_status !== 'success') {
            switch (consultation.payment_status) {
                case 'pending':
                    return <Clock className="w-4 h-4" />;
                case 'failed':
                    return <XCircle className="w-4 h-4" />;
                default:
                    return <AlertCircle className="w-4 h-4" />;
            }
        }

        if (consultation.consultation_end_time) {
            return <CheckSquare className="w-4 h-4" />;
        } else if (consultation.consultation_started) {
            return <Activity className="w-4 h-4" />;
        } else {
            return <CheckCircle className="w-4 h-4" />;
        }
    };

    const getStatusText = (consultation) => {
        if (consultation.payment_status !== 'success') {
            return consultation.payment_status.charAt(0).toUpperCase() + consultation.payment_status.slice(1);
        }

        if (consultation.consultation_end_time) {
            return 'Completed';
        } else if (consultation.consultation_started) {
            return 'In Progress';
        } else {
            return 'Confirmed';
        }
    };

    const getProfileImageUrl = () => {
        if (user?.profile_image) return user.profile_image;
        return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`;
    };

    const handleStartConsultation = async (consultationId) => {
        try {
            setActionLoading(prev => ({ ...prev, [consultationId]: 'starting' }));
            await doctorAxios.post(`/emergency-consultations/${consultationId}/start/`);
            fetchEmergencyConsultations(); // Refresh the list
        } catch (error) {
            console.error('Error starting consultation:', error);
            setError('Failed to start consultation. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, [consultationId]: null }));
        }
    };

    const handleEndConsultation = async (consultationId) => {
        try {
            setActionLoading(prev => ({ ...prev, [consultationId]: 'ending' }));
            await doctorAxios.post(`/emergency-consultations/${consultationId}/end/`);
            fetchEmergencyConsultations(); // Refresh the list
        } catch (error) {
            console.error('Error ending consultation:', error);
            setError('Failed to end consultation. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, [consultationId]: null }));
        }
    };

    const handleVideoCall = (consultationId, videoCallLink) => {
        if (videoCallLink) {
            window.open(videoCallLink, '_blank');
        } else {
            // Generate or create video call link
            const callLink = `https://meet.jit.si/emergency-consultation-${consultationId}`;
            window.open(callLink, '_blank');
        }
    };

    const handleTabClick = (tab) => {
        if (tab === 'Logout') {
            handleLogout();
        } else if (tab === 'Change Password') {
            navigate('/doctor/change-password', {
                state: {
                    isDoctor: true,
                    email: user.email
                },
                replace: true
            });
        } else if (tab === 'Availability') {
            navigate('/doctor/slots');
        } else if (tab === 'Profile Information') {
            navigate('/doctor/settings');
        } else if (tab === 'Appointments') {
            navigate('/doctor/appointments');
        } else {
            setActiveTab(tab);
            setMobileSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await doctorAxios.post('/logout/', {
                    refresh: refreshToken
                });
            }
            dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            navigate('/doctor-login');
        } catch (error) {
            console.error('Logout error:', error);
            dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            navigate('/doctor-login')
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center bg-white rounded-2xl p-8 shadow-2xl">
                    <p className="mb-4 text-gray-700">Please log in to view emergency consultations</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                <DocSidebar />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">Emergency Consultations</h1>
                                </div>
                                <p className="text-gray-600">Manage urgent patient consultations and emergency cases</p>
                            </div>
                            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                                <button
                                    onClick={fetchEmergencyConsultations}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" />
                                    )}
                                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Today</p>
                                        <p className="text-2xl font-bold text-gray-900">{filterCounts.today}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-green-600">{filterCounts.active}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-blue-600">{filterCounts.completed}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <CheckSquare className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{filterCounts.pending}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total</p>
                                        <p className="text-2xl font-bold text-purple-600">{filterCounts.all}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Filter className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">Filter by:</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {filterButtons.map((filter) => (
                                            <button
                                                key={filter.key}
                                                onClick={() => setSelectedFilter(filter.key)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedFilter === filter.key
                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {filter.label} ({filter.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search consultations..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
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
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Patient
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Reason
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredConsultations.map((consultation) => {
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
                                                                            src={consultation.patient.profile_image ||
                                                                                `https://ui-avatars.com/api/?name=${consultation.patient.username}&background=random&color=fff&size=128`}
                                                                            alt={consultation.patient.username}
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {consultation.patient.username}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {consultation.patient.email}
                                                                        </div>
                                                                        {consultation.patient.phone && (
                                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                                <Phone className="w-3 h-3 mr-1" />
                                                                                {consultation.patient.phone}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{dateTime.date}</div>
                                                                <div className="text-sm text-gray-500">{dateTime.time}</div>
                                                                {consultation.consultation_start_time && (
                                                                    <div className="text-xs text-green-600 mt-1">
                                                                        Started: {startDateTime.time}
                                                                    </div>
                                                                )}
                                                                {consultation.consultation_end_time && (
                                                                    <div className="text-xs text-blue-600">
                                                                        Ended: {endDateTime.time}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                                    {consultation.reason || 'Emergency consultation'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultation)}`}>
                                                                    {getStatusIcon(consultation)}
                                                                    <span className="ml-1">{getStatusText(consultation)}</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {consultation.consultation_duration || '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ₹{consultation.amount}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
                                                                    {/* Start Consultation Button */}
                                                                    {consultation.payment_status === 'success' &&
                                                                        !consultation.consultation_started &&
                                                                        !consultation.consultation_end_time && (
                                                                            <button
                                                                                onClick={() => handleStartConsultation(consultation.id)}
                                                                                disabled={actionLoading[consultation.id] === 'starting'}
                                                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                                                                            >
                                                                                {actionLoading[consultation.id] === 'starting' ? (
                                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                                ) : (
                                                                                    <Play className="w-3 h-3" />
                                                                                )}
                                                                                <span>Start</span>
                                                                            </button>
                                                                        )}

                                                                    {/* Emergency Video Call Button */}
                                                                    {consultation.payment_status === 'success' &&
                                                                        !consultation.consultation_end_time && (
                                                                            <EmergencyVideoCallButton
                                                                                emergencyId={consultation.id}
                                                                                token={token}
                                                                                isDoctor={user?.role === 'doctor'}
                                                                                isPatient={user?.role === 'patient'}
                                                                                consultationStarted={consultation.consultation_started}
                                                                                consultationEnded={!!consultation.consultation_end_time}
                                                                                size="small"
                                                                                className="mr-2"
                                                                            />
                                                                        )}

                                                                    {/* End Consultation Button */}
                                                                    {consultation.payment_status === 'success' &&
                                                                        consultation.consultation_started &&
                                                                        !consultation.consultation_end_time && (
                                                                            <button
                                                                                onClick={() => handleEndConsultation(consultation.id)}
                                                                                disabled={actionLoading[consultation.id] === 'ending'}
                                                                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                                                                            >
                                                                                {actionLoading[consultation.id] === 'ending' ? (
                                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                                ) : (
                                                                                    <Square className="w-3 h-3" />
                                                                                )}
                                                                                <span>End</span>
                                                                            </button>
                                                                        )}

                                                                    {/* View Details Button */}
                                                                    <button
                                                                        onClick={() => navigate(`/doctor/emergency-consultations/${consultation.id}`)}
                                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                        <span>Details</span>
                                                                    </button>

                                                                    {/* Message Button for completed consultations */}
                                                                    {consultation.consultation_end_time && (
                                                                        <button
                                                                            onClick={() => navigate(`/doctor/consultations/${consultation.id}/messages`)}
                                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                                                                        >
                                                                            <MessageCircle className="w-3 h-3" />
                                                                            <span>Messages</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination (if needed) */}
                        {filteredConsultations.length > 0 && (
                            <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {filteredConsultations.length} of {consultations.length} consultations
                                    </div>
                                    {/* Add pagination controls here if needed */}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmergencyConsultations;