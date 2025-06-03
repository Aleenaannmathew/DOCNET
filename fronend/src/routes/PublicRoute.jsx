import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children, redirectPath }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    // If a specific redirect path is provided, use it
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    
    // Otherwise, redirect based on user role
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

  return children;
};

export default PublicRoute;