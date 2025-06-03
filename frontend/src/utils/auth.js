// utils/auth.js
export const isAuthenticated = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token;
  };
  