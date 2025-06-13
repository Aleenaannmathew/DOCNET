import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';

const PatientAppointmentDetails = () => {
  // Mock appointment ID for demo
  const appointmentId = '1';
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const fetchAppointmentDetails = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockAppointment = {
          id: appointmentId || '1',
          status: 'confirmed',
          created_at: '2024-06-10T09:00:00Z',
          slot_date: '2024-06-15',
          slot_time: '10:00:00',
          patient: {
            id: 1,
            username: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890'
          },
          profile: {
            age: 35,
            blood_group: 'A+',
            height: '175 cm',
            weight: '70 kg',
            allergies: 'Penicillin, Shellfish',
            chronic_conditions: 'Hypertension, Diabetes Type 2',
            emergency_contact: '+1987654321',
            emergency_contact_name: 'Jane Doe (Spouse)'
          },
          appointment_notes: 'Patient complains of chest pain and shortness of breath',
          diagnosis: 'Suspected angina, requires ECG',
          prescription: 'Aspirin 81mg daily, Metoprolol 25mg twice daily',
          follow_up_date: '2024-06-22'
        };
        setAppointment(mockAppointment);
        setNotes(mockAppointment.appointment_notes || '');
        setDiagnosis(mockAppointment.diagnosis || '');
        setPrescription(mockAppointment.prescription || '');
        setFollowUpDate(mockAppointment.follow_up_date || '');
        setLoading(false);
      }, 1000);
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <UserCheck className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const handleSave = () => {
    // Here you would make an API call to save the appointment details
    console.log('Saving appointment details:', {
      notes,
      diagnosis,
      prescription,
      followUpDate
    });
    setIsEditing(false);
  };

  const handleStatusUpdate = (newStatus) => {
    // Here you would make an API call to update the appointment status
    console.log('Updating status to:', newStatus);
    setAppointment(prev => ({ ...prev, status: newStatus }));
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6">The appointment details could not be loaded.</p>
          <button
            onClick={() => window.history.back()}
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
                onClick={() => window.history.back()}
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
          
          {/* Patient Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Basic Info */}
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
                    <p className="font-medium text-gray-900">{appointment.patient.username}</p>
                    <p className="text-sm text-gray-600">Patient ID: {appointment.patient.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{appointment.patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{appointment.patient.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Profile */}
            {appointment.profile && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Heart className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Medical Profile</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{appointment.profile.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium text-gray-900">{appointment.profile.blood_group}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-medium text-gray-900">{appointment.profile.height}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-medium text-gray-900">{appointment.profile.weight}</p>
                    </div>
                  </div>
                  
                  {appointment.profile.allergies && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Allergies</p>
                          <p className="text-sm text-red-700">{appointment.profile.allergies}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {appointment.profile.chronic_conditions && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Activity className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Chronic Conditions</p>
                          <p className="text-sm text-orange-700">{appointment.profile.chronic_conditions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {appointment.profile?.emergency_contact && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Phone className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Emergency Contact</h2>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{appointment.profile.emergency_contact_name}</p>
                  <p className="text-gray-600">{appointment.profile.emergency_contact}</p>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details & Medical Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Info */}
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
                      <p className="font-medium text-gray-900">{formatDate(appointment.slot_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">{formatTime(appointment.slot_time)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Booked On</p>
                      <p className="font-medium text-gray-900">{formatDate(appointment.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">Clinic - Room 101</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Records */}
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
                >
                  {isEditing ? <X size={16} /> : <Edit size={16} />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter appointment notes..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{notes || 'No notes recorded'}</p>
                    </div>
                  )}
                </div>
                
                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  {isEditing ? (
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter diagnosis..."
                    />
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-900">{diagnosis || 'No diagnosis recorded'}</p>
                    </div>
                  )}
                </div>
                
                {/* Prescription */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  {isEditing ? (
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      placeholder="Enter prescription details..."
                    />
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-gray-900">{prescription || 'No prescription recorded'}</p>
                    </div>
                  )}
                </div>
                
                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-gray-900">
                        {followUpDate ? formatDate(followUpDate) : 'No follow-up scheduled'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
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