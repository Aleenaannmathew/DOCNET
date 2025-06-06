import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Heart,
  Award,
  Stethoscope,
  X,
  Check,
  CreditCard,
  Loader
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';

function DoctorDetailPage() {
    const { slug } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [availableSlots, setAvailableSlots] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slug1, setSlug1] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [appointmentFee, setAppointmentFee] = useState(500);

  const fetchDoctorSlots = async () => {
    if (!doctor?.username) return;
    
    try {
      setSlotsLoading(true);
      const response = await userAxios.get(`/doctor-slots/${doctor.username}/`);
      console.log("Available slots:", response.data);
      
     
      if (response.data.success && response.data.data) {
        const slotsData = response.data.data;
        const flattenedSlots = [];
        Object.keys(slotsData).forEach(date => {
          slotsData[date].forEach(slot => {
            flattenedSlots.push({
              ...slot,
              date: date
            });
          });
        });
        setAvailableSlots(flattenedSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      alert('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = () => {
    setIsAppointmentModalOpen(true);
    fetchDoctorSlots();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    try {
      setPaymentLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        return;
      }

    
      const orderResponse = await userAxios.post('/api/payment/create-order/', {
        amount: appointmentFee,
        doctor_username: doctor.username,
        slot_id: selectedSlot.id,
        appointment_details: {
          doctor_name: doctor.username,
          specialization: doctor.specialization,
          date: selectedSlot.date,
          time: selectedSlot.time,
          type: selectedSlot.type,
          duration: selectedSlot.duration
        }
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const { order_id, amount, currency, key } = orderResponse.data.data;

   
      const options = {
        key: key, 
        amount: amount,
        currency: currency,
        name: 'DOCNET',
        description: `Appointment with Dr. ${doctor.username}`,
        order_id: order_id,
        handler: async function (response) {
         
          try {
            const verifyResponse = await userAxios.post('/api/payment/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              slot_id: selectedSlot.id,
              doctor_username: doctor.username
            });

            if (verifyResponse.data.success) {
              alert('Payment successful! Your appointment has been confirmed.');
              setIsAppointmentModalOpen(false);
              setSelectedSlot(null);
            
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            
            handlePaymentCancel(order_id);
          }
        },
        prefill: {
          name: '', 
          email: '',
          contact: ''
        },
        theme: {
          color: '#0D9488'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentCancel = async (orderId) => {
    try {
      await userAxios.post('/api/payment/cancel/', {
        order_id: orderId
      });
      setPaymentLoading(false);
    } catch (error) {
      console.error('Error canceling payment:', error);
    }
  };

  useEffect(() => {
    console.log('Doctor ID from URL params:', slug); 
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching doctor details for ID:', slug);
        const response = await userAxios.get(`/doctor-details/${slug}/`);
        console.log('API response:', response);
        setDoctor(response.data);
        setSlug1(response.data.username);
        if (response.data.consultation_fee) {
          setAppointmentFee(response.data.consultation_fee);
        }
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          config: error.config
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [slug]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getWeeklySchedule = () => {
    
    return [
      { day: 'Monday', time: '9:00 AM - 5:00 PM', available: true },
      { day: 'Tuesday', time: '9:00 AM - 5:00 PM', available: true },
      { day: 'Wednesday', time: '9:00 AM - 5:00 PM', available: true },
      { day: 'Thursday', time: '9:00 AM - 5:00 PM', available: true },
      { day: 'Friday', time: '9:00 AM - 5:00 PM', available: true },
      { day: 'Saturday', time: '9:00 AM - 1:00 PM', available: true },
      { day: 'Sunday', time: 'Closed', available: false },
    ];
  };

  const formatSlotTime = (slot) => {
    return slot.time || 'Time not specified';
  };

  const formatSlotDate = (slot) => {
   
    if (slot.date) {
      return new Date(slot.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Date not specified';
  };

  const AppointmentModal = () => {
    if (!isAppointmentModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Book Appointment with Dr. {doctor?.username}</h2>
            <button
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setSelectedSlot(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={paymentLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {slotsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading available slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div>
                <h3 className="font-medium mb-4">Available Time Slots</h3>
                <div className="space-y-4">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={slot.id || index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatSlotDate(slot)}
                          </div>
                          <div className="text-teal-600 font-medium text-lg">
                            {formatSlotTime(slot)}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Type:</span> {slot.type}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Duration:</span> {slot.duration} min
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Max Patients:</span> {slot.max_patients}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consultation Fee Display */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Consultation Fee</h4>
                      <p className="text-sm text-blue-700">One-time payment for appointment</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      ₹{appointmentFee}
                    </div>
                  </div>
                </div>

                {selectedSlot && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Selected Appointment</h4>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date & Time:</span> {formatSlotDate(selectedSlot)} at {formatSlotTime(selectedSlot)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {selectedSlot.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span> {selectedSlot.duration} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Consultation Fee:</span> ₹{appointmentFee}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentLoading ? (
                          <Loader size={20} className="animate-spin" />
                        ) : (
                          <CreditCard size={20} />
                        )}
                        {paymentLoading ? 'Processing...' : `Pay ₹${appointmentFee} & Confirm Appointment`}
                      </button>
                      
                      <div className="text-xs text-gray-500 text-center">
                        <p>Secure payment powered by Razorpay</p>
                        <p>We accept UPI, Cards, Net Banking & Wallets</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No available slots found</p>
                <p className="text-sm text-gray-500">
                  Please try again later or contact the doctor directly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button className="flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Doctors
          </button>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                {doctor.profile_image ? (
                  <img 
                    src={doctor.profile_image} 
                    alt={`Dr. ${doctor.username}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-teal-700 font-bold text-4xl">
                    {doctor.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {doctor.username}
                  </h1>
                  <p className="text-xl text-teal-600 font-medium mb-2">
                    {doctor.specialization}
                  </p>
                  <p className="text-gray-600 mb-3">{doctor.hospital}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center">
                      {renderStars(Math.floor(doctor.rating || 0))}
                      <span className="ml-2 text-sm font-medium">
                        {doctor.rating || 0} ({doctor.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award size={16} className="mr-1" />
                      {doctor.experience} years experience
                    </div>
                  </div>

                  {/* Consultation Fee Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 inline-block">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Consultation Fee: ₹{appointmentFee}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Heart size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBookAppointment}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Book Appointment
                </button>
                <button className="border border-teal-600 text-teal-600 px-6 py-2 rounded-lg hover:bg-teal-50 transition-colors">
                  Contact Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {['overview', 'experience', 'reviews', 'location', 'timings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">About Dr. {doctor.username}</h2>
                <p className="text-gray-700 mb-4">{doctor.about}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-medium mb-2">Specialization</h3>
                    <p className="text-gray-600">{doctor.specialization}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Languages</h3>
                    <p className="text-gray-600">{doctor.languages}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Experience</h3>
                    <p className="text-gray-600">{doctor.experience} years</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Registration ID</h3>
                    <p className="text-gray-600">{doctor.registration_id}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Education & Experience</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Education</h3>
                  <ul className="space-y-2">
                    {doctor.education?.map((edu, index) => (
                      <li key={index} className="flex items-start">
                        <Award size={16} className="mr-2 mt-1 text-teal-600" />
                        <span className="text-gray-700">{edu}</span>
                      </li>
                    )) || <li className="text-gray-500">No education data available</li>}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Certifications</h3>
                  <ul className="space-y-2">
                    {doctor.certifications?.map((cert, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={16} className="mr-2 mt-1 text-green-600" />
                        <span className="text-gray-700">{cert}</span>
                      </li>
                    )) || <li className="text-gray-500">No certifications data available</li>}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Patient Reviews</h2>
                
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{review.patientName}</span>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500">No reviews available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin size={20} className="mr-3 mt-1 text-teal-600" />
                    <div>
                      <h3 className="font-medium mb-1">Address</h3>
                      <p className="text-gray-700">
                        {doctor.location?.address || 'Address not available'}<br/>
                        {doctor.location?.city}, {doctor.location?.state} {doctor.location?.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone size={20} className="mr-3 text-teal-600" />
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-gray-700">{doctor.phone || 'Phone not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail size={20} className="mr-3 text-teal-600" />
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-gray-700">{doctor.email || 'Email not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
                
                <div className="space-y-3">
                  {getWeeklySchedule().map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium">{schedule.day}</span>
                      <span className={`${schedule.available ? 'text-green-600' : 'text-red-500'}`}>
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Stethoscope size={16} className="mr-2 text-teal-600" />
                  <span className="text-sm">{doctor.specialization}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-teal-600" />
                  <span className="text-sm">{doctor.hospital}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-teal-600" />
                  <span className="text-sm">{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-teal-600" />
                  <span className="text-sm">{doctor.gender}, {doctor.age} years</span>
                </div>
                <div className="flex items-center">
                  <CreditCard size={16} className="mr-2 text-teal-600" />
                  <span className="text-sm font-medium">₹{appointmentFee} consultation</span>
                </div>
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Available This Week</h3>
              <div className="space-y-2">
                {Object.entries(timeSlots).slice(0, 3).map(([date, slots]) => (
                  <div key={date} className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-gray-600">
                      {slots.length} slots available
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">Loading availability...</p>
                )}
              </div>
              <button
                onClick={handleBookAppointment}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors mt-4"
              >
                View All Slots
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal />
    </div>
  );
}

export default DoctorDetailPage;