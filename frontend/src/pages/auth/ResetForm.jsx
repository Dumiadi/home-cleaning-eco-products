import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ResetForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Parolele nu coincid!');

    const res = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Parola resetată!');
      navigate('/login');
    } else {
      toast.error(data.message || 'Eroare!');
    }
  };

  return (
    <div className="container py-5">
      <h3 className="mb-3">Setează parolă nouă</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <input type="password" className="form-control mb-2" placeholder="Parolă nouă" onChange={e => setPassword(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Confirmă parola" onChange={e => setConfirm(e.target.value)} required />
        <button className="btn btn-success w-100">Resetează</button>
      </form>
    </div>
  );
}

export default ResetForm;
