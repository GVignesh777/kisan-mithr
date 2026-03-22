import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!token) {
    // Redirect unauthenticated users to admin login page
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Render children if passed (e.g. <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>)
  // Otherwise render Outlet for pure route-guard usage
  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;
