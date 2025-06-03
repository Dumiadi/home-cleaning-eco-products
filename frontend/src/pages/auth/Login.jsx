import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { isAuthenticated } from '../../utils/auth';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = JSON.parse(localStorage.getItem('user')).user.role;
      navigate(role === 'admin' ? '/admin/dashboard' : '/user');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Eroare la autentificare');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));
      toast.success('✅ Autentificat cu succes!');

      const role = data.user.role;
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/dashboard' : '/user');
      }, 800);
    } catch (err) {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center vh-100">
      <div className="login-form bg-white shadow rounded p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Autentificare</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              required
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div className="mb-3">
            <label>Parolă</label>
            <input
              type="password"
              name="password"
              className="form-control"
              required
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Se autentifică...' : 'Login'}
          </button>
        </form>

        <a
          href="http://localhost:5000/api/auth/google"
          className="btn btn-outline-dark w-100 mt-3 d-flex align-items-center justify-content-center"
        >
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="google"
            className="me-2"
          />
          Autentificare cu Google
        </a>

        <p className="text-center mt-3">
          Nu ai cont?{' '}
          <Link to="/register" className="fw-bold text-decoration-none">
            Creează unul
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
