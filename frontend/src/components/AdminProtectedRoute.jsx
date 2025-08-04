// frontend/src/routes/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import Forbidden from '../pages/Forbidden';

const AdminProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userData || !token) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Forbidden />;
  }

  return children;
};

export default AdminProtectedRoute;
