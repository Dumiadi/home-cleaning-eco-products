// frontend/src/components/admin/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const UserEditModal = ({ user, isOpen, onClose, onUserUpdated }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populează formularul când se deschide modal-ul
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active'
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Numele este obligatoriu';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email-ul nu este valid';
    }

    if (!formData.role) {
      newErrors.role = 'Rolul este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Șterge eroarea pentru câmpul modificat
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ Utilizator actualizat cu succes!');
        onUserUpdated(data.user); // Callback pentru a actualiza lista
        onClose(); // Închide modal-ul
      } else {
        toast.error(data.message || 'Eroare la actualizarea utilizatorului');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Eroare de rețea la actualizarea utilizatorului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Ești sigur că vrei să ștergi utilizatorul "${user.name}"?\n\nAceastă acțiune nu poate fi anulată.`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ Utilizator șters cu succes!');
        onUserUpdated(); // Callback pentru a actualiza lista
        onClose(); // Închide modal-ul
      } else {
        toast.error(data.message || 'Eroare la ștergerea utilizatorului');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Eroare de rețea la ștergerea utilizatorului');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              ✏️ Editează utilizatorul: {user.name}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Nume complet <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Ex: Ion Popescu"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Ex: ion@example.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Rol <span className="text-danger">*</span>
                    </label>
                    <select
                      name="role"
                      className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    >
                      <option value="user">👤 Utilizator</option>
                      <option value="admin">👑 Administrator</option>
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback">{errors.role}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Status cont</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    >
                      <option value="active">✅ Activ</option>
                      <option value="inactive">❌ Inactiv</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Informații suplimentare */}
              <div className="border-top pt-3 mt-3">
                <h6 className="text-muted">📊 Informații cont</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>ID:</strong> #{user.id}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Creat la:</strong> {new Date(user.created_at).toLocaleDateString('ro-RO')}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="d-flex justify-content-between w-100">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Se șterge...
                    </>
                  ) : (
                    <>🗑️ Șterge utilizatorul</>
                  )}
                </button>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Se salvează...
                      </>
                    ) : (
                      <>✅ Salvează modificările</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;