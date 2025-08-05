import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  FileText,
  Stethoscope,
  Activity,
  UserCheck,
  Edit,
  Save,
  X,
  Loader,
  CheckCircle,
  XCircle,
  Info,
  CreditCard,
  DollarSign,
  ClipboardListIcon
} from 'lucide-react';
import { doctorAxios } from '../../axios/DoctorAxios';
import { useSelector } from 'react-redux';
import VideoCallButton from '../Constants/VideoCallButton';
import ChatAccessButton from '../Constants/MessageButton';

const PatientAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState({
    notes: '',
    diagnosis: '',
    prescription: '',
    followUpDate: ''
  });
  const [updating, setUpdating] = useState(false);
  const [slotId, setSlotId] = useState('');

  // Fetch appointment and medical record details
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) {
        setError('No appointment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch appointment details
        const appointmentResponse = await doctorAxios.get(`/appointments/${appointmentId}/`);
        if (appointmentResponse.data.success) {
          const appointmentData = appointmentResponse.data.data;
          setAppointment(appointmentData);
          setSlotId(appointmentData.slot_id);
          
          // Fetch medical record
          try {
            const recordResponse = await doctorAxios.get(`/medical-record/${appointmentId}/`);
            setMedicalRecord({
              notes: recordResponse.data.notes || '',
              diagnosis: recordResponse.data.diagnosis || '',
              prescription: recordResponse.data.prescription || '',
              followUpDate: recordResponse.data.follow_up_date || ''
            });
          } catch (error) {
            // Medical record doesn't exist yet, keep default empty values
          }
        } else {
          setError(appointmentResponse.data.message || 'Failed to fetch appointment details');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveMedicalRecord = async () => {
    try {
      setUpdating(true);
      
      const payload = {
        notes: medicalRecord.notes,
        diagnosis: medicalRecord.diagnosis,
        prescription: medicalRecord.prescription,
        follow_up_date: medicalRecord.followUpDate || null
      };

      // Use POST to create or update medical record
      const response = await doctorAxios.post(
        `/medical-record/${appointmentId}/`,
        payload
      );

      if (response.status === 201 || response.status === 200) {
        setIsEditing(false);
        // Update local state with the saved data
        setMedicalRecord({
          notes: response.data.notes || '',
          diagnosis: response.data.diagnosis || '',
          prescription: response.data.prescription || '',
          followUpDate: response.data.follow_up_date || ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to save medical record');
      }
    } catch (err) {
      console.error('Error saving medical record:', err);
      alert(err.response?.data?.error || 'Failed to save medical record. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await doctorAxios.patch(
        `/doctor-appointment-details/${appointmentId}/`, 
        { status: newStatus }
      );

      if (response.data.success) {
        setAppointment(prev => ({ ...prev, status: newStatus }));
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status. Please try again.');
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'confirmed': return <UserCheck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center">
            <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
            <span className="text-gray-600">Loading appointment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Appointment</h2>
          <p className="text-gray-600 mb-6">{error || 'The appointment details could not be loaded.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-white/80 hover:bg-white border border-gray-200 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Appointment Details</h1>
                <p className="text-gray-600">Appointment #{appointment.id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <VideoCallButton slotId={slotId} token={token} />
              <ChatAccessButton slotId={slotId} />
              
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                <span className="font-medium capitalize">{appointment.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Patient Information Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Basic Info Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Patient Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{appointment.patient_email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ClipboardListIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{appointment.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{appointment.patient_phone}</p>
                  </div>
                </div>

                {appointment.patient_profile_image && (
                  <div className="flex justify-center mt-4">
                    <img 
                      src={appointment.patient_profile_image} 
                      alt="Patient"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Patient Medical Profile Card */}
            {appointment.patient_profile && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Heart className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Medical Profile</h2>
                </div>
                
                <div className="space-y-4">
                  {appointment.patient_profile.age && (
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{appointment.patient_profile.age} years</p>
                    </div>
                  )}
                  
                  {appointment.patient_profile.blood_group && (
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium text-gray-900">{appointment.patient_profile.blood_group}</p>
                    </div>
                  )}
                  
                  {appointment.patient_profile.allergies && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Allergies</p>
                          <p className="text-sm text-red-700">{appointment.patient_profile.allergies}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {appointment.patient_profile.chronic_conditions && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Activity className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Chronic Conditions</p>
                          <p className="text-sm text-orange-700">{appointment.patient_profile.chronic_conditions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-bold text-lg text-green-600">₹{appointment.payment_amount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {appointment.payment_status}
                  </span>
                </div>
                
                {appointment.payment_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="text-sm font-medium text-gray-900">{appointment.payment_method}</span>
                  </div>
                )}
                
                {appointment.razorpay_payment_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-xs font-mono text-gray-700">{appointment.razorpay_payment_id}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Date</span>
                  <span className="text-sm text-gray-900">{formatDate(appointment.payment_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details & Medical Records Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Appointment Details</h2>
                </div>
                
                {appointment.status === 'confirmed' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Appointment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">{formatTime(appointment.appointment_time)}</p>
                    </div>
                  </div>

                  {appointment.duration && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">{appointment.duration} minutes</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Booked On</p>
                      <p className="font-medium text-gray-900">{formatDate(appointment.created_at)}</p>
                    </div>
                  </div>
                  
                  {appointment.consultation_type && (
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-600">Consultation Type</p>
                        <p className="font-medium text-gray-900 capitalize">{appointment.consultation_type}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {appointment.consultation_type === 'online' ? 'Online Consultation' : 'Clinic - Room 101'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Records Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Stethoscope className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Medical Records</h2>
                </div>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  disabled={updating}
                >
                  {isEditing ? <X size={16} /> : <Edit size={16} />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Notes Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={medicalRecord.notes}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter appointment notes..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {medicalRecord.notes || 'No notes recorded'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Diagnosis Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  {isEditing ? (
                    <textarea
                      name="diagnosis"
                      value={medicalRecord.diagnosis}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter diagnosis..."
                    />
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {medicalRecord.diagnosis || 'No diagnosis recorded'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Prescription Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  {isEditing ? (
                    <textarea
                      name="prescription"
                      value={medicalRecord.prescription}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      placeholder="Enter prescription details..."
                    />
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {medicalRecord.prescription || 'No prescription recorded'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Follow-up Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="followUpDate"
                      value={medicalRecord.followUpDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-gray-900">
                        {medicalRecord.followUpDate ? formatDate(medicalRecord.followUpDate) : 'No follow-up scheduled'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMedicalRecord}
                      disabled={updating}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {updating ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                      <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointmentDetails;