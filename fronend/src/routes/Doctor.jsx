import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorPage from '../pages/DoctorPages/DoctorDashboard';
import DoctorForm from '../pages/DoctorPages/DoctorForm';
import DoctorRegister from '../pages/DoctorPages/DoctorRegister';
import DoctorSignIn from '../pages/DoctorPages/DoctorSignIn';
import Landing from '../pages/DoctorPages/Landing';
import DoctorSettings from '../pages/DoctorPages/DoctorSettings';
import PasswordChange from '../pages/DoctorPages/PasswordChange';
import PassChange from '../pages/DoctorPages/PassChange';
import DoctorReset from '../pages/DoctorPages/DoctorReset';
import VerifyOtp from '../pages/PatientPages/VerifyOtp';
import OtpVerify from '../pages/DoctorPages/OtpVerify';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Slots from '../pages/DoctorPages/Slots';
import PatientAppointments from '../pages/DoctorPages/PatientAppointments';
import AppointmentDetails from '../pages/DoctorPages/AppointmentDetails';
import Wallet from '../pages/DoctorPages/Wallet';
import ListEmergencyPatients from '../pages/DoctorPages/ListEmergencyPatients';
import DoctorChat from '../pages/DoctorPages/DoctorChat';
import DoctorAnalyticsPage from '../pages/DoctorPages/DoctorAnalyticsPage';
import DocNotifications from '../pages/DoctorPages/DocNotifications';


function DoctorRoutes() {
  return (
    <Routes>
      {/* Public Doctor Routes */}
      <Route path="doctor-login" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <DoctorSignIn />
        </PublicRoute>
      } />
      <Route path="doctor-verify-otp" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <OtpVerify />
        </PublicRoute>
      } />
      <Route path="doctor-register" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <DoctorRegister />
        </PublicRoute>
      } />
      <Route path="password-request" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <PassChange />
        </PublicRoute>
      } />
      <Route path="doctor-reset-password" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <DoctorReset />
        </PublicRoute>
      } />
      <Route path="verify-otp" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <VerifyOtp />
        </PublicRoute>
      } />

     

      {/* Protected Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route index element={<DoctorPage />} />
        <Route path="dashboard" element={<DoctorPage />} />
        <Route path="doctor-landing" element={<Landing />} />
        <Route path="doctor-details" element={<DoctorForm />} />
        <Route path="settings" element={<DoctorSettings />} />
        <Route path="change-password" element={<PasswordChange />} />
        <Route path="slots" element={<Slots />} />
        <Route path="doctor-appointments" element={<PatientAppointments/>}/>
        <Route path="appointment-details/:appointmentId" element={<AppointmentDetails/>}/>
        <Route path="doctor-wallet" element={<Wallet/>}/>
        <Route path="emergency-list" element={<ListEmergencyPatients/>}/>
        <Route path="/chat-room/:id" element={<DoctorChat/>}/>
        <Route path="doctor-analytics" element={<DoctorAnalyticsPage/>}/>
        <Route path="doctor-notification" element={<DocNotifications/>}/>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="doctor-login" replace />} />
    </Routes>
  );
}

export default DoctorRoutes;