import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // ✅ IMPORT AUTHCONTEXT
import ProofUpload from './ProofUpload';
import './UserBookings.css';

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ time: '', address: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ FOLOSEȘTE AUTHCONTEXT ÎN LOC DE localStorage
  const { token, user, isAuthenticated } = useAuth();

  // ✅ VERIFICĂ AUTENTIFICAREA
  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Trebuie să fii autentificat pentru a vedea programările');
      return;
    }
    
    fetchBookings();
  }, [token, isAuthenticated]);

  const fetchBookings = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/service-orders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        toast.error('Eroare la încărcarea programărilor');
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Eroare de rețea la încărcarea programărilor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setForm({ time: booking.time, address: booking.address });
  };

  const handleCancel = async (id) => {
  const confirmed = window.confirm('Ești sigur că vrei să anulezi această programare?');
  if (!confirmed) return;

  try {
    if (!token || typeof token !== 'string') {
      toast.error('Token lipsă sau invalid');
      return;
    }

    const response = await fetch(`http://localhost:5000/api/users/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`, // important trim
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('✅ Programare anulată cu succes');
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'anulat' } : b)
      );
    } else {
      toast.error(data.message || 'Eroare la anularea programării');
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    toast.error('Eroare de rețea la anularea programării');
  }
};


  const handleSave = async (id) => {
    // ✅ VALIDĂRI ÎNAINTE DE SALVARE
    if (!form.time.trim()) {
      return toast.error('Ora este obligatorie');
    }
    
    if (!form.address.trim()) {
      return toast.error('Adresa este obligatorie');
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/bookings/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          time: form.time.trim(),
          address: form.address.trim()
        })
      });

      if (response.ok) {
        toast.success('✅ Programare actualizată cu succes');
        setBookings(prev =>
          prev.map(b => (b.id === id ? { ...b, time: form.time, address: form.address } : b))
        );
        setEditingId(null);
        setForm({ time: '', address: '' });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Eroare la actualizarea programării');
      }
    } catch (error) {
      console.error('Update booking error:', error);
      toast.error('Eroare de rețea la actualizarea programării');
    }
  };

  const handleProofUploaded = (bookingId, imagePath) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, proof_image: imagePath } : b))
    );
    toast.success('✅ Dovada a fost încărcată cu succes!');
  };

  // ✅ VERIFICĂ AUTENTIFICAREA
  if (!isAuthenticated) {
    return (
      <div className="user-bookings-wrapper">
        <div className="container py-4">
          <div className="alert alert-warning">
            <h4>Acces restricționat</h4>
            <p>Trebuie să fii autentificat pentru a vedea programările tale.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (isLoading) {
    return (
     <div className="user-bookings-wrapper">
        <div className="container py-4">
          <h3 className="mb-4">🧼 Programările Mele</h3>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Se încarcă programările...</span>
            </div>
            <p className="mt-2">Se încarcă programările...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-bookings-wrapper">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>🧼 Programările Mele</h3>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={fetchBookings}
            title="Actualizează lista"
          >
            🔄 Actualizează
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-muted">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h5 className="text-muted">Nu ai nicio programare</h5>
              <p className="text-muted">Programează un serviciu pentru a-l vedea aici.</p>
              <a href="/services" className="btn btn-primary">
                📅 Programează un serviciu
              </a>
            </div>
          </div>
        ) : (
          <div className="row">
            {bookings.map(booking => (
              <div key={booking.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    
                    {/* ✅ HEADER CU STATUS */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="card-title mb-0">
                        {booking.service_name || 'Serviciu necunoscut'}
                      </h6>
                      <span className={`badge ${
                        booking.status === 'anulat' ? 'bg-danger' :
                        booking.status === 'completat' ? 'bg-success' :
                        booking.status === 'in progres' ? 'bg-warning' :
                        'bg-secondary'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* ✅ DETALII PROGRAMARE */}
                    <div className="mb-3">
                      <p className="mb-2">
                        <strong>📅 Data:</strong> {booking.date}
                      </p>
                      
                      {editingId === booking.id ? (
                        <>
                          <div className="mb-2">
                            <label className="form-label">⏰ Ora:</label>
                            <input 
                              type="time" 
                              name="time" 
                              value={form.time} 
                              onChange={handleChange} 
                              className="form-control form-control-sm" 
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">📍 Adresă:</label>
                            <textarea 
                              name="address" 
                              value={form.address} 
                              onChange={handleChange} 
                              className="form-control form-control-sm" 
                              rows="2"
                              required
                            />
                          </div>
                          
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-success btn-sm" 
                              onClick={() => handleSave(booking.id)}
                            >
                              💾 Salvează
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => {
                                setEditingId(null);
                                setForm({ time: '', address: '' });
                              }}
                            >
                              ❌ Anulează
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mb-2">
                            <strong>⏰ Ora:</strong> {booking.time}
                          </p>
                          <p className="mb-3">
                            <strong>📍 Adresă:</strong> {booking.address}
                          </p>
                          
                          {booking.note && (
                            <p className="mb-3">
                              <strong>📝 Notă:</strong> {booking.note}
                            </p>
                          )}

                          {/* ✅ BUTOANE ACȚIUNI */}
                          {booking.status !== 'anulat' && booking.status !== 'completat' && (
                            <div className="d-flex gap-2 mb-3">
                              <button 
                                className="btn btn-outline-primary btn-sm" 
                                onClick={() => handleEdit(booking)}
                              >
                                ✏️ Editează
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm" 
                                onClick={() => handleCancel(booking.id)}
                              >
                                🗑️ Anulează
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ✅ SECȚIUNEA DOVADĂ */}
                    {booking.status !== 'anulat' && (
                      <div className="mt-auto">
                        {booking.proof_image ? (
                          <div>
                            <p className="mb-2"><strong>📸 Dovadă încărcată:</strong></p>
                            <img
                              src={`http://localhost:5000${booking.proof_image}`}
                              alt="Dovadă serviciu"
                              className="img-fluid rounded shadow-sm"
                              style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <ProofUpload 
                            bookingId={booking.id} 
                            onUploaded={(imagePath) => handleProofUploaded(booking.id, imagePath)} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* ✅ FOOTER CU DATA CREĂRII */}
                  <div className="card-footer text-muted text-center">
                    <small>
                      Programat la: {new Date(booking.created_at).toLocaleDateString('ro-RO')}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBookings;