import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DoctorPage from '../pages/DoctorPages/DoctorDashboard';
import DoctorForm from '../pages/DoctorPages/DoctorForm';
import DoctorConsultationForm from '../pages/DoctorPages/DoctorConsultationForm';
import DoctorRegister from '../pages/DoctorPages/DoctorRegister';
import PendingApproval from '../pages/DoctorPages/Approval';
import DoctorSignIn from '../pages/DoctorPages/DoctorSignIn';
import Landing from '../pages/DoctorPages/Landing';
import DoctorSettings from '../pages/DoctorPages/DoctorSettings';
import PasswordChange from '../pages/DoctorPages/PasswordChange';
import PassChange from '../pages/DoctorPages/PassChange';
import DoctorReset from '../pages/DoctorPages/DoctorReset';
import VerifyOtp from '../pages/PatientPages/VerifyOtp';
import OtpVerify from '../pages/DoctorPages/OtpVerify';


// Doctor Route Guard - Ensures only APPROVED doctors can access these routes
const ApprovedDoctorRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  const location = useLocation();
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to='/doctor-login' state={{ from: location }} replace />;
  }
  
  // Check if user has doctor role
  if (user?.role !== 'doctor') {
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to='/admin/admin-dashboard' replace />;
    }
    // Redirect patient/user to home page
    return <Navigate to='/' replace />;
  }
  
  // Check if doctor is approved
  if (!user?.doctor_profile?.is_approved) {
    return <Navigate to='/doctor/pending-approval' replace />;
  }
  
  return children;
};

// Route specifically for unapproved doctors
const PendingDoctorRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to='/doctor-login' replace />;
  }
  
  // Check if user has doctor role
  if (user?.role !== 'doctor') {
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to='/admin/admin-dashboard' replace />;
    }
    // Redirect patient/user to home page
    return <Navigate to='/' replace />;
  }
  
  // If doctor is already approved, redirect to dashboard
  if (user?.doctor_profile?.is_approved) {
    return <Navigate to='/doctor/doctor-landing' replace />;
  }
  
  return children;
};

// Route for users who should not be authenticated as doctors
const DoctorPublicRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);
  
  if (token && user?.role === 'doctor') {
    // If approved doctor, go to dashboard
    if (user?.doctor_profile?.is_approved) {
      return <Navigate to='/doctor/doctor-landing' replace />;
    } 
    // If unapproved doctor, go to pending approval
    else {
      return <Navigate to='/doctor/pending-approval' replace />;
    }
  } else if (token) {
    // If admin, redirect to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to='/admin/admin-dashboard' replace />;
    }
    // If regular user, redirect to home
    return <Navigate to='/' replace />;
  }
  
  return children;
};

// Route for doctor landing page - accessible to authenticated and approved doctors
const DoctorLandingRoute = ({ children }) => {
  const { token, user } = useSelector(state => state.auth);

  // Check if user is authenticated  
  if (!token) {
    return <Navigate to='/doctor-login' replace />;
  }
  
  // Check if user is a doctor
  if (user?.role !== 'doctor') {
    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to='/admin/admin-dashboard' replace />;
    }
    // Redirect patient/user to home page
    return <Navigate to='/' replace />;
  }
  
  // Check if doctor is approved
  if (!user?.doctor_profile?.is_approved) {
    return <Navigate to='/doctor/pending-approval' replace />;
  }
  
  // Allow approved doctors to access the landing page
  return children;
};

function DoctorRoutes() {
  return (
    <Routes>
      {/* Doctor dashboard - for approved doctors */}
      <Route path="dashboard" element={
        <ApprovedDoctorRoute>
          <DoctorPage />
        </ApprovedDoctorRoute>
      } />
      
      {/* Doctor landing page - for approved doctors */}
      <Route path="doctor-landing" element={
        <ApprovedDoctorRoute>
          <Landing />
        </ApprovedDoctorRoute>
      } />
      
      {/* Public routes - accessible without doctor authentication */}
      <Route path="doctor-login" element={
        <DoctorPublicRoute>
          <DoctorSignIn />
        </DoctorPublicRoute>
      } />

      <Route path="doctor-verify-otp" element={
        <DoctorPublicRoute>
          <OtpVerify />
        </DoctorPublicRoute>
      } />
      
      <Route path="doctor-register" element={
        <DoctorPublicRoute>
          <DoctorRegister />
        </DoctorPublicRoute>
      } />

      <Route path="password-request" element={
        <DoctorPublicRoute>
          <PassChange />
        </DoctorPublicRoute>
      } />

      <Route path="reset-password" element={
        <DoctorPublicRoute>
          <DoctorReset />
        </DoctorPublicRoute>
      } />

      <Route path='/verify-otp' element={
      <DoctorPublicRoute>
          <VerifyOtp/>
      </DoctorPublicRoute>
      }/>
      
      {/* Pending approval route - only for unapproved doctors */}
      <Route path="pending-approval" element={
        <PendingDoctorRoute>
          <PendingApproval />
        </PendingDoctorRoute>
      } />
      
      {/* Protected routes - only for approved doctors */}
      <Route index element={
        <ApprovedDoctorRoute>
          <DoctorPage />
        </ApprovedDoctorRoute>
      } />
      
      <Route path='doctor-details' element={
        <ApprovedDoctorRoute>
          <DoctorForm />
        </ApprovedDoctorRoute>
      } />

      <Route path="settings" element={
        <ApprovedDoctorRoute>
          <DoctorSettings/>
        </ApprovedDoctorRoute>
      } />

      <Route path="change-password" element={
        <ApprovedDoctorRoute>
          <PasswordChange/>
        </ApprovedDoctorRoute>
      } />
      
      <Route path='consultation-form' element={
        <ApprovedDoctorRoute>
          <DoctorConsultationForm />
        </ApprovedDoctorRoute>
      } />
      
      {/* Catch-all route for any undefined doctor routes */}
      <Route path='*' element={
        <Navigate to='doctor-login' replace />
      } />
    </Routes>
  );
}

export default DoctorRoutes;

