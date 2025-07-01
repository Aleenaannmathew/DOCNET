import React, { useState } from 'react';
import { Star, Clock, Phone, Video, User, Award, CreditCard, Loader, X, Check } from 'lucide-react';
import { userAxios } from '../../axios/UserAxios';
import { useNavigate } from 'react-router-dom';

function EmergencyDoctorCard({ doctor, onPaymentSuccess }) {
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [reason, setReason] = useState(''); // Add state for reason

    const emergencyFee = 800;

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

    const handleEmergencyConsultation = async () => {
        // Validate reason before proceeding
        if (!reason.trim()) {
            alert("Please provide a reason for the emergency consultation.");
            return;
        }

        setPaymentLoading(true);

        const res = await loadRazorpay();
        if (!res) {
            alert("Failed to load Razorpay SDK.");
            setPaymentLoading(false);
            return;
        }

        try {
            // Create emergency payment with reason
            const createRes = await userAxios.post('/emergency-payments/create/', {
                doctor_id: doctor.user_id, 
                amount: emergencyFee,      
                reason: reason.trim()     
            });

            const createData = createRes.data;
            const { razorpay_order } = createData;

            const options = {
                key: "rzp_test_JFRhohewvJ81Dl", // Your Razorpay key
                amount: razorpay_order.amount,
                currency: razorpay_order.currency,
                name: "DOCNET Health - Emergency",
                description: "Emergency Consultation Fee",
                order_id: razorpay_order.id,
                handler: async function (response) {
                    try {

                        const verifyRes = await userAxios.post('/emergency-payments/verify/', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        const verifyData = verifyRes.data;

                        // Close modal
                        setIsPaymentModalOpen(false);
                        setPaymentLoading(false);

                        // Redirect to video call
                        if (onPaymentSuccess) {
                            onPaymentSuccess({
                                paymentId: verifyData.payment_id,
                                doctorName: verifyData.doctor_name,
                                amount: verifyData.consultation_fee
                            });
                        }

                        navigate(`/emergency-confirmation/payment/${verifyData.payment_id}`);


                    } catch (error) {
                        console.error("Emergency payment verification error:", error);
                        alert("❌ Error verifying payment: " + error.message);
                        setPaymentLoading(false);
                    }
                },
                prefill: {
                    name: "Patient", // You can get this from user context
                    email: "", // You can get this from user context
                },
                theme: {
                    color: "#DC2626", // Red theme for emergency
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Emergency payment initiation error:", err);
            alert("Error initiating emergency payment: " + err.message);
            setPaymentLoading(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < Math.floor(rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };



    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Emergency Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        EMERGENCY
                    </div>
                    <div className="text-green-600 text-xs font-semibold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ONLINE
                    </div>
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                        {doctor.profile_image || doctor.user?.profile_image ? (
                            <img
                                src={doctor.profile_image || doctor.user?.profile_image}
                                alt={`Dr. ${doctor.user?.username || doctor.username}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="text-red-600" size={24} />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                            Dr. {doctor.user?.username || doctor.username}
                        </h3>
                        <p className="text-red-600 font-medium text-sm">
                            {doctor.specialization || 'General Medicine'}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                                {renderStars(doctor.rating)}
                            </div>
                            <span className="text-xs text-gray-600">
                                ({doctor.total_reviews || 0})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Award className="mx-auto text-blue-600 mb-1" size={16} />
                        <div className="text-xs text-gray-600">Experience</div>
                        <div className="font-semibold text-sm">{doctor.experience || 0} years</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Clock className="mx-auto text-green-600 mb-1" size={16} />
                        <div className="text-xs text-gray-600">Response</div>
                        <div className="font-semibold text-sm">Instant</div>
                    </div>
                </div>

                {/* Emergency Consultation Button */}
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                    <Video size={18} />
                    Emergency Consult - ₹{emergencyFee}
                </button>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{doctor.hospital || 'Medical Center'}</span>
                        <div className="flex items-center gap-1">
                            <Phone size={12} />
                            <span>Available 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Emergency Consultation</h2>
                                <p className="text-gray-600 mt-1">with Dr. {doctor.user?.username || doctor.username}</p>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={paymentLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Reason Input Field */}
                            <div className="mb-6">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Emergency Consultation *
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please describe your medical emergency or urgent concern..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    rows={3}
                                    maxLength={500}
                                    disabled={paymentLoading}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {reason.length}/500 characters
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-xl p-6 mb-6 border border-red-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Video className="text-red-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-900">Instant Video Call</h3>
                                        <p className="text-red-700 text-sm">Connect immediately with the doctor</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-red-700">
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-red-600" />
                                        <span>Immediate consultation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-red-600" />
                                        <span>No appointment needed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-red-600" />
                                        <span>Direct video call access</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border border-red-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-red-900 text-lg">Emergency Fee</h4>
                                        <p className="text-red-700 mt-1">One-time payment</p>
                                    </div>
                                    <div className="text-3xl font-bold text-red-900">
                                        ₹{emergencyFee}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleEmergencyConsultation}
                                disabled={paymentLoading || !reason.trim()}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
                            >
                                {paymentLoading ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : (
                                    <CreditCard size={20} />
                                )}
                                {paymentLoading ? 'Processing Payment...' : `Pay ₹${emergencyFee} & Start Call`}
                            </button>

                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-500">🔐 Secure payment powered by Razorpay</p>
                                <p className="text-xs text-gray-500 mt-1">UPI • Cards • Net Banking • Wallets</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmergencyDoctorCard;