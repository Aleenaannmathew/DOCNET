import React, { useState } from 'react';
import { Star, MapPin, Calendar, User, Phone, Clock, Heart, Loader } from 'lucide-react';

function EmergencyDoctorCard({ doctor, onPaymentSuccess }) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!doctor) {
    return (
      <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    if (profileImage.startsWith('/')) {
      return `${window.location.origin}${profileImage}`;
    }
    
    return `${window.location.origin}/media/${profileImage}`;
  };

  const profileImageUrl = getProfileImageUrl(doctor?.profile_image);

  const handleEmergencyPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create payment order
      const response = await fetch('/api/create-emergency-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await response.json();

      // Razorpay payment options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Emergency Consultation",
        description: `Emergency consultation with ${orderData.doctor_name}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-emergency-payment/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData);
            }
            
            // Redirect to consultation room or show success message
            alert('Payment successful! Connecting you to the doctor...');
            window.location.href = verifyData.meeting_link;
            
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: "Patient Name", // You can get this from user context
          email: "patient@example.com", // You can get this from user context
        },
        theme: {
          color: "#dc2626", // Red color for emergency
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-red-200 hover:border-red-300 relative">
      {/* Emergency Badge */}
      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
        <Heart size={14} className="text-white" />
        Emergency Available
      </div>

      {/* Doctor Image */}
      <div className="relative h-48 bg-gradient-to-br from-red-100 to-pink-100">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`Dr. ${doctor.username}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback avatar */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}
        >
          {doctor?.username ? (
            <span className="text-red-600 font-bold text-4xl">
              {doctor.username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={60} className="text-red-600" />
          )}
        </div>

        {/* Online Status */}
        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Online Now
        </div>
      </div>

      {/* Doctor Information */}
      <div className="p-6">
        {/* Name and Specialization */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-1">
            {`Dr. ${doctor?.username || 'Unknown Doctor'}`}
          </h3>
          <p className="text-red-600 font-semibold text-base">
            {doctor?.specialization || 'General Practitioner'}
          </p>
        </div>

        {/* Rating */}
        {doctor?.rating && (
          <div className="flex items-center justify-center mb-4 bg-yellow-50 rounded-lg py-2">
            <div className="flex mr-2">
              {renderStars(doctor.rating)}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {doctor.rating} ({doctor.total_reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Emergency Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mr-3">
              <Clock size={16} className="text-red-600" />
            </div>
            <span className="font-medium">Available 24/7 for Emergency</span>
          </div>

          {doctor?.hospital && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <span className="truncate font-medium">{doctor.hospital}</span>
            </div>
          )}
          
          {doctor?.experience && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                <Calendar size={16} className="text-green-600" />
              </div>
              <span className="font-medium">{doctor.experience} years experience</span>
            </div>
          )}

          {doctor?.languages && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                <User size={16} className="text-purple-600" />
              </div>
              <span className="font-medium truncate">Languages: {doctor.languages}</span>
            </div>
          )}
        </div>

        {/* Emergency Fee */}
        <div className="bg-red-50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              Emergency Consultation Fee
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{doctor?.emergency_fee || 800}
            </div>
            <div className="text-sm text-gray-600">
              Instant consultation available
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div>Reg ID: {doctor?.registration_id || 'N/A'}</div>
          <div className="flex items-center space-x-2">
            {doctor?.age && <span>Age: {doctor.age}</span>}
            {doctor?.gender && (
              <>
                {doctor?.age && <span>•</span>}
                <span>{doctor.gender}</span>
              </>
            )}
          </div>
        </div>

        {/* Pay and Consult Button */}
        <button 
        
          disabled={isProcessingPayment}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessingPayment ? (
            <>
              <Loader size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Phone size={20} />
              Pay & Consult Now - ₹{doctor?.emergency_fee || 800}
            </>
          )}
        </button>

        {/* Response Time */}
        <div className="mt-3 text-center text-sm text-gray-600">
          <Clock size={14} className="inline mr-1" />
          Typical response time: 2-5 minutes
        </div>
      </div>
    </div>
  );
}

export default EmergencyDoctorCard;