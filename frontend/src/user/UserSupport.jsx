import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './UserSupport.css';

function UserSupport() {
  const [form, setForm] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ FOLOSEȘTE AUTHCONTEXT ÎN LOC DE localStorage
  const { user, token, isAuthenticated } = useAuth();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDĂRI
    if (!form.subject.trim()) {
      toast.warning('Subiectul este obligatoriu!');
      return;
    }

    if (!form.message.trim()) {
      toast.warning('Mesajul este obligatoriu!');
      return;
    }

    if (form.message.trim().length < 10) {
      toast.warning('Mesajul trebuie să aibă cel puțin 10 caractere!');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Trebuie să fii autentificat pentru a trimite mesaje!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ ADAUGĂ AUTENTIFICARE
        },
        body: JSON.stringify({
          subject: form.subject.trim(),
          message: form.message.trim(),
          email: user.email, // ✅ FOLOSEȘTE EMAIL DIN AUTHCONTEXT
          name: user.name    // ✅ ADAUGĂ ȘI NUMELE
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('✅ Mesaj trimis cu succes! Vei primi un răspuns pe email în curând.');
        setForm({ subject: '', message: '' });
      } else {
        toast.error(data.message || 'Eroare la trimiterea mesajului');
      }
    } catch (error) {
      console.error('Support message error:', error);
      toast.error('Eroare de rețea la trimiterea mesajului');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ VERIFICĂ AUTENTIFICAREA
  if (!isAuthenticated) {
    return (
      <div className="user-support-wrapper">
        <div className="container py-4">
          <div className="alert alert-warning">
            <h4>Acces restricționat</h4>
            <p>Trebuie să fii autentificat pentru a trimite mesaje de suport.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-support-wrapper">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* ✅ HEADER */}
            <div className="text-center mb-5">
              <h3 className="mb-3">🛠️ Suport & Asistență</h3>
              <p className="text-muted">
                Ai nevoie de ajutor? Trimite-ne un mesaj și îți vom răspunde în cel mai scurt timp possible.
              </p>
            </div>

            {/* ✅ CARD UTILIZATOR */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="rounded-circle" width="50" height="50" />
                    ) : (
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="mb-1">{user.name}</h6>
                    <p className="text-muted mb-0">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FORMULARUL */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                
                <form onSubmit={handleSubmit}>
                  
                  {/* ✅ SUBJECT INPUT */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      📝 Subiect *
                    </label>
                    <select
                      name="subject"
                      className="form-select mb-2"
                      value={form.subject}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Selectează categoria problemei</option>
                      <option value="Problemă cu comanda">🛒 Problemă cu comanda</option>
                      <option value="Întrebare despre programare">📅 Întrebare despre programare</option>
                      <option value="Problemă de plată">💳 Problemă de plată</option>
                      <option value="Calitatea serviciului">⭐ Calitatea serviciului</option>
                      <option value="Problemă tehnică">🔧 Problemă tehnică</option>
                      <option value="Sugestii și feedback">💡 Sugestii și feedback</option>
                      <option value="Altceva">❓ Altceva</option>
                    </select>
                    
                    {/* ✅ CUSTOM SUBJECT DACĂ E "ALTCEVA" */}
                    {form.subject === 'Altceva' && (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Scrie subiectul tău..."
                        onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                        disabled={isSubmitting}
                        required
                      />
                    )}
                  </div>

                  {/* ✅ MESSAGE TEXTAREA */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      💬 Mesajul tău *
                    </label>
                    <textarea
                      name="message"
                      className="form-control"
                      rows="6"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Descrie problema sau întrebarea ta în detaliu. Cu cât dai mai multe informații, cu atât te putem ajuta mai bine..."
                      disabled={isSubmitting}
                      required
                      minLength="10"
                    />
                    <div className="form-text">
                      Minim 10 caractere • {form.message.length}/1000 caractere
                    </div>
                  </div>

                  {/* ✅ SUBMIT BUTTON */}
                  <div className="d-grid">
                    <button 
                      className="btn btn-primary btn-lg" 
                      type="submit"
                      disabled={isSubmitting || !form.subject.trim() || !form.message.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Se trimite mesajul...
                        </>
                      ) : (
                        <>📨 Trimite mesajul</>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>

            {/* ✅ INFO FOOTER */}
            <div className="text-center mt-4">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <div className="text-primary mb-2">⏱️</div>
                    <h6>Timp de răspuns</h6>
                    <small className="text-muted">Maxim 24 ore</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <div className="text-primary mb-2">📧</div>
                    <h6>Răspuns pe email</h6>
                    <small className="text-muted">La {user.email}</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <div className="text-primary mb-2">📞</div>
                    <h6>Urgențe</h6>
                    <small className="text-muted">+40 712 345 678</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSupport;