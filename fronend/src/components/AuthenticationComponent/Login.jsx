import React from 'react';
import { useState, useEffect } from 'react';
import { User, Lock, X, CheckCircle, AlertCircle, Heart, Shield, Users, Calendar } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';
import GoogleAuthButton from './Google';

// Validation schema using Yup
const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .trim(),
  password: Yup.string()
    .required('Password is required')
});

// Initial form values
const initialValues = {
  username: '',
  password: ''
};

export default function Login() {
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromOtpVerification = urlParams.get('verified') === 'true';

    if (fromOtpVerification) {
      setShowNotification(true);
      
      // Auto-hide notification after 8 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
        
        // Optional: Clean up the URL by removing the query parameter
        navigate('/login', { replace: true });
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('message') === 'account_deactivated') {
      alert('Your account has been deactivated by admin. Please contact support if you believe this is an error.');
    }
  }, [location]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setError(null);
    
    try {
      // API call to backend using the userAxios instance
      const response = await userAxios.post('/login/', {
        username: values.username.trim(),
        password: values.password
      });
      
      const data = response.data;
      
      dispatch(login({
        token: data.access,
        refreshToken: data.refresh,
        user: {
          username: data.username,
          email: data.email,
          role: 'patient',
          is_profile_complete: data.is_profile_complete || false,
          // Add any other user data you get from the response
        }
      }));

      navigate('/', { replace: true });
      
    } catch (error) {
      // Handle axios error responses
      if (error.response) {
        const serverErrors = error.response.data;
        
        // Check for field-specific errors first
        if (serverErrors.username) {
          setFieldError('username', Array.isArray(serverErrors.username) 
            ? serverErrors.username[0] 
            : serverErrors.username);
        }
        
        if (serverErrors.password) {
          setFieldError('password', Array.isArray(serverErrors.password) 
            ? serverErrors.password[0] 
            : serverErrors.password);
        }
        
        // Set general error for non-field errors
        const errorMessage = serverErrors.detail || 
                            serverErrors.non_field_errors?.[0] || 
                            'Invalid username or password';
        setError(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError(error.message || 'An error occurred during login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Custom input component for consistent styling
  const FormInput = ({ field, form, placeholder, type = "text", icon: Icon, ...props }) => {
    const hasError = form.errors[field.name] && form.touched[field.name];
    
    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Icon size={18} />
        </div>
        <input
          {...field}
          {...props}
          type={type}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
            hasError 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-teal-500'
          } focus:ring-2 focus:border-transparent outline-none shadow-sm transition-all duration-200 bg-white`}
        />
        <ErrorMessage 
          name={field.name} 
          component="p" 
          className="text-red-500 text-sm mt-1 ml-1" 
        />
      </div>
    );
  };

  const navigateToSignUp = () => {
    navigate('/register');
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 bg-white border-l-4 border-green-500 text-green-700 p-6 rounded-xl shadow-2xl max-w-md flex items-start animate-slide-in">
          <div className="flex">
            <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Registration Successful!</p>
              <p className="text-sm text-gray-600 mt-1">Your account has been verified. Please login to continue.</p>
            </div>
          </div>
          <button
            onClick={closeNotification}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Professional branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-600 to-teal-800 p-8 flex-col text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-16 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <Heart className="mr-3" size={32} />
              <h1 className="font-bold text-3xl">DOCNET</h1>
            </div>
            <div className="mb-12">
              <h2 className="font-semibold text-3xl mb-4 leading-tight">
                Welcome back to<br />
                your <span className="text-teal-200">health journey</span>
              </h2>
              <p className="text-teal-100 text-lg leading-relaxed">
                Continue your path to better health. Access your personalized dashboard and connect with your healthcare team.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Secure Health Records Access</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Connect with Your Care Team</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Manage Your Appointments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-3/5 p-6 md:p-12 flex justify-center items-center">
          <div className="w-full max-w-xl">
            {/* Mobile Header */}
            <div className="block lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Heart className="mr-3 text-teal-600" size={32} />
                <h1 className="font-bold text-3xl text-teal-600">DOCNET</h1>
              </div>
              <h2 className="font-semibold text-xl text-gray-800 mb-2">
                Welcome back to your health journey
              </h2>
              <p className="text-gray-600">Continue your path to better health</p>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-lg">
                Sign in to access your dashboard and connect with your care team.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, handleChange }) => (
                <div className="space-y-6">
                  {/* Login Form Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="mr-2 text-teal-600" size={20} />
                      Account Login
                    </h3>
                    <Form className="space-y-4">
                      {/* Username field */}
                      <Field
                        name="username"
                        component={FormInput}
                        placeholder="Username"
                        icon={User}
                        onChange={(e) => {
                          handleChange(e);
                          // Clear general error when user starts typing
                          if (error) {
                            setError(null);
                          }
                        }}
                      />

                      {/* Password field */}
                      <Field
                        name="password"
                        component={FormInput}
                        type="password"
                        placeholder="Password"
                        icon={Lock}
                        onChange={(e) => {
                          handleChange(e);
                          // Clear general error when user starts typing
                          if (error) {
                            setError(null);
                          }
                        }}
                      />

                      <div className="flex justify-end">
                        <span
                          onClick={() => navigate('/forgot-password')}
                          className="text-teal-600 text-sm cursor-pointer hover:text-teal-800 font-medium transition-colors duration-200"
                        >
                          Forgot password?
                        </span>
                      </div>

                      {/* Login Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-teal-300"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing In...
                          </div>
                        ) : (
                          'Sign In to Your Account'
                        )}
                      </button>
                    </Form>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center">
                    <hr className="flex-1 border-gray-200" />
                    <span className="mx-4 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      or continue with
                    </span>
                    <hr className="flex-1 border-gray-200" />
                  </div>

                  {/* Google Sign-In Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <GoogleAuthButton />
                  </div>

                  {/* Sign up link */}
                  <div className="text-center text-gray-600 pt-4">
                    Don't have an account?{' '}
                    <span 
                      className="text-teal-600 font-medium cursor-pointer hover:underline transition-colors duration-200"
                      onClick={navigateToSignUp}
                    >
                      Create Account
                    </span>
                  </div>
                </div>
              )}
            </Formik>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <span className="text-teal-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-teal-600 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}