import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userAxios } from '../../axios/UserAxios';
import Navbar from './Navbar';
import Footer from './Footer';

const ChangePasswordRequest = ({ isDoctor = false }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if email exists in the database
      const response = await userAxios.post(`/check-email/`, {
         email,
        role: isDoctor ? 'doctor' : 'patient' 
      });
      
      if (response.data.exists) {
        // If email exists, send OTP and navigate to verification page
        const otpResponse = await userAxios.post(`/send-password-reset-otp/`, {
           email,
          role: isDoctor ? 'doctor' : 'patient'
         });
        
        if (otpResponse.data.success) {
          navigate('/verify-otp', { 
            state: { 
              email,
              isPasswordReset: true ,
              isDoctor
            } 
          });
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      } else {
        setError('No account found with this email address');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
            Change Password
          </h2>
          
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
              {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
              )}
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-teal-700 text-white py-2 rounded-md hover:bg-teal-800 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        </div>
      </main>
      
      <Footer/>
    </div>
  );
};

export default ChangePasswordRequest;