import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userAxios } from '../../axios/UserAxios';
import Navbar from './Navbar';
import Footer from './Footer';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required')
    .trim()
});

const ChangePasswordRequest = ({ isDoctor = false }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setLoading(true);
    setError('');

    try {
      const response = await userAxios.post(`/check-email/`, {
        email: values.email,
        role: isDoctor ? 'doctor' : 'patient' 
      });
      
      if (response.data.exists) {
        const otpResponse = await userAxios.post(`/send-password-reset-otp/`, {
          email: values.email,
          role: isDoctor ? 'doctor' : 'patient'
        });
        if (otpResponse.data.success) {
          navigate('/verify-otp', { 
            state: { 
              email: values.email,
              isPasswordReset: true,
              isDoctor
            } 
          });
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      } else {
        // Set field-specific error for better UX
        setFieldError('email', 'No account found with this email address');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      
      // Check if it's an email-specific error
      if (err.response?.data?.field === 'email' || errorMessage.toLowerCase().includes('email')) {
        setFieldError('email', errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Custom Email Field Component
  const EmailField = ({ name, label, placeholder, ...props }) => (
    <Field name={name}>
      {({ field, meta }) => (
        <div>
          <label 
            htmlFor={name} 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
          <input 
            {...field}
            {...props}
            type="email" 
            id={name}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border ${
              meta.touched && meta.error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
            } rounded-md shadow-sm focus:outline-none focus:ring-2 transition duration-200 ease-in-out`}
          />
          <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-2" />
        </div>
      )}
    </Field>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
            Forgot Password
          </h2>
          
          {/* General Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Formik
            initialValues={{
              email: ''
            }}
            validationSchema={emailValidationSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ isSubmitting, isValid, dirty, resetForm }) => (
              <Form className="space-y-6">
                <EmailField
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                
                <div className="flex space-x-3">
                  <button 
                    type="submit"
                    disabled={loading || isSubmitting || !isValid || !dirty}
                    className={`flex-1 bg-teal-700 text-white py-2 rounded-md hover:bg-teal-800 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 ${
                      (loading || isSubmitting || !isValid || !dirty) 
                        ? 'opacity-70 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {loading || isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      resetForm();
                      setError('');
                    }}
                    disabled={loading || isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button 
                onClick={() => navigate(isDoctor ? '/doctor-login' : '/login')}
                className="text-teal-600 hover:text-teal-700 font-medium focus:outline-none focus:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </main>
      
      <Footer/>
    </div>
  );
};

export default ChangePasswordRequest;