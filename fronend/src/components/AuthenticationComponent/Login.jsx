import React from 'react';
import { useState, useEffect } from 'react';
import { User, Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';
import doc1 from '../../assets/doctor1.png';
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
      <div>
        <div className="relative">
          <input
            {...field}
            {...props}
            type={type}
            placeholder={placeholder}
            className={`w-full py-3 px-4 pl-10 rounded-lg border ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-200 focus:ring-teal-500'
            } focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-sm`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
            <Icon size={17} />
          </div>
        </div>
        <ErrorMessage 
          name={field.name} 
          component="p" 
          className="text-red-500 text-sm mt-1" 
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
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

      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-10 flex flex-col">
        <div className="mb-6 md:mb-8">
          <h1 className="font-bold text-xl text-teal-700">DOCNET</h1>
          <h2 className="text-gray-800 font-medium text-xl mt-4">
            Welcome back to <br className="hidden sm:block" /> your health journey
          </h2>
          <p className="text-gray-600 mt-2">Log in to continue</p>
        </div>
        <div className="flex-1 flex items-start justify-start">
          <img
            src={doc1}
            alt="Medical professional"
            className="w-full max-w-full md:max-w-lg h-auto max-h-96 md:max-h-full object-contain"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-10 flex justify-center items-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Login to Your Account</h2>
          <p className="text-gray-600 mb-8">
            Access your dashboard and connect with your doctor
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex">
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
            {({ isSubmitting, values, errors, touched, handleChange, handleBlur }) => (
              <Form className="flex flex-col gap-6">
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
                    className="text-teal-600 text-sm cursor-pointer hover:text-teal-800"
                  >
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="mx-4 text-sm text-gray-500">or sign in with</span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                {/* Google Sign-In Button */}
                <GoogleAuthButton />

                <p className="text-center mt-4 text-gray-600">
                  Don't have an account?{' '}
                  <span 
                    className="text-teal-500 cursor-pointer hover:text-teal-600"
                    onClick={navigateToSignUp}
                  >
                    Create Account
                  </span>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}