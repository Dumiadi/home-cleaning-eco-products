// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import './Login.css'; // Folosim același CSS ca la login


// function Register() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (form.password !== form.confirm) {
//       toast.warn('⚠️ Parolele nu coincid!');
//       return;
//     }

//     try {
//       const res = await fetch('http://localhost:5000/api/users/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         toast.error(data.message || 'Eroare la înregistrare.');
//         return;
//       }

//       toast.success('✅ Înregistrare reușită! Autentificare...');
//       navigate('/login');
//     } catch (err) {
//       toast.error('❌ Eroare server.');
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Înregistrare</h2>
//       <form onSubmit={handleRegister}>
//         <input
//           type="text"
//           name="name"
//           className="form-control"
//           placeholder="Nume complet"
//           value={form.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           className="form-control"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           className="form-control"
//           placeholder="Parolă"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="confirm"
//           className="form-control"
//           placeholder="Confirmă Parola"
//           value={form.confirm}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Creează cont</button>
//       </form>
//       <p>Ai deja cont? <Link to="/login">Autentifică-te</Link></p>
//     </div>
//   );
// }

// export default Register;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';
import { useEffect } from 'react';
import { isAuthenticated } from '../../utils/auth';


function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  useEffect(() => {
    if (isAuthenticated()) {
      const role = JSON.parse(localStorage.getItem('user')).user.role;
      navigate(role === 'admin' ? '/admin/dashboard' : '/account');
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.warn('⚠️ Parolele nu coincid!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Eroare la înregistrare');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));
      toast.success('✅ Cont creat cu succes!');
      setTimeout(() => navigate('/account'), 800);
    } catch (err) {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex align-items-center justify-content-center vh-100">
      <div className="register-form bg-white shadow rounded p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <h3 className="text-center mb-4">Înregistrare</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nume complet</label>
            <input
              type="text"
              name="name"
              className="form-control"
              required
              onChange={handleChange}
              value={formData.name}
            />
          </div>

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

          <div className="mb-3">
            <label>Confirmă Parola</label>
            <input
              type="password"
              name="confirm"
              className="form-control"
              required
              onChange={handleChange}
              value={formData.confirm}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Se înregistrează...' : 'Creează cont'}
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
          Înregistrare cu Google
        </a>

        <p className="text-center mt-3">
          Ai deja cont?{' '}
          <Link to="/login" className="fw-bold text-decoration-none">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
