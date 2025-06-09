import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, CheckCircle, XCircle, UserRound, CalendarDays, 
  Briefcase, GraduationCap, Globe, Award, Phone, Mail, MapPin,
  FileText, Hospital, Clock, FileCheck, User, Building
} from 'lucide-react';

export default function DoctorDetail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      
      // If unauthorized, logout and redirect
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
      
      // Update local state
      setDoctor(prev => ({
        ...prev,
        is_approved: true
      }));
      
      toast.success('Doctor approved successfully');
    } catch (err) {
      console.error('Error approving doctor:', err);
      toast.error('Failed to approve doctor');
      
      // Handle unauthorized
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
      'bg-green-600 hover:bg-green-700'
    );
  };
  
  const handleReject = async () => {
    try {
      await adminAxios.patch(`/doctors/${doctorId}/approval/`, { action: 'reject' });
      
      // Update local state
      setDoctor(prev => ({
        ...prev,
        is_approved: false
      }));
      
      toast.success('Doctor rejected successfully');
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      toast.error('Failed to reject doctor');
      
      // Handle unauthorized
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
      
      // Update local state
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
      
      // Handle unauthorized
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        dispatch(logout());
        navigate('/admin/admin-login');
      }
    }
  };

  const confirmToggleBlock = () => {
    const isBlocking = doctor.user.is_active;
    const action = isBlocking ? 'block' : 'unblock';
    const actionPast = isBlocking ? 'blocked' : 'unblocked';
    
    showConfirmDialog(
      `${isBlocking ? 'Block' : 'Unblock'} Doctor`,
      `Are you sure you want to ${action} Dr. ${doctor?.name}? ${isBlocking ? 'They will lose access to the platform immediately.' : 'They will regain access to the platform.'}`,
      toggleBlock,
      isBlocking ? 'Block' : 'Unblock',
      isBlocking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
    );
  };
  
  const getProfileImage = () => {
    if (doctor?.user?.profile_image) {
      return (
        <img 
          src={doctor.user.profile_image} 
          alt={doctor.name} 
          className="w-32 h-32 rounded-full object-cover"
        />
      );
    }
    
    // Default emoji based on gender
    const emoji = doctor?.gender?.toLowerCase() === 'female' ? '👩‍⚕️' : '👨‍⚕️';
    
    return (
      <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-5xl">
        {emoji}
      </div>
    );
  };
  
  const getStatusBadgeClass = (isApproved) => {
    if (isApproved === true) return 'bg-green-100 text-green-800';
    if (isApproved === false) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800'; // For pending status (null)
  };
  
  const getStatusText = (isApproved, isActive) => {
    if (!isActive) return 'BLOCKED';
    if (isApproved === true) return 'APPROVED';
    if (isApproved === false) return 'REJECTED';
    return 'PENDING';
  };
  
  const getCertificateLink = () => {
    if (doctor?.certificate) {
      return (
        <a 
          href={doctor.certificate} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline flex items-center"
        >
          <FileCheck size={16} className="mr-1" />
          View Certificate
        </a>
      );
    }
    
    return <span className="text-gray-500">No certificate uploaded</span>;
  };

  // Confirmation Dialog Component
  const ConfirmationDialog = () => {
    if (!confirmDialog.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmDialog.confirmButtonClass}`}
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
        <div className="text-blue-600">Loading doctor details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
          <span className="text-red-700">{error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/doctor-list')}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Doctors List
          </button>
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-700">Doctor not found.</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/doctor-list')}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Doctors List
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/doctor-list')}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Doctors List
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header with status and action buttons */}
          <div className="p-6 border-b flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">{doctor.name}</h1>
              <div className="mt-2 flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(doctor.is_approved)}`}>
                  {getStatusText(doctor.is_approved, doctor.user?.is_active)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {doctor.is_approved === null && (
                <>
                  <button
                    onClick={confirmApprove}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={confirmReject}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </button>
                </>
              )}
              
              <button
                onClick={confirmToggleBlock}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                {doctor.user?.is_active ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Profile Picture */}
              <div className="flex flex-col items-center">
                {getProfileImage()}
                <div className="mt-4 text-center">
                  <h2 className="font-semibold text-lg">{doctor.name}</h2>
                  <p className="text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              
              {/* Middle Column - Personal Info */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UserRound size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{doctor.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{doctor.user?.email }</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{doctor.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarDays size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{doctor.age || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <UserRound size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{doctor.gender || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{doctor.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Info */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FileText size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Registration ID</p>
                    <p className="font-medium">{doctor.registration_id || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Hospital size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium">{doctor.hospital || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Globe size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">{doctor.languages || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Briefcase size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium">{doctor.specialization || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Award size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{doctor.experience ? `${doctor.experience} years` : 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <GraduationCap size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Qualifications</p>
                    <p className="font-medium">{doctor.qualifications || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Certificate Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Certificate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FileCheck size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Certificate</p>
                    {getCertificateLink()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* About */}
            {doctor.bio && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-gray-700">{doctor.bio}</p>
              </div>
            )}
            
            {/* Registration Details */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="font-medium">
                      {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {doctor.updated_at ? new Date(doctor.updated_at).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Status */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${doctor.user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {doctor.user?.is_active ? 'Active' : 'Blocked'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Approval Status</p>
                    <p className={`font-medium 
                      ${doctor.is_approved === true ? 'text-green-600' : 
                        doctor.is_approved === false ? 'text-red-600' : 'text-yellow-600'}`}>
                      {doctor.is_approved === true ? 'Approved' : 
                       doctor.is_approved === false ? 'Rejected' : 'Pending Review'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
}