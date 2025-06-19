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
  Award,
  Stethoscope,
  X,
  Check,
  CreditCard,
  Loader,
  MessageCircle,
  Shield,
  BadgeCheck,
  GraduationCap,
  Building2,
  Languages,
  ChevronRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

function DoctorDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useSelector((state) => state.auth)

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await userAxios.get(`/doctor-details/${slug}/`);
        setDoctor(response.data);

        // Check if doctor is in favorites
        const favoritesResponse = await userAxios.get('/user/favorites/');
        if (favoritesResponse.data.some(fav => fav.doctor === response.data.id)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [slug]);

  // Fetch doctor reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!doctor) return;

      try {
        const response = await userAxios.get(`/doctor-reviews/${doctor.username}/`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [doctor]);

  // Fetch available time slots
  const fetchDoctorSlots = async () => {
    if (!doctor?.username) return;

    try {
      setSlotsLoading(true);
      const response = await userAxios.get(`/doctor-slots/${doctor.username}/`);

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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaymentLoading(true);

    const res = await loadRazorpay();
    if (!res) {
      alert("Failed to load Razorpay SDK.");
      setPaymentLoading(false);
      return;
    }

    try {
      const createRes = await userAxios.post("/payments/create/", {
        slot: selectedSlot.id,
        amount: selectedSlot.fee,
      });

      const { razorpay_order } = createRes.data;

      const options = {
        key: "rzp_test_JFRhohewvJ81Dl", // Razorpay API key (test mode)
        amount: razorpay_order.amount,
        currency: razorpay_order.currency,
        name: "DOCNET Health",
        description: "Consultation Fee",
        order_id: razorpay_order.id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying...", response);
            const verifyRes = await userAxios.post("/payments/verify/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 201 || verifyRes.status === 200) {
              // Close modal first
              setIsAppointmentModalOpen(false);
              setSelectedSlot(null);
              setPaymentLoading(false);

              setTimeout(() => {
              const paymentId = response.razorpay_payment_id;
              console.log("Navigating to confirmation page with payment ID:", paymentId);
              navigate(`/booking-confirmation/payment/${paymentId}`);
            }, 100);
            } else {
              console.error("Payment verification failed:", verifyRes);
              alert("❌ Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("❌ Error verifying payment: " + (error.response?.data?.message || error.message));
          setPaymentLoading(false);
          }

          setPaymentLoading(false);
        },
        prefill: {
          name: user?.name || "Patient",
          email: user?.email || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            // Handle case when user closes payment modal
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Error initiating payment.");
      setPaymentLoading(false);
    }
  };


  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await userAxios.delete(`/user/favorites/${doctor.id}/`);
      } else {
        await userAxios.post('/user/favorites/', { doctor_id: doctor.id });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'}
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-gray-600 mt-1">with Dr. {doctor?.username}</p>
            </div>
            <button
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setSelectedSlot(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={paymentLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {slotsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading available slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Available Time Slots</h3>
                <div className="space-y-3 mb-8">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={slot.id || index}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedSlot?.id === slot.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {formatSlotDate(slot)}
                          </div>
                          <div className="text-blue-600 font-bold text-xl mb-2">
                            {formatSlotTime(slot)}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span className={`w-2 h-2 rounded-full ${slot.type === 'Video Call' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                              {slot.type}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.duration} min
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {selectedSlot?.id === slot.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                          <Clock size={18} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consultation Fee Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 text-lg">Consultation Fee</h4>
                      <p className="text-blue-700 mt-1">Secure one-time payment</p>
                    </div>
                    <div className="text-3xl font-bold text-blue-900">
                      ₹{selectedSlot?.fee || (availableSlots.length > 0 ? availableSlots[0].fee : 'N/A')}
                    </div>
                  </div>
                </div>

                {selectedSlot && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold mb-4 text-gray-900 text-lg">Appointment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">DATE & TIME</p>
                        <p className="text-gray-900">{formatSlotDate(selectedSlot)}</p>
                        <p className="text-blue-600 font-semibold">{formatSlotTime(selectedSlot)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">CONSULTATION</p>
                        <p className="text-gray-900">{selectedSlot.type}</p>
                        <p className="text-gray-600">{selectedSlot.duration} minutes</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
                      >
                        {paymentLoading ? (
                          <Loader size={20} className="animate-spin" />
                        ) : (
                          <CreditCard size={20} />
                        )}
                        {paymentLoading ? 'Processing Payment...' : `Pay ₹${selectedSlot?.fee} & Confirm`}
                      </button>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">🔐 Secure payment powered by Razorpay</p>
                        <p className="text-xs text-gray-500 mt-1">UPI • Cards • Net Banking • Wallets</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2 text-lg">No available slots</p>
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Doctors</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-lg">
                  {doctor.profile_image ? (
                    <img
                      src={doctor.profile_image}
                      alt={`Dr. ${doctor.username}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-5xl">
                        {doctor.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      Dr. {doctor.username}
                    </h1>
                    <BadgeCheck className="text-blue-500" size={24} />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xl text-blue-600 font-semibold">
                      {doctor.specialization}
                    </span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Building2 size={16} className="text-gray-500" />
                      <span className="text-gray-600">{doctor.hospital}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.floor(doctor.rating || 0))}
                      <span className="font-semibold text-gray-900">
                        {doctor.rating}
                      </span>
                      <span className="text-gray-500">
                        ({doctor.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award size={16} className="mr-1" />
                      <span className="font-medium">{doctor.experience} years exp.</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-colors ${isFavorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >

                </button>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleBookAppointment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Book Appointment
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'experience', label: 'Experience', icon: GraduationCap },
              { key: 'reviews', label: 'Reviews', icon: Star },
              { key: 'location', label: 'Location', icon: MapPin },
              { key: 'timings', label: 'Schedule', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">About Dr. {doctor.username}</h2>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">{doctor.about}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className="text-blue-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Specialization</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{doctor.specialization}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Languages className="text-green-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Languages</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{doctor.languages}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="text-purple-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Experience</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{doctor.experience} years</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="text-orange-600" size={20} />
                      <h3 className="font-semibold text-gray-900">License ID</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{doctor.registration_id}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Education & Experience</h2>

                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" size={24} />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {doctor.education?.map((edu, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                        <span className="text-gray-800 font-medium">{edu}</span>
                      </div>
                    )) || <p className="text-gray-500">No education data available</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                    <BadgeCheck className="text-green-600" size={24} />
                    Certifications
                  </h3>
                  <div className="space-y-4">
                    {doctor.certifications?.map((cert, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                        <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800 font-medium">{cert}</span>
                      </div>
                    )) || <p className="text-gray-500">No certifications data available</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Patient Reviews</h2>

                <div className="space-y-6">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {review.patientName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{review.patientName}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-8">No reviews available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Location & Contact</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <MapPin size={24} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">Clinic Address</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {doctor.hospital}<br />
                        200 First Street SW<br />
                        Rochester, MN 55905
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-100">
                    <Phone size={24} className="text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-900">Phone</h3>
                      <p className="text-gray-700 font-medium">{doctor.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-xl border border-purple-100">
                    <Mail size={24} className="text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-900">Email</h3>
                      <p className="text-gray-700 font-medium">{doctor.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timings' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Weekly Schedule</h2>

                <div className="space-y-3">
                  {getWeeklySchedule().map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-semibold text-gray-900">{schedule.day}</span>
                      <span className={`font-medium ${schedule.available ? 'text-green-600' : 'text-red-500'}`}>
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
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-900 text-lg">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium text-gray-900">{doctor.hospital}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">{doctor.experience} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender & Age</p>
                    <p className="font-medium text-gray-900">{doctor.gender}, {doctor.age} years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Slots Preview */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-900 text-lg">Available This Week</h3>
              <div className="space-y-4">
                {availableSlots.slice(0, 3).map((slot, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{slot.time}</p>
                    </div>
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {slot.type}
                    </div>
                  </div>
                ))}
                {availableSlots.length === 0 && (
                  <p className="text-sm text-gray-500">No available slots this week</p>
                )}
              </div>
              <button
                onClick={handleBookAppointment}
                className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View all available slots <ChevronRight size={16} />
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