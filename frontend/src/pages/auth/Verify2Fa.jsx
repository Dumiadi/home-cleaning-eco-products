import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Verify2FA() {
  const [email] = useState(localStorage.getItem('pendingEmail') || '');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    const res = await fetch('http://localhost:5000/api/users/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.removeItem('pendingEmail');
      toast.success('✅ Autentificat cu succes');
      navigate('/account');
    } else {
      toast.error(data.message || 'Cod invalid');
    }
  };

  return (
    <div className="container py-5">
      <h3>Verificare 2FA</h3>
      <p>Am trimis un cod pe emailul <strong>{email}</strong>.</p>
      <input
        type="text"
        placeholder="Cod de verificare"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="form-control mb-3"
      />
      <button className="btn btn-primary" onClick={handleVerify}>Verifică</button>
    </div>
  );
}

export default Verify2FA;
