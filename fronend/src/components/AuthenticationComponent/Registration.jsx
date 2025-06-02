import React, { useState } from 'react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import docImg from '../../assets/doctor1.png';
import { userAxios } from '../../axios/UserAxios';
import { useNavigate } from 'react-router-dom';
import DocnetLoading from '../Constants/Loading';

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
        setServerError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle API error responses
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        // Map server errors to form fields using Formik's setFieldError
        Object.keys(serverErrors).forEach(key => {
          const errorMessage = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
          
          // Map server field names to form field names if needed
          const fieldMap = {
            confirm_password: 'password2'
          };
          
          const fieldName = fieldMap[key] || key;
          setFieldError(fieldName, errorMessage);
        });
      } else {
        setServerError('Registration failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
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
          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
            hasError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-teal-500'
          } focus:ring-2 focus:border-transparent outline-none`}
        />
        <ErrorMessage 
          name={field.name} 
          component="p" 
          className="text-red-500 text-sm mt-1" 
        />
      </div>
    );
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

          {serverError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {serverError}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col space-y-6">
                {/* Username */}
                <Field
                  name="username"
                  component={FormInput}
                  placeholder="User Name"
                  icon={User}
                />

                {/* Email */}
                <Field
                  name="email"
                  component={FormInput}
                  type="email"
                  placeholder="Email Address"
                  icon={Mail}
                />

                {/* Phone */}
                <Field
                  name="phone"
                  component={FormInput}
                  type="tel"
                  placeholder="Phone Number"
                  icon={Phone}
                />

                {/* Password */}
                <Field
                  name="password"
                  component={FormInput}
                  type="password"
                  placeholder="Password"
                  icon={Lock}
                />

                {/* Confirm Password */}
                <Field
                  name="password2"
                  component={FormInput}
                  type="password"
                  placeholder="Confirm Password"
                  icon={Lock}
                />

                {/* Terms checkbox */}
                <div className="flex items-start">
                  <Field
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    className="mr-2 mt-1"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                      I agree to the <span className="text-teal-500">Terms of Use</span> and <span className="text-teal-500">Privacy Policy</span>
                    </label>
                    <ErrorMessage 
                      name="agreeToTerms" 
                      component="p" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Patient Account'}
                </button>

                {/* Sign in link */}
                <div className="text-center text-gray-600">
                  Already have an account?{' '}
                  <span 
                    className="text-teal-500 cursor-pointer hover:underline"
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
  );
}