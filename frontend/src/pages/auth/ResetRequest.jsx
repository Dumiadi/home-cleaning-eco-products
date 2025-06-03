import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ResetForm.css';

function ResetRequest() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/users/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('✅ Verifică emailul pentru linkul de resetare.');
    } else {
      toast.error(data.message || 'Eroare la trimiterea emailului.');
    }
  };

  return (
    <div className="reset-request-container">
      <h2 className="text-center mb-4">Resetare Parolă</h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" required className="form-control" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-100">Trimite Link</button>
      </form>
    </div>
  );
}

export default ResetRequest;
