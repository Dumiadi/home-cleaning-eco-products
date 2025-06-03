import React from 'react';
import { Navigate } from 'react-router-dom';
import Forbidden from '../pages/Forbidden';

const AdminProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.user?.role === 'admin';

  if (!user || !user.token) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Forbidden />;
  }

  return children;
};

export default AdminProtectedRoute;
