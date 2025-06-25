import React, { useState, useEffect } from 'react';
import { Clock, Phone, Video, User, CreditCard, MapPin, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react';
import { userAxios } from '../../axios/UserAxios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmergencyVideoCallButton from '../Constants/EmergencyVideoButton';

export default function EmergencyConsultationConfirmation() {
  // Fixed: Changed paymentId to payment_id to match the route parameter
  const { payment_id } = useParams();
  const [consultationData, setConsultationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { user, token } = useSelector((state)=>state.auth)
  // Fetch consultation data
  useEffect(() => {
    // Added check to ensure payment_id exists before making API call
    if (payment_id) {
      fetchConsultationData();
    } else {
      setError('Invalid payment ID');
      setLoading(false);
    }
  }, [payment_id]);

  const fetchConsultationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data for payment_id:', payment_id); // Debug log

      // Fixed: Use payment_id instead of paymentId
      const response = await userAxios.get(`emergency-confirmation/payment/${payment_id}/`);
      setConsultationData(response.data);
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch consultation data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationAction = async (action) => {
    try {
      setActionLoading(true);
      setError(null);

      console.log('Performing action:', action, 'for payment_id:', payment_id); // Debug log

      // Fixed: Use payment_id instead of paymentId
      const response = await userAxios.post(`emergency-confirmation/payment/${payment_id}/`, {
        action: action
      });
      console.log('Action response:', response.data);

      // Handle different response structures
      if (response.data.data) {
        setConsultationData(response.data.data);
      } else {
        setConsultationData(response.data);
      }

      if (action === 'end_consultation') {
        setShowEndConfirmation(false);
      }
    } catch (err) {
      console.error('Action error:', err); // Debug log
      const errorMessage = err.response?.data?.error || err.message || 'Action failed';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsultation = () => {
    handleConsultationAction('start_consultation');
  };

  const handleEndConsultation = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndConsultation = () => {
    handleConsultationAction('end_consultation');
  };

  const cancelEndConsultation = () => {
    setShowEndConfirmation(false);
  };

  // Added debug info for payment_id
  if (!payment_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Payment ID</h2>
          <p className="text-gray-600 mb-4">No payment ID provided in the URL</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation details...</p>
          <p className="text-sm text-gray-500 mt-2">Payment ID: {payment_id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Consultation</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Payment ID: {payment_id}</p>
          <button
            onClick={fetchConsultationData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!consultationData) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'active': return 'Active';
      case 'ended': return 'Ended';
      default: return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Emergency Consultation</h1>
                <p className="text-gray-600">Consultation ID: {consultationData.consultation_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultationData.consultation_status)}`}>
                {getStatusText(consultationData.consultation_status)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Doctor Information
              </h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {consultationData.doctor_initials}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{consultationData.doctor_full_name}</h3>
                  <p className="text-blue-600 font-medium">{consultationData.doctor_specialization}</p>
                  <p className="text-gray-600 text-sm mt-1">{consultationData.doctor_experience} • Board Certified</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {consultationData.doctor_hospital}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      {consultationData.doctor_availability_status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{consultationData.patient_full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <p className="text-gray-900 font-medium">{consultationData.patient_age} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <p className="text-gray-900 font-medium">{consultationData.patient_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{consultationData.patient_email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                  <p className="text-gray-900 font-medium">{consultationData.reason}</p>
                </div>
              </div>
            </div>

            {/* Consultation Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Consultation Controls</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {consultationData.consultation_status === 'confirmed' && (
                  <button
                    onClick={handleStartConsultation}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Video className="h-5 w-5" />
                    <span>{actionLoading ? 'Starting...' : 'Start Consultation Now'}</span>
                  </button>
                )}
                {consultationData.consultation_status === 'active' && (
                  <>
                    <EmergencyVideoCallButton
                      emergencyId={consultationData.id}
                      token={token}
                      isDoctor={user?.role === 'doctor'}
                      isPatient={user?.role === 'patient'}
                      consultationStarted={consultationData.consultation_started}
                      consultationEnded={!!consultationData.consultation_end_time}
                      size="small"
                      className="mr-2"
                    />
                    {/* <button
                      onClick={handleEndConsultation}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>{actionLoading ? 'Ending...' : 'End Consultation'}</span>
                    </button> */}
                  </>
                )}
                {consultationData.consultation_status === 'ended' && (
                  <div className="flex-1 bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Consultation Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Consultation Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-900 font-medium">{consultationData.consultation_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="text-gray-900 font-medium">{consultationData.consultation_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="text-red-600 font-medium">Emergency</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-gray-900 font-medium">
                    {consultationData.duration_minutes ? `${consultationData.duration_minutes} mins` : '30 mins (est.)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="text-gray-900 font-medium">Video Call</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Payment Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Consultation</span>
                  <span className="text-gray-900 font-medium">{consultationData.formatted_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-gray-900 font-medium">{consultationData.platform_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">{consultationData.tax_amount}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{consultationData.total_amount}</span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Payment Confirmed</span>
                  </div>
                  <p className="text-green-700 text-xs mt-1">{consultationData.payment_method_display}</p>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-semibold mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Emergency Notice
              </h3>
              <p className="text-red-700 text-sm">
                If this is a life-threatening emergency, please call 911 immediately or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>

        {/* End Consultation Confirmation Modal */}
        {showEndConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">End Consultation</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end this emergency consultation? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEndConsultation}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndConsultation}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  {actionLoading ? 'Ending...' : 'End Consultation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}