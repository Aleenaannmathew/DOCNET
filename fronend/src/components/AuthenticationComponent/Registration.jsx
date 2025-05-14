import React, { useState } from 'react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import docImg from '../../assets/doctor1.png'
import { userAxios } from '../../axios/UserAxios';
import { useNavigate } from 'react-router-dom';
import DocnetLoading from '../Constants/Loading';


export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  });

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Username validation
    if (!formData.username.trim()) {
      formErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      formErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      formErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phone.trim()) {
      formErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      formErrors.phone = 'Phone number must be 10-15 digits only';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      formErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      formErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.password2) {
      formErrors.password2 = 'Passwords do not match';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      data.append('confirm_password', formData.password2);
      data.append('role', 'patient');
      
      console.log("Sending registration request...")
      const response = await userAxios.post('/register/', data);
      console.log("Registration response", response.data)

      if (response.data && response.data.user_id) {
        console.log("Navigating to OTP page...");
        navigate('/verify-otp', { 
          state: {
            userId: response.data.user_id, 
            email: response.data.email,
          }
        });
      } else {
        console.error("Unexpected response format - no user_id:", response.data);
      }
       // storing token & username in Redux
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle API error responses
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        // Map server errors to form fields
        const newErrors = {};
        Object.keys(serverErrors).forEach(key => {
          newErrors[key] = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
        });
        
        setErrors(newErrors);
      } else {
        setErrors({
          general: 'Registration failed. Please try again later.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DocnetLoading />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Section - Only visible on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-8 flex-col">
        <div className="mb-8">
          <h1 className="text-teal-700 font-bold text-3xl">DOCNET</h1>
          <h2 className="text-gray-800 font-medium text-2xl mt-4">
            Join a network of trusted<br />
            medical professionals and<br />
            patients.
          </h2>
          <p className="text-gray-600 mt-2">Your health journey starts here</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {/* Replace with your actual image */}
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
              Join a network of trusted medical professionals and patients.
            </h2>
            <p className="text-gray-600 mt-2">Your health journey starts here</p>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Create Your Account</h2>
          <p className="text-gray-600 mb-8">
            Sign up to connect with certified healthcare professionals.
          </p>

          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {/* Username */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                value={formData.username}
                placeholder="User Name"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } focus:ring-2 focus:border-transparent outline-none`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                placeholder="Email Address"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } focus:ring-2 focus:border-transparent outline-none`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                placeholder="Phone Number"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } focus:ring-2 focus:border-transparent outline-none`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={formData.password}
                placeholder="Password"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } focus:ring-2 focus:border-transparent outline-none`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password2"
                onChange={handleChange}
                value={formData.password2}
                placeholder="Confirm Password"
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  errors.password2 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                } focus:ring-2 focus:border-transparent outline-none`}
              />
              {errors.password2 && (
                <p className="text-red-500 text-sm mt-1">{errors.password2}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                className="mr-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                I agree to the <span className="text-teal-500">Terms of Use</span> and <span className="text-teal-500">Privacy Policy</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-teal-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Create Patient Account
            </button>

            {/* Sign in link */}
            <div className="text-center text-gray-600">
              Already have an account?{' '}
              <span className="text-teal-500 cursor-pointer"
              onClick={()=> navigate('/login')}
              >
                Sign In
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}