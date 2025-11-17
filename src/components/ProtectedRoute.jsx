import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading session...</div>; // Or a spinner
  }

  if (!user) {
    // Not logged in? Redirect to /signin
    return <Navigate to="/signin" replace />;
  }

  // Logged in? Show the child route (e.g., Dashboard)
  return <Outlet />;
}

export default ProtectedRoute;