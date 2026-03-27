import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Simple ProtectedRoute component
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      navigate('/');
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  if (!isAuthenticated) return null;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <div>Access Denied</div>;
  }

  return children;
};
