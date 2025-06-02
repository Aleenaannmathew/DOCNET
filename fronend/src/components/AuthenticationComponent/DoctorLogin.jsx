import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { doctorAxios } from '../../axios/DoctorAxios';
import DocnetLoading from '../Constants/Loading';
import { login } from '../../store/authSlice';
import docImg from '../../assets/doctor1.png';
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
        
        // Optional: Clean up the URL by removing the query parameter
        navigate('/doctor/doctor-login', { replace: true });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // Redirect if already logged in and is a doctor
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'doctor') {
      // Check if doctor is approved
      if (user.doctor_profile && user.doctor_profile.is_approved) {
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
      if (error.response && error.response.data) {
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
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
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Left Section - Only visible on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-8 flex-col">
        <div className="mb-8">
          <h1 className="text-teal-700 font-bold text-3xl">DOCNET</h1>
          <h2 className="text-gray-800 font-medium text-2xl mt-4">
            Welcome back, Doctor!<br />
            Continue providing exceptional care.
          </h2>
          <p className="text-gray-600 mt-2">Access your patient records and appointments</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img
            src={docImg}
            alt="Medical professional"
            className="w-4/5 max-w-lg h-auto"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 bg-gray-50 p-6 md:p-10 flex justify-center items-center">
        <div className="w-full max-w-md">
          {/* Mobile only header */}
          <div className="block lg:hidden mb-8">
            <h1 className="text-teal-700 font-bold text-3xl">DOCNET</h1>
            <h2 className="text-gray-800 font-medium text-xl mt-4">
              Welcome back, Doctor!
            </h2>
            <p className="text-gray-600 mt-2">Access your patient records and appointments</p>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Doctor Login</h2>
          <p className="text-gray-600 mb-8">
            Sign in to access your doctor dashboard.
          </p>

          {/* Server Error Display */}
          {serverError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Formik Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="flex flex-col space-y-6">
                {/* Username Field */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <User size={18} />
                  </div>
                  <Field
                    type="text"
                    name="username"
                    placeholder="Username"
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      errors.username && touched.username 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
                    } focus:ring-2 focus:border-transparent outline-none`}
                  />
                  <ErrorMessage 
                    name="username" 
                    component="p" 
                    className="text-red-500 text-sm mt-1" 
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      errors.password && touched.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
                    } focus:ring-2 focus:border-transparent outline-none`}
                  />
                  <ErrorMessage 
                    name="password" 
                    component="p" 
                    className="text-red-500 text-sm mt-1" 
                  />
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link to="/doctor/password-request" className="text-teal-600 hover:text-teal-800 text-sm">
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-teal-700 text-white hover:bg-teal-800'
                  }`}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="mx-4 text-sm text-gray-500">or sign in with</span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                <GoogleAuthButton/>

                {/* Register link */}
                <div className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/doctor/doctor-register" className="text-teal-500 hover:text-teal-700">
                    Register as Doctor
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}