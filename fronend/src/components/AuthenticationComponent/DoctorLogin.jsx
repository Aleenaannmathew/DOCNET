import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Lock, X, CheckCircle, AlertCircle, Stethoscope, Shield, Calendar, FileText } from 'lucide-react';
import { doctorAxios } from '../../axios/DoctorAxios';
import DocnetLoading from '../Constants/Loading';
import { login } from '../../store/authSlice';
import GoogleAuthButton from '../DoctorComponent/GoogleAuth';

// Validation Schema using Yup
const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
});

const CustomField = ({ icon: Icon, name, type, placeholder, error, touched }) => (
  <div className="mb-4">
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
        <Icon size={18} />
      </div>
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
          error && touched
            ? 'border-red-400 focus:ring-red-400' 
            : 'border-gray-200 focus:ring-blue-500'
        } focus:ring-2 focus:border-transparent outline-none shadow-sm transition-all duration-200`}
      />
    </div>
    <ErrorMessage 
      name={name} 
      component="p" 
      className="text-red-500 text-sm mt-1 ml-1" 
    />
  </div>
);

export default function DoctorLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Initial form values
  const initialValues = {
    username: '',
    password: ''
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromOtpVerification = urlParams.get('verified') === 'true';
  
    if (fromOtpVerification) {
      setShowNotification(true);
      
      // Auto-hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
        
        // Clean up the URL by removing the query parameter
        navigate('/doctor/doctor-login', { replace: true });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // Redirect if already logged in and is a doctor
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'doctor') {
      // Check if doctor is approved
      if (user.doctor_profile?.is_approved) {
        navigate('/doctor/doctor-landing');
      } else {
        navigate('/doctor/pending-approval');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const closeNotification = () => {
    setShowNotification(false);
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      const response = await doctorAxios.post('/doctor-login/', values);
      
      if (response.data) {
        // Store auth data in Redux
        dispatch(login({
          token: response.data.access,
          refreshToken: response.data.refresh,
          user: {
            id: response.data.user_id,
            username: response.data.username,
            email: response.data.email,
            phone: response.data.phone,
            role: 'doctor',
            doctor_profile: {
              registration_id: response.data.registration_id,
              hospital: response.data.hospital,
              languages: response.data.languages,
              age: response.data.age,
              gender: response.data.gender,
              experience: response.data.experience,
              is_approved: response.data.is_approved
            }
          }
        }));
        
        // Redirect based on approval status
        if (response.data.is_approved) {
          navigate('/doctor/doctor-landing');
        } else {
          navigate('/doctor/pending-approval');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle API error responses
      if (error.response?.data) {
        const serverErrors = error.response.data;
        
        // Display non-field errors
        if (typeof serverErrors === 'string') {
          setServerError(serverErrors);
        } 
        // Display field errors
        else if (typeof serverErrors === 'object') {
          // Handle field-specific errors
          Object.keys(serverErrors).forEach(key => {
            if (key === 'username' || key === 'password') {
              const errorMsg = Array.isArray(serverErrors[key]) 
                ? serverErrors[key][0] 
                : serverErrors[key];
              setFieldError(key, errorMsg);
            }
          });
          
          // Check for non-field errors
          if (serverErrors.non_field_errors) {
            const errorMsg = Array.isArray(serverErrors.non_field_errors)
              ? serverErrors.non_field_errors[0]
              : serverErrors.non_field_errors;
            setServerError(errorMsg);
          }
          
          // Handle general server error messages
          if (serverErrors.detail) {
            setServerError(serverErrors.detail);
          }
        }
      } else {
        setServerError('Login failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <DocnetLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md max-w-md flex items-start">
          <div className="flex">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
            <div>
              <p className="font-bold">Registration Successful!</p>
              <p className="text-sm">Your account has been verified. Please login to continue.</p>
            </div>
          </div>
          <button
            onClick={closeNotification}
            className="ml-4 text-green-700 hover:text-green-900"
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Professional Medical Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-16 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <Stethoscope className="mr-3" size={32} />
              <h1 className="font-bold text-3xl">DOCNET</h1>
            </div>
            <div className="mb-12">
              <h2 className="font-semibold text-3xl mb-4 leading-tight">
                Welcome Back,<br />
                <span className="text-blue-200">Medical Professional</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Continue providing exceptional care and managing your practice with our comprehensive medical platform.
              </p>
            </div>
            
            {/* Professional Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">HIPAA Compliant & Secure</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">Digital Health Records</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">Smart Appointment Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-3/5 p-6 md:p-12 flex justify-center items-center">
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="block lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Stethoscope className="mr-3 text-blue-600" size={32} />
                <h1 className="font-bold text-3xl text-blue-600">DOCNET</h1>
              </div>
              <h2 className="font-semibold text-xl text-gray-800">
                Welcome Back, Doctor!
              </h2>
              <p className="text-gray-600 mt-2">Access your patient records and appointments</p>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Doctor Login
              </h2>
              <p className="text-gray-600 text-lg">
                Sign in to access your professional dashboard
              </p>
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    {/* Username Field */}
                    <CustomField
                      icon={User}
                      name="username"
                      type="text"
                      placeholder="Username"
                      error={errors.username}
                      touched={touched.username}
                    />

                    {/* Password Field */}
                    <CustomField
                      icon={Lock}
                      name="password"
                      type="password"
                      placeholder="Password"
                      error={errors.password}
                      touched={touched.password}
                    />

                    {/* Forgot Password */}
                    <div className="text-right">
                      <Link 
                        to="/doctor/password-request" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors duration-200"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                      <hr className="flex-1 border-gray-200" />
                      <span className="mx-4 text-sm text-gray-500 font-medium">or sign in with</span>
                      <hr className="flex-1 border-gray-200" />
                    </div>

                    <GoogleAuthButton />

                    {/* Register link */}
                    <div className="text-center text-gray-600 pt-4">
                      Don't have an account?{' '}
                      <Link 
                        to="/doctor/doctor-register" 
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors duration-200"
                      >
                        Register as Doctor
                      </Link>
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