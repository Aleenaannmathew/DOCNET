import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, CheckCircle, XCircle, UserRound, CalendarDays, 
  Briefcase, GraduationCap, Globe, Award, Phone, Mail, MapPin,
  FileText, Hospital, Clock, FileCheck, User, Building, MoreVertical,
  Shield, AlertTriangle, Eye, Download, Edit
} from 'lucide-react';

export default function DoctorDetail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    confirmButtonClass: ''
  });
  
  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get(`/doctors/${doctorId}/`);
      setDoctor(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Failed to load doctor details. Please try again.');
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
        toast.error('Your session has expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId, token]);

  const showConfirmDialog = (title, message, onConfirm, confirmText = 'Confirm', confirmButtonClass = 'bg-blue-600 hover:bg-blue-700') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      confirmButtonClass
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      confirmText: '',
      confirmButtonClass: ''
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };
  
  const handleApprove = async () => {
    try {
      await adminAxios.patch(`/doctors/${doctorId}/approval/`, { action: 'approve' });
      setDoctor(prev => ({ ...prev, is_approved: true }));
      toast.success('Doctor approved successfully');
    } catch (err) {
      console.error('Error approving doctor:', err);
      toast.error('Failed to approve doctor');
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };

  const confirmApprove = () => {
    showConfirmDialog(
      'Approve Doctor',
      `Are you sure you want to approve Dr. ${doctor?.name}? This will allow them to access the platform and provide medical services.`,
      handleApprove,
      'Approve',
      'bg-emerald-600 hover:bg-emerald-700'
    );
  };
  
  const handleReject = async () => {
    try {
      await adminAxios.patch(`/doctors/${doctorId}/approval/`, { action: 'reject' });
      setDoctor(prev => ({ ...prev, is_approved: false }));
      toast.success('Doctor rejected successfully');
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      toast.error('Failed to reject doctor');
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };

  const confirmReject = () => {
    showConfirmDialog(
      'Reject Doctor',
      `Are you sure you want to reject Dr. ${doctor?.name}? They will not be able to access the platform or provide services.`,
      handleReject,
      'Reject',
      'bg-red-600 hover:bg-red-700'
    );
  };
  
  const toggleBlock = async () => {
    try {
      const action = doctor.user.is_active ? 'block' : 'unblock';
      await adminAxios.patch(`/doctors/${doctorId}/block/`, { action });
      
      setDoctor(prev => ({
        ...prev,
        user: {
          ...prev.user,
          is_active: !prev.user.is_active
        }
      }));
      
      toast.success(`Doctor ${action}ed successfully`);
    } catch (err) {
      console.error(`Error ${doctor.user.is_active ? 'blocking' : 'unblocking'} doctor:`, err);
      toast.error(`Failed to ${doctor.user.is_active ? 'block' : 'unblock'} doctor`);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };

  const confirmToggleBlock = () => {
    const isBlocking = doctor.user.is_active;
    const action = isBlocking ? 'block' : 'unblock';
    
    showConfirmDialog(
      `${isBlocking ? 'Block' : 'Unblock'} Doctor`,
      `Are you sure you want to ${action} Dr. ${doctor?.name}? ${isBlocking ? 'They will lose access to the platform immediately.' : 'They will regain access to the platform.'}`,
      toggleBlock,
      isBlocking ? 'Block' : 'Unblock',
      isBlocking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
    );
  };
  
  const getProfileImage = () => {
    if (doctor?.user?.profile_image) {
      return (
        <div className="relative">
          <img 
            src={doctor.user.profile_image} 
            alt={doctor.name} 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>
      );
    }
    
    const emoji = doctor?.gender?.toLowerCase() === 'female' ? '👩‍⚕️' : '👨‍⚕️';
    
    return (
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl border-4 border-white shadow-lg">
          {emoji}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
      </div>
    );
  };
  
  const getStatusBadge = () => {
    if (!doctor.user?.is_active) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle size={14} />
          Blocked
        </div>
      );
    }
    
    if (doctor.is_approved === true) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle size={14} />
          Approved
        </div>
      );
    }
    
    if (doctor.is_approved === false) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          <XCircle size={14} />
          Rejected
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={14} />
        Pending Review
      </div>
    );
  };

  const InfoCard = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={20} className="text-gray-600" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-gray-900 font-semibold truncate">{value || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const ConfirmationDialog = () => {
    if (!confirmDialog.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${confirmDialog.confirmButtonClass}`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Doctor Details</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/doctor-list')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Doctors List
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <User size={48} className="text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-amber-900 mb-2">Doctor Not Found</h2>
            <p className="text-amber-700 mb-4">The requested doctor profile could not be found.</p>
            <button
              onClick={() => navigate('/admin/doctor-list')}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Doctors List
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin/doctor-list')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Doctors
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {doctor.is_approved === null && (
                  <>
                    <button
                      onClick={confirmApprove}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={confirmReject}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(!showActionMenu)}
                    className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {showActionMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                      <button
                        onClick={() => {
                          confirmToggleBlock();
                          setShowActionMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          doctor.user?.is_active ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {doctor.user?.is_active ? 'Block Doctor' : 'Unblock Doctor'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="relative">
            {/* Background Pattern */}
            <div className="h-32 bg-gradient-to-r from bg-white to-bg-white rounded-t-2xl"></div>
            
            {/* Profile Content */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 -mt-12">
                {/* Profile Image */}
                <div className="flex justify-center sm:justify-start">
                  {getProfileImage()}
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{doctor.name}</h1>
                      <p className="text-gray-600 mb-3">{doctor.specialization || 'Medical Professional'}</p>
                      {getStatusBadge()}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        Joined {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton 
              id="overview" 
              label="Overview" 
              isActive={activeTab === 'overview'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="professional" 
              label="Professional Info" 
              isActive={activeTab === 'professional'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="documents" 
              label="Documents" 
              isActive={activeTab === 'documents'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="account" 
              label="Account Status" 
              isActive={activeTab === 'account'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Mail} label="Email Address" value={doctor.user?.email} />
                  <InfoCard icon={Phone} label="Phone Number" value={doctor.phone} />
                  <InfoCard icon={MapPin} label="Location" value={doctor.location} />
                  <InfoCard icon={Globe} label="Languages" value={doctor.languages} />
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={CalendarDays} label="Age" value={doctor.age} />
                  <InfoCard icon={UserRound} label="Gender" value={doctor.gender} />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                {doctor.bio ? (
                  <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
              <div className="space-y-4">
                <InfoCard icon={Briefcase} label="Specialization" value={doctor.specialization} />
                <InfoCard icon={Award} label="Experience" value={doctor.experience ? `${doctor.experience} years` : null} />
                <InfoCard icon={GraduationCap} label="Qualifications" value={doctor.qualifications} />
                <InfoCard icon={FileText} label="Registration ID" value={doctor.registration_id} />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Workplace Information</h2>
              <div className="space-y-4">
                <InfoCard icon={Hospital} label="Hospital/Clinic" value={doctor.hospital} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Certificates</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileCheck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Medical Certificate</p>
                    <p className="text-sm text-gray-500">Professional certification document</p>
                  </div>
                </div>
                
                {doctor.certificate ? (
                  <div className="flex items-center gap-2">
                    <a 
                      href={doctor.certificate} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </a>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status & Activity</h2>
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield size={20} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Approval Status</h3>
                  </div>
                  <div className="mb-2">
                    {getStatusBadge()}
                  </div>
                  <p className="text-sm text-gray-600">
                    {doctor.is_approved === true && "Doctor is approved and can provide services"}
                    {doctor.is_approved === false && "Doctor application has been rejected"}
                    {doctor.is_approved === null && "Doctor application is pending review"}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <User size={20} className="text-green-600" />
                    <h3 className="font-semibold text-gray-900">Account Status</h3>
                  </div>
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      doctor.user?.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {doctor.user?.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {doctor.user?.is_active 
                      ? "Doctor has access to the platform" 
                      : "Doctor access has been restricted"}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Registration Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">Registered on</span>
                    <span className="font-medium text-gray-900">
                      {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Last updated</span>
                    <span className="font-medium text-gray-900">
                      {doctor.updated_at ? new Date(doctor.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
}