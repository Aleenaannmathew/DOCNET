import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorPage from '../pages/DoctorPages/DoctorDashboard';
import DoctorForm from '../pages/DoctorPages/DoctorForm';
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
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Slots from '../pages/DoctorPages/Slots';
import PatientAppointments from '../pages/DoctorPages/PatientAppointments';
import AppointmentDetails from '../pages/DoctorPages/AppointmentDetails';
import Wallet from '../pages/DoctorPages/Wallet';

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
      <Route path="reset-password" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <DoctorReset />
        </PublicRoute>
      } />
      <Route path="verify-otp" element={
        <PublicRoute redirectPath="/doctor/doctor-landing">
          <VerifyOtp />
        </PublicRoute>
      } />

      {/* Pending Approval Route */}
      <Route path="pending-approval" element={
        <ProtectedRoute allowedRoles={['doctor']} checkApproval={false}>
          <PendingApproval />
        </ProtectedRoute>
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
        <Route path="appointment-details" element={<AppointmentDetails/>}/>
        <Route path="doctor-wallet" element={<Wallet/>}/>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="doctor-login" replace />} />
    </Routes>
  );
}

export default DoctorRoutes;