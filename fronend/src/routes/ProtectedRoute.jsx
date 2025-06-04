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

  if (allowedRoles.length === 0) {
    if (isAuthenticated && user) {
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

    return children ? children : <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
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

  if (checkApproval && user?.role === 'doctor' && !user?.doctor_profile?.is_approved && !location.pathname.includes('/pending-approval')) {
    return <Navigate to="/doctor/pending-approval" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;