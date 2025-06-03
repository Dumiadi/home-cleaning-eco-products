import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user && user.token ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
