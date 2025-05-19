import React, { useState } from 'react';
import { Lock, Mail, Phone, User, FileText, Building, Globe } from 'lucide-react';
import docImg from '../../assets/doctor1.png';
import { doctorAxios } from '../../axios/DoctorAxios';
import { useNavigate } from 'react-router-dom';
import DocnetLoading from '../Constants/Loading';

export default function DoctorRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    registration_id: '',
    hospital: '',
    specialization: '',
    languages: '',
    age: '',
    gender: '',
    experience: '',
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

    // Registration ID validation
    if (!formData.registration_id.trim()) {
      formErrors.registration_id = 'Registration ID is required';
      isValid = false;
    }

    // Languages validation
    if (!formData.languages.trim()) {
      formErrors.languages = 'Language is required';
      isValid = false;
    } else if (formData.languages.length < 3) {
      formErrors.languages = 'Languages must be at least 3 characters';
      isValid = false;
    }

     if (!formData.specialization.trim()) {
      formErrors.specialization = 'Specialization is required';
      isValid = false;
    } else if (formData.specialization.length < 3) {
      formErrors.specialization = 'Specialization must be at least 3 characters';
      isValid = false;
    }

    // Age validation
    if (!formData.age) {
      formErrors.age = 'Age is required';
      isValid = false;
    } else if (formData.age < 21 || formData.age > 80) {
      formErrors.age = 'Age must be between 21 and 80';
      isValid = false;
    }

    // Gender validation
    if (!formData.gender) {
      formErrors.gender = 'Gender is required';
      isValid = false;
    }

    // Experience validation
    if (!formData.experience) {
      formErrors.experience = 'Years of experience is required';
      isValid = false;
    } else if (formData.experience < 0) {
      formErrors.experience = 'Experience cannot be negative';
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
      data.append('role', 'doctor');
      data.append('registration_id', formData.registration_id);
      data.append('hospital', formData.hospital);
      data.append('specialization', formData.specialization);
      data.append('languages', formData.languages);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('experience', formData.experience);
      
      console.log("Sending doctor registration request...");
      const response = await doctorAxios.post('/doctor-register/', data);
      console.log("Registration response", response.data);

      if (response.data && response.data.user_id) {
        console.log("Navigating to OTP page...");
        navigate('/doctor/doctor-verify-otp', { 
          state: {
            userId: response.data.user_id, 
            email: response.data.email,
            userType: 'doctor' // Add user type to help the OTP page know context
          }
        });
      }else {
        console.error("Unexpected response format - no user_id:", response.data);
        setErrors({
          general: 'Registration successful but could not proceed to verification. Please try logging in.'
        });
      }
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
            Join our network of trusted<br />
            healthcare professionals.
          </h2>
          <p className="text-gray-600 mt-2">Your expertise, our platform</p>
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
              Join our network of trusted healthcare professionals.
            </h2>
            <p className="text-gray-600 mt-2">Your expertise, our platform</p>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Doctor Registration</h2>
          <p className="text-gray-600 mb-8">
            Sign up as a healthcare professional and connect with patients.
          </p>

          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              
              {/* Username */}
              <div className="relative mb-4">
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
              <div className="relative mb-4">
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
              <div className="relative mb-4">
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
              <div className="relative mb-4">
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
            </div>

            {/* Professional Information */}
            <div className="pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
              
              {/* Registration ID */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <FileText size={18} />
                </div>
                <input
                  type="text"
                  name="registration_id"
                  onChange={handleChange}
                  value={formData.registration_id}
                  placeholder="Registration ID"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                    errors.registration_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                  } focus:ring-2 focus:border-transparent outline-none`}
                />
                {errors.registration_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.registration_id}</p>
                )}
              </div>

              {/* Hospital */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Building size={18} />
                </div>
                <input
                  type="text"
                  name="hospital"
                  onChange={handleChange}
                  value={formData.hospital}
                  placeholder="Hospital Name (Optional)"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 focus:ring-2 focus:border-transparent outline-none"
                />
              </div>

              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="specialization"
                  onChange={handleChange}
                  value={formData.specialization}
                  placeholder="Specialization"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                    errors.specialization ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                  } focus:ring-2 focus:border-transparent outline-none`}
                />
                {errors.specialization && (
                  <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                )}
              </div>

              {/* Languages */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  name="languages"
                  onChange={handleChange}
                  value={formData.languages}
                  placeholder="Languages"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 focus:ring-2 focus:border-transparent outline-none bg-gray-50"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="number"
                    name="age"
                    onChange={handleChange}
                    value={formData.age}
                    placeholder="Age"
                    min="21"
                    max="80"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    } focus:ring-2 focus:border-transparent outline-none`}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>
                <div>
                  <select
                    name="gender"
                    onChange={handleChange}
                    value={formData.gender}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    } focus:ring-2 focus:border-transparent outline-none`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-4">
                <input
                  type="number"
                  name="experience"
                  onChange={handleChange}
                  value={formData.experience}
                  placeholder="Years of Experience"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.experience ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                  } focus:ring-2 focus:border-transparent outline-none`}
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                className="mr-2"
                required
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
              Create Doctor Account
            </button>

            {/* Sign in link */}
            <div className="text-center text-gray-600">
              Already have an account?{' '}
              <span 
                className="text-teal-500 cursor-pointer"
                onClick={() => navigate('/login')}
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