import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doctorAxios } from '../../axios/DoctorAxios';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const DoctorResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { email, otp } = location.state || {};
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await doctorAxios.post('/doctor-reset-password/', {
        email,
        otp,
        new_password: newPassword
      });

      if (response.data.success) {
        setMessage('Password reset successfully! You can now login with your new password.');
        dispatch(logout());
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/doctor/doctor-login'), 3000);
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Password reset failed');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password for {email}
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md group hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorResetPassword;