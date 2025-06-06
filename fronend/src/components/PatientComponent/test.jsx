
// function AppointmentModal({ isOpen, onClose, doctor}) {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [slotByDate, setSlotsByDate] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [fetchingSlots, setFetchingSlots] = useState(false);


//   useEffect(() => {
//     if (isOpen && doctor?.id) {
//       fetchDoctorSlots();
//     }
//   }, [isOpen, doctor]);

//   const fetchDoctorSlots = async () => {
//     setFetchingSlots(true);
//     try {
//       const response = await userAxios.get(`/doctor-slots/${doctor.id}/`);
//       console.log("hii",response.data)
//       setSlotsByDate(response.data);
//     } catch (error) {
//       console.error('Error fetching slots:', error);
//       alert('Failed to fetch available slots');
//     } finally {
//       setFetchingSlots(false);
//     }
//   };

//   const handleBookAppointment = async () => {
//     if (!selectedSlot) {
//         alert('Please select a time slot');
//         return
//     }

//     setLoading(true);
//     try {
//         const response = await userAxios.post('/book-appointment', {
//             slot_id: selectedSlot.id,
//             doctor_id: doctor.id,
//         });

//         alert('Appointment booked successfully!');
//         onClose();
//     } catch (error) {
//         console.error('Booking error: ', error);
//         alert('Failed to book appointment');
//     } finally {
//         setLoading(false);
//     }
//     };

//     if (!isOpen) return null;

//   const availableDates = Object.keys(slotByDate).sort();
//   const availableTimes = selectedDate ? slotByDate[selectedDate] || [] : [];

//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', {
//         weekday: 'long',
//         month: 'short',
//         day: 'numeric'
//     })
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Book Appointment</h3>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//           </div>

//           <div className="mb-4">
//             <h4 className="font-medium mb-2">Dr. {doctor.username}</h4>
//             <p className="text-sm text-gray-600">{doctor.specialization}</p>
//           </div>

//           {fetchingSlots ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Select Date</label>
//                 <select 
//                   value={selectedDate} 
//                   onChange={(e) => {
//                     setSelectedDate(e.target.value);
//                     setSelectedSlot(null);
//                   }}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   disabled={fetchingSlots}
//                 >
//                   <option value="">Choose a date</option>
//                   {availableDates.map(date => (
//                     <option key={date} value={date}>
//                       {formatDate(date)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedDate && (
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Available Time Slots</label>
//                   {availableSlots.length === 0 ? (
//                     <p className="text-gray-500 py-2">No available slots for this date</p>
//                   ) : (
//                     <div className="grid grid-cols-2 gap-2">
//                       {availableSlots.map(slot => (
//                         <button
//                           key={slot.id}
//                           onClick={() => setSelectedSlot(slot)}
//                           className={`p-3 text-sm border rounded-md transition-colors flex items-center ${
//                             selectedSlot?.id === slot.id
//                               ? 'bg-teal-600 text-white border-teal-600'
//                               : 'border-gray-300 hover:border-teal-300'
//                           }`}
//                         >
//                           {slot.type === 'Video Call' ? (
//                             <Video size={16} className="mr-2" />
//                           ) : (
//                             <MessageSquare size={16} className="mr-2" />
//                           )}
//                           {slot.time}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {selectedSlot && (
//                 <div className="bg-gray-50 p-4 rounded-md">
//                   <h4 className="font-medium mb-2">Appointment Details</h4>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div>
//                       <p className="text-gray-500">Date</p>
//                       <p>{formatDate(selectedDate)}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Time</p>
//                       <p>{selectedSlot.time}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Duration</p>
//                       <p>{selectedSlot.duration} mins</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Type</p>
//                       <p>{selectedSlot.type}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={onClose}
//               className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleBookAppointment}
//               disabled={loading || !selectedSlot}
//               className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
//             >
//               {loading ? 'Booking...' : 'Confirm Booking'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }  
  
  {/* Appointment Modal */}
      {/* <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        doctor={doctor}
    /> */}









    import React, { useState } from 'react';
import { Lock, Mail, Phone, User, CheckCircle } from 'lucide-react';

// Mock Formik and Yup for demonstration
const Formik = ({ children, initialValues, validationSchema, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(values, { setFieldError, setSubmitting: setIsSubmitting });
  };

  return children({
    values,
    setValues,
    errors,
    touched,
    setTouched,
    isSubmitting,
    handleSubmit,
    setFieldError
  });
};

const Form = ({ children, onSubmit }) => (
  <div className="space-y-6">
    {children}
  </div>
);

const Field = ({ name, component: Component, ...props }) => {
  return <Component name={name} {...props} />;
};

