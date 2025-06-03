import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ProofUpload from './ProofUpload'; // componentă separată
import './UserBookings.css';

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ time: '', address: '' });
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    fetch('http://localhost:5000/api/users/service-orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => toast.error('Eroare la încărcare rezervări'));
  }, [token]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setForm({ time: booking.time, address: booking.address });
  };

  const handleCancel = async (id) => {
    const confirm = window.confirm('Ești sigur că vrei să anulezi această programare?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Programare anulată');
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'anulat' } : b));
      } else {
        toast.error('Eroare la anulare');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success('Programare actualizată');
        setBookings(prev =>
          prev.map(b => (b.id === id ? { ...b, ...form } : b))
        );
        setEditingId(null);
      } else {
        toast.error('Eroare la actualizare');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  const handleProofUploaded = (bookingId, imagePath) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, proof_image: imagePath } : b))
    );
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">🧼 Programările Mele</h3>
      {bookings.length === 0 ? (
        <p>Nu ai nicio programare.</p>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="card mb-4 shadow-sm">
            <div className="card-body">
              <p><strong>Serviciu:</strong> {b.service_name}</p>
              <p><strong>Data:</strong> {b.date}</p>
              {editingId === b.id ? (
                <>
                  <div className="mb-2">
                    <label>Ora:</label>
                    <input type="time" name="time" value={form.time} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="mb-2">
                    <label>Adresă:</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} className="form-control" />
                  </div>
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(b.id)}>💾 Salvează</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Anulează</button>
                </>
              ) : (
                <>
                  <p><strong>Ora:</strong> {b.time}</p>
                  <p><strong>Adresă:</strong> {b.address}</p>
                  <p><strong>Status:</strong> {b.status}</p>

                  {b.status !== 'anulat' && (
                    <>
                      <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(b)}>✏️ Editează</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(b.id)}>🗑️ Anulează</button>
                    </>
                  )}
                </>
              )}

              {/* 🖼️ Dovadă upload / preview */}
              <div className="mt-3">
                {b.proof_image ? (
                  <>
                    <p><strong>Dovadă încărcată:</strong></p>
                    <img
                      src={`http://localhost:5000${b.proof_image}`}
                      alt="Dovadă serviciu"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '250px' }}
                    />
                  </>
                ) : (
                  b.status !== 'anulat' && (
                    <ProofUpload bookingId={b.id} onUploaded={(img) => handleProofUploaded(b.id, img)} />
                  )
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserBookings;
