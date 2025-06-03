import React, { useState } from 'react';
import { toast } from 'react-toastify';

function UserSupport() {
  const [form, setForm] = useState({
    subject: '',
    message: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const email = user?.user?.email;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.message) {
      toast.warning('Completează toate câmpurile!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, email })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Mesaj trimis! Vei primi un răspuns pe email.');
        setForm({ subject: '', message: '' });
      } else {
        toast.error(data.message || 'Eroare la trimitere');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  return (
    <div className="container py-5">
      <h3 className="mb-4">🛠️ Suport & Contact</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }} className="mx-auto">
        <div className="mb-3">
          <label className="form-label">Subiect</label>
          <input
            type="text"
            name="subject"
            className="form-control"
            value={form.subject}
            onChange={handleChange}
            placeholder="Ex: Întrebare despre o comandă"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mesaj</label>
          <textarea
            name="message"
            className="form-control"
            rows="5"
            value={form.message}
            onChange={handleChange}
            placeholder="Scrie detalii despre problema ta..."
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">Trimite Mesaj</button>
      </form>
    </div>
  );
}

export default UserSupport;