const ErrorMessage = ({ name, component: Component = "div", className, errors, touched }) => {
  if (!errors[name] || !touched[name]) return null;
  return <Component className={className}>{errors[name]}</Component>;
};

// Validation schema mock
const validationSchema = {
  username: { min: 3, required: true },
  email: { email: true, required: true },
  phone: { pattern: /^[0-9]{10,15}$/, required: true },
  password: { min: 8, required: true },
  password2: { match: 'password', required: true },
  agreeToTerms: { required: true }
};

const initialValues = {
  username: '',
  email: '',
  phone: '',
  password: '',
  password2: '',
  agreeToTerms: false
};

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setFieldError, setSubmitting }) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      // Simulate API call
      console.log("Registration data:", values);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      alert("Registration successful! Redirecting to OTP verification...");
    } catch (error) {
      console.error('Registration failed:', error);
      setServerError('Registration failed. Please try again later.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const FormInput = ({ name, placeholder, type = "text", icon: Icon, values, setValues, errors, touched, setTouched, ...props }) => {
    const hasError = errors[name] && touched[name];
    
    const handleChange = (e) => {
      setValues(prev => ({ ...prev, [name]: e.target.value }));
    };

    const handleBlur = () => {
      setTouched(prev => ({ ...prev, [name]: true }));
    };
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {placeholder}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
          <input
            type={type}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={`Enter ${placeholder.toLowerCase()}`}
            className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
              hasError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300'
            }`}
            {...props}
          />
        </div>
        <ErrorMessage 
          name={name} 
          component="p" 
          className="text-red-500 text-sm" 
          errors={errors}
          touched={touched}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Creating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Illustration */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute bottom-20 right-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute top-1/2 right-10 w-8 h-8 bg-white rounded-full"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center lg:text-left">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">DOCNET</h1>
                <div className="w-20 h-1 bg-white/30 mb-6"></div>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-semibold mb-4 leading-tight">
                Join a network of trusted medical professionals
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Connect with certified healthcare providers and start your health journey today
              </p>
              
              {/* Illustration Area */}
              <div className="flex justify-center items-center">
                <div className="relative">
                  {/* User Avatar */}
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/30">
                    <User size={48} className="text-white" />
                  </div>
                  
                  {/* Success Checkmark */}
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -left-8 top-8 w-6 h-6 bg-white/20 rounded-lg rotate-45"></div>
                  <div className="absolute -right-6 bottom-8 w-4 h-4 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">
                  Fill in your details to get started with DOCNET
                </p>
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{serverError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setValues, errors, touched, setTouched, isSubmitting, handleSubmit }) => (
                  <Form>
                    {/* Username */}
                    <Field
                      name="username"
                      component={FormInput}
                      placeholder="Username"
                      icon={User}
                      values={values}
                      setValues={setValues}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />

                    {/* Email */}
                    <Field
                      name="email"
                      component={FormInput}
                      type="email"
                      placeholder="Email Address"
                      icon={Mail}
                      values={values}
                      setValues={setValues}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />

                    {/* Phone */}
                    <Field
                      name="phone"
                      component={FormInput}
                      type="tel"
                      placeholder="Phone Number"
                      icon={Phone}
                      values={values}
                      setValues={setValues}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />

                    {/* Password */}
                    <Field
                      name="password"
                      component={FormInput}
                      type="password"
                      placeholder="Password"
                      icon={Lock}
                      values={values}
                      setValues={setValues}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />

                    {/* Confirm Password */}
                    <Field
                      name="password2"
                      component={FormInput}
                      type="password"
                      placeholder="Confirm Password"
                      icon={Lock}
                      values={values}
                      setValues={setValues}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />

                    {/* Terms Checkbox */}
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="agreeToTerms"
                          checked={values.agreeToTerms}
                          onChange={(e) => setValues(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                          onBlur={() => setTouched(prev => ({ ...prev, agreeToTerms: true }))}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-5">
                          I agree to the{' '}
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                            Terms of Service
                          </span>{' '}
                          and{' '}
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                            Privacy Policy
                          </span>
                        </label>
                      </div>
                      <ErrorMessage 
                        name="agreeToTerms" 
                        component="p" 
                        className="text-red-500 text-sm" 
                        errors={errors}
                        touched={touched}
                      />
                    </div>

                    {/* Submit Button */}
                    <div
                      onClick={() => !isSubmitting && handleSubmit()}
                      className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer text-center ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Patient Account'
                      )}
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center pt-4">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <button 
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                          onClick={() => console.log('Navigate to login')}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}