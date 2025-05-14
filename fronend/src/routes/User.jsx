import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RegisterForm from '../pages/PatientPages/Register';
import LoginForm from '../pages/PatientPages/Login';
import LandingPage from '../pages/PatientPages/LandingPage';
import VerifyOtp from '../pages/PatientPages/VerifyOtp';
import UserProfile from '../pages/PatientPages/ProfilePage';
import { useSelector } from 'react-redux';
import PasswordChange from '../pages/PatientPages/PasswordChange';
import PasswordReset from '../pages/PatientPages/PasswordReset';
import ChangePassword from '../pages/PatientPages/ChangePassword';

// Patient/User Route Guard - Only for authenticated patients
const PatientRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!token) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Redirect doctors to their dashboard
  if (user?.role === 'doctor') {
    return <Navigate to='/doctor/dashboard' replace />;
  }
  
  // Redirect admins to their dashboard
  if (user?.role === 'admin') {
    return <Navigate to='/admin/admin-dashboard' replace />;
  }

  return children;
};

// Public Route - For unauthenticated users only
const UserPublicRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  
  if (token) {
    // Redirect based on user role
    if (user?.role === 'doctor') {
      if (user?.doctor_profile?.is_approved) {
        return <Navigate to="/doctor/dashboard" replace />;
      } else {
        return <Navigate to="/doctor/pending-approval" replace />;
      }
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin/admin-dashboard" replace />;
    }
    // For patients or any default role
    return <Navigate to="/" replace />;
  }
  
  return children;
};



function UserRoutes() {
  return (
    <Routes>
      
      <Route path='/' element={
        <PatientRoute>
        <LandingPage/>
        </PatientRoute>
      }/>

      {/* Public routes - for unauthenticated users */}
      <Route path='/login' element={
        <UserPublicRoute>
          <LoginForm/>
        </UserPublicRoute>
      }/>

      <Route path="/register" element={
        <UserPublicRoute>
          <RegisterForm />
        </UserPublicRoute>
      } />

      <Route path="/forgot-password" element={
        <UserPublicRoute>
          <PasswordChange />
        </UserPublicRoute>
      } />

      <Route path="/reset-password" element={
        <UserPublicRoute>
          <PasswordReset />
        </UserPublicRoute>
      } />
      
      {/* OTP verification route */}
      <Route path='/verify-otp' element={
      <UserPublicRoute>
          <VerifyOtp/>
      </UserPublicRoute>
      }/>
      
      {/* Protected routes - only for authenticated patients */}
      <Route path="/user-profile" element={
        <PatientRoute>
          <UserProfile />
        </PatientRoute>
      } />

      <Route path="/change-password" element={
        <PatientRoute>
          <PasswordChange />
        </PatientRoute>
      } />

      <Route path="/reset-password" element={
        <PatientRoute>
          <PasswordReset />
        </PatientRoute>
      } />

      <Route path="/new-password" element={
        <PatientRoute>
          <ChangePassword/>
        </PatientRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default UserRoutes;