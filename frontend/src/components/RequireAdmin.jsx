import { Navigate, Outlet } from 'react-router-dom';

const RequireAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user && user.token && user.user.role === 'admin' 
    ? <Outlet /> 
    : <Navigate to="/login" />;
};

export default RequireAdmin;
