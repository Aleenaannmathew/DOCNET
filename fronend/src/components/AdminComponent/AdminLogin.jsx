import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../store/authSlice';
import { adminAxios } from '../../axios/AdminAxios';

const AdminSignIn = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make API call to Django backend using your custom axios instance
      // Fix: Use the correct API endpoint based on your Django URL configuration
      const response = await adminAxios.post('admin-login/', formData);
      
      // Dispatch login action with token and user data
      dispatch(login({
        token: response.data.token,
        user: response.data.user
      }));
      
      // Store token in localStorage for later use
      localStorage.setItem('token', response.data.token);
      
      // Navigate to admin dashboard
      navigate('/admin/admin-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error cases
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 403) {
          setError('You must be an admin to access this portal');
        } else if (err.response.status === 404) {
          setError('Login service not found. Please contact technical support.');
        } else {
          setError(err.response.data.error || 'An error occurred during login');
        }
      } else if (err.request) {
        // Request was made but no response
        setError('Server is not responding. Please try again later.');
      } else {
        // Something else happened
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-semibold text-blue-800 flex items-center justify-center gap-2">
            <span className="inline-block">👨‍⚕️</span> Admin Login
          </div>
          <div className="text-sm text-gray-600 mt-1">TeleHealth Management Portal</div>
          <div className="w-24 h-1 bg-blue-700 mx-auto mt-4"></div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end">
            <a 
              href="/admin/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-900'
            } text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Optional: Security notice */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          Secure login | Protected by TeleHealth security
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;