// frontend/src/pages/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, formData.newPassword, formData.confirmPassword);
      alert('Parola a fost resetată cu succes!');
      navigate('/login');
    } catch (error) {
      alert('Eroare la resetarea parolei.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Parolă nouă"
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
      />
      <input
        type="password"
        placeholder="Confirmă parola"
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      />
      <button type="submit">Resetează Parola</button>
    </form>
  );
};

export default ResetPassword;
