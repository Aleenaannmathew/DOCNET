import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login', 
  checkApproval = true,
  children 
}) => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // If allowedRoles is empty, this is a public route
  // Only redirect authenticated users away from public routes
  if (allowedRoles.length === 0) {
    if (isAuthenticated && user) {
      // Redirect authenticated users based on their role
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.role === 'doctor') {
        return user?.doctor_profile?.is_approved 
          ? <Navigate to="/doctor/dashboard" replace />
          : <Navigate to="/doctor/pending-approval" replace />;
      }
      if (user.role === 'patient' || user.role === 'user') {
        return <Navigate to="/" replace />;
      }
    }
    // For unauthenticated users on public routes, render the component
    return children ? children : <Outlet />;
  }

  // For protected routes, check authentication first
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user?.role)) {
    // Redirect based on user role if they don't have access
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'doctor') {
      return user?.doctor_profile?.is_approved 
        ? <Navigate to="/doctor/dashboard" replace />
        : <Navigate to="/doctor/pending-approval" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Special case for doctor approval check
  if (checkApproval && user?.role === 'doctor' && !user?.doctor_profile?.is_approved && !location.pathname.includes('/pending-approval')) {
    return <Navigate to="/doctor/pending-approval" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;