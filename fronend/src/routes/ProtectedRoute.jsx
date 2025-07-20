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

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 2. If no specific roles are required (open route after login)
  if (allowedRoles.length === 0) {
    if (user) {
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.role === 'doctor') {
        const isApproved = user?.doctor_profile?.is_approved;
        return isApproved 
          ? <Navigate to="/doctor/dashboard" replace />
          : <Navigate to="/doctor-login" replace />;
      }
      if (user.role === 'patient' || user.role === 'user') {
        return <Navigate to="/" replace />;
      }
    }
    return children || <Outlet />;
  }

  // 3. Check if user's role is allowed
  const isRoleAllowed = allowedRoles.includes(user?.role);
  if (!isRoleAllowed) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'doctor') {
      const isApproved = user?.doctor_profile?.is_approved;
      return isApproved 
        ? <Navigate to="/doctor/dashboard" replace />
        : <Navigate to="/doctor-login" replace />;
    }
    if (user?.role === 'patient' || user?.role === 'user') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Doctor approval check — avoid infinite redirect loop
  if (
    checkApproval &&
    user?.role === 'doctor' &&
    !user?.doctor_profile?.is_approved &&
    location.pathname !== '/doctor-login'
  ) {
    return <Navigate to="/doctor-login" replace />;
  }

  // 5. User is authenticated, authorized, and approved (if needed)
  return children || <Outlet />;
};

export default ProtectedRoute;
