import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from '../pages/PatientPages/Register';
import LoginForm from '../pages/PatientPages/Login';
import LandingPage from '../pages/PatientPages/LandingPage';
import VerifyOtp from '../pages/PatientPages/VerifyOtp';
import UserProfile from '../pages/PatientPages/ProfilePage';
import PasswordChange from '../pages/PatientPages/PasswordChange';
import PasswordReset from '../pages/PatientPages/PasswordReset';
import ChangePassword from '../pages/PatientPages/ChangePassword';
import DoctorListingPage from '../pages/PatientPages/DoctorList';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import DocDetail from '../pages/PatientPages/DocDetail';
import BookingList from '../pages/PatientPages/BookingList';
import BookingDetails from '../pages/PatientPages/BookingDetails';
import Confirmation from '../pages/PatientPages/Confirmation';
import AboutPage from '../pages/PatientPages/AboutPage';
import UserContact from '../pages/PatientPages/UserContact';
import BlogPage from '../pages/PatientPages/BlogPage';
import Emergency from '../pages/PatientPages/Emergency';



function UserRoutes() {
  return (
    <Routes>
      {/* Public User Routes */}
      <Route path="/login" element={
        <PublicRoute redirectPath="/">
          <LoginForm />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute redirectPath="/">
          <RegisterForm />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute redirectPath="/">
          <PasswordChange />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute redirectPath="/">
          <PasswordReset />
        </PublicRoute>
      } />
      <Route path="/verify-otp" element={
        <PublicRoute redirectPath="/">
          <VerifyOtp />
        </PublicRoute>
      } />

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['patient', 'user']} />}>
        <Route index element={<LandingPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/new-password" element={<ChangePassword />} />
        <Route path="/doctor-list" element={<DoctorListingPage />} />
        <Route path="/doctor-details/:slug" element={<DocDetail/>}/>
        <Route path='/booking-history' element={<BookingList/>}/>
        <Route path='/booking-details/:id' element={<BookingDetails />} />
        <Route path='/booking-confirmation/payment/:payment_id' element={<Confirmation />} />
        <Route path='/about' element={<AboutPage/>}/>
        <Route path='/contact' element={<UserContact/>}/>
        <Route path='/blog' element={<BlogPage/>}/>
        <Route path='/emergency-consultation' element={<Emergency/>}/>
        
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default UserRoutes;