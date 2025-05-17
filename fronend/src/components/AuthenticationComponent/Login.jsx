import React from 'react';
import { useState, useEffect } from 'react';
import { User, Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';
import doc1 from '../../assets/doctor1.png';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
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
}, []);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  
    if (error) {
      setError(null);
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // API call to backend using the userAxios instance
      const response = await userAxios.post('/login/', {
        username: formData.username,
        password: formData.password
      });
      
      const data = response.data;
      
      dispatch(login({
        token: data.access,
        refreshToken: data.refresh,
        user: {
          username: data.username,
          email:data.email,
          role: 'patient',
          is_profile_complete: data.is_profile_complete || false,
          // Add any other user data you get from the response
        }
      }));

      navigate('/', {replace: true});
      
    } catch (error) {
      // Handle axios error responses
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        const errorMessage = error.response.data.detail || 
                            error.response.data.non_field_errors?.[0] || 
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
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const response = await userAxios.post('/dj-rest-auth/google/',)
    console.log('Google Sign-In clicked');
    // Usually would redirect to Google OAuth endpoint
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
            onClick={() => {closeNotification}}
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

<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Username field */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className={`w-full py-3 px-4 pl-10 rounded-lg border ${
                    formErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'
                  } focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-sm`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
                  <User size={17} />
                </div>
              </div>
              {formErrors.username && (
                <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full py-3 px-4 pl-10 rounded-lg border ${
                    formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'
                  } focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-sm`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
                  <Lock size={17} />
                </div>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

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
              disabled={loading}
              className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-1 border-gray-200" />
              <span className="mx-4 text-sm text-gray-500">or sign in with</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 border border-gray-200 rounded-md transition-colors duration-300"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5 mr-3"
              />
              Sign in with Google
            </button>

            <p className="text-center mt-4 text-gray-600">
              Don't have an account?{' '}
              <span 
                className="text-teal-500 cursor-pointer hover:text-teal-600"
                onClick={navigateToSignUp}
              >
                Create Account
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}