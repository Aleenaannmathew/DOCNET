import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adminAxios } from '../axios/AdminAxios';

const ProtectedAdminRoute = () => {
  const { token, user, isAuthenticated } = useSelector(state => state.auth);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // If not authenticated at all, don't even try
      if (!isAuthenticated || !token) {
        setIsVerifying(false);
        return;
      }

      // Quick check for admin/superuser from redux store
      if (user && (user.is_superuser || user.role === 'admin')) {
        try {
          // Set auth header for this request
          const authHeader = { Authorization: `Bearer ${token}` };
          
          // Verify token is still valid with backend
          await adminAxios.get('admin-verify-token/', {
            headers: authHeader
          });
          
          setIsAllowed(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          setIsAllowed(false);
        }
      } else {
        setIsAllowed(false);
      }
      
      setIsVerifying(false);
    };

    verifyAdminAccess();
  }, [token, user, isAuthenticated]);

  if (isVerifying) {
    // Show loading indicator while verifying
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not allowed, redirect to admin login
  if (!isAllowed) {
    return <Navigate to="/admin/admin-login" replace />;
  }

  // If verification passed, render the child routes
  return <Outlet />;
};

export default ProtectedAdminRoute;