import React, { useState } from 'react';
import { Lock, Mail, Phone, User, Heart, Shield, Users, Calendar } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userAxios } from '../../axios/UserAxios'
import { useNavigate } from 'react-router-dom'
import DocnetLoading from '../Constants/Loading'

// Validation schema using Yup 
const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits only')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the Terms of Use and Privacy Policy')
});

// Initial form values
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
  const navigate = useNavigate();

  const handleSubmit = async (values, { setFieldError, setSubmitting }) => {
    console.log("Form submission started with values:", values);
    setIsLoading(true);
    setServerError('');
    
    try {
      const data = new FormData();
      data.append('username', values.username);
      data.append('email', values.email);
      data.append('phone', values.phone);
      data.append('password', values.password);
      data.append('confirm_password', values.password2);
      data.append('role', 'patient');
      
      console.log("Sending registration request...");
      const response = await userAxios.post('/register/', data);
      console.log("Registration response:", response.data);
      
      if (response.data && response.data.user_id) {
        console.log("Navigating to OTP page with userId:", response.data.user_id);
        navigate('/verify-otp', {
          state: {
            userId: response.data.user_id,
            email: response.data.email,
          }
        });
      } else {
        console.error("Unexpected response format - no user id.", response.data);
        setServerError('Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        console.log("Server errors:", serverErrors);
        
        // Handle different error response formats
        if (typeof serverErrors === 'string') {
          setServerError(serverErrors);
        } else if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach(key => {
            const errorMessage = Array.isArray(serverErrors[key]) 
              ? serverErrors[key][0] 
              : serverErrors[key];
            
            const fieldMap = {
              confirm_password: 'password2'
            };
            
            const fieldName = fieldMap[key] || key;
            
            // Set field error if it's a form field, otherwise show as server error
            if (['username', 'email', 'phone', 'password', 'password2'].includes(fieldName)) {
              setFieldError(fieldName, errorMessage);
            } else {
              setServerError(errorMessage);
            }
          });
        }
      } else if (error.message) {
        setServerError(`Network error: ${error.message}`);
      } else {
        setServerError('Registration failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Enhanced custom input component for consistent styling
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

  // Loading component
  if (isLoading) {
    return <DocnetLoading/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Enhanced with professional styling */}
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
                Join a network of trusted<br />
                <span className="text-teal-200">medical professionals</span><br />
                and patients.
              </h2>
              <p className="text-teal-100 text-lg leading-relaxed">
                Your health journey starts here. Connect with certified healthcare professionals and take control of your wellbeing.
              </p>
            </div>
            
            {/* Patient-focused Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Secure & Private Health Records</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Connect with Certified Doctors</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-teal-200" size={20} />
                <span className="text-teal-100">Easy Appointment Booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Enhanced form styling */}
        <div className="w-full lg:w-3/5 p-6 md:p-12 flex justify-center items-center">
          <div className="w-full max-w-xl">
            {/* Mobile Header */}
            <div className="block lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Heart className="mr-3 text-teal-600" size={32} />
                <h1 className="font-bold text-3xl text-teal-600">DOCNET</h1>
              </div>
              <h2 className="font-semibold text-xl text-gray-800 mb-2">
                Join a network of trusted medical professionals and patients.
              </h2>
              <p className="text-gray-600">Your health journey starts here</p>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600 text-lg">
                Sign up to connect with certified healthcare professionals.
              </p>
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {serverError}
                </div>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="mr-2 text-teal-600" size={20} />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <Field
                        name="username"
                        component={FormInput}
                        placeholder="User Name"
                        icon={User}
                      />

                      <Field
                        name="email"
                        component={FormInput}
                        type="email"
                        placeholder="Email Address"
                        icon={Mail}
                      />

                      <Field
                        name="phone"
                        component={FormInput}
                        type="tel"
                        placeholder="Phone Number"
                        icon={Phone}
                      />
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Lock className="mr-2 text-teal-600" size={20} />
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      <Field
                        name="password"
                        component={FormInput}
                        type="password"
                        placeholder="Password"
                        icon={Lock}
                      />

                      <Field
                        name="password2"
                        component={FormInput}
                        type="password"
                        placeholder="Confirm Password"
                        icon={Lock}
                      />
                    </div>
                  </div>

                  {/* Agreement Section */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="flex items-start">
                      <Field
                        type="checkbox"
                        name="agreeToTerms"
                        id="agreeToTerms"
                        className="mr-3 mt-1 h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <div className="flex flex-col">
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                          I agree to the <span className="text-teal-600 font-medium hover:underline cursor-pointer">Terms of Use</span> and <span className="text-teal-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>
                        </label>
                        <ErrorMessage 
                          name="agreeToTerms" 
                          component="p" 
                          className="text-red-500 text-sm mt-1" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-teal-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Patient Account'
                    )}
                  </button>

                  {/* Debug info (remove in production) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                      <details>
                        <summary>Debug Info (Development Only)</summary>
                        <pre>Errors: {JSON.stringify(errors, null, 2)}</pre>
                        <pre>Touched: {JSON.stringify(touched, null, 2)}</pre>
                        <pre>Is Submitting: {isSubmitting}</pre>
                      </details>
                    </div>
                  )}

                  {/* Sign in link */}
                  <div className="text-center text-gray-600 pt-4">
                    Already have an account?{' '}
                    <span 
                      className="text-teal-600 font-medium cursor-pointer hover:underline transition-colors duration-200"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </span>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}