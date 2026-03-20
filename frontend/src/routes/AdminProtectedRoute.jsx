import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!token) {
    // Redirect unauthenticated users to admin login page
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
