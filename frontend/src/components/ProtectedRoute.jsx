import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
