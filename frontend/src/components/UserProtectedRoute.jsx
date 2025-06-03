
import React from 'react';
import { Navigate } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const role = JSON.parse(localStorage.getItem('user'))?.user?.role;

  if (!token || role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserProtectedRoute;
