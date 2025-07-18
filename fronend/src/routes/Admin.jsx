import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/AdminPages/AdminLogin';
import AdminDashboard from '../pages/AdminPages/AdminDashboard';
import DoctorList from '../pages/AdminPages/DoctorList';
import PatientList from '../pages/AdminPages/PatientList';
import DoctorDetails from '../pages/AdminPages/DoctorDetails';
import ProtectedRoute from './ProtectedRoute';
import AppointmentList from '../pages/AdminPages/AppointmentList';
import Payment from '../pages/AdminPages/Payment';
import DoctorReport from '../pages/AdminPages/DoctorReport';



function AdminRoutes() {
  return (
    <Routes>
     {/* Public Admin Routes */}
      <Route index element={<AdminLogin />} />
      <Route path="admin-login" element={<AdminLogin />} />
      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="admin-dashboard" replace />} />
        <Route path="doctor-list" element={<DoctorList />} />
        <Route path="doctor/:doctorId" element={<DoctorDetails />} />
        <Route path="patient-list" element={<PatientList />} />
        <Route path="appointment-list" element={<AppointmentList/>}/>
        <Route path="payments" element={<Payment/>}/>
        <Route path="doctor-report" element={<DoctorReport/>}/>
      </Route>
     
      {/* Catch-all route */}
      <Route path="*" element={<AdminLogin />} />
    </Routes>
  );
}

export default AdminRoutes;