import React, { useEffect, useState } from 'react';
import './Account.css';

function Account() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const profileRes = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        setUserData(profileData);

        const orderRes = await fetch('http://localhost:5000/api/users/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderData = await orderRes.json();
        setOrders(Array.isArray(orderData) ? orderData : []);

        const serviceRes = await fetch('http://localhost:5000/api/users/service-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serviceData = await serviceRes.json();
        setServiceOrders(Array.isArray(serviceData) ? serviceData : []);
      } catch (err) {
        console.error('Eroare la aducerea datelor userului:', err);
      }
    };

    fetchData();
  }, [token]);

  const startEdit = () => {
    setFormData({ name: userData.name, email: userData.email, password: '', confirm: '' });
    setEditMode(true);
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password && formData.password !== formData.confirm) {
      return setMessage('⚠️ Parolele nu coincid.');
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) return setMessage(data.message || 'Eroare');

      setMessage('✅ Date actualizate cu succes!');
      setEditMode(false);
      const updatedUser = { ...userData, name: formData.name, email: formData.email };
      setUserData(updatedUser);

      // actualizează în localStorage
      const local = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...local, user: updatedUser }));
    } catch (err) {
      setMessage('Eroare de rețea la actualizare.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi contul? Această acțiune este ireversibilă!');
    if (!confirmDelete) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Eroare la ștergere cont');
        return;
      }

      alert('Contul a fost șters.');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      alert('Eroare la ștergere cont.');
    }
  };

  if (!userData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
        <h5>Se încarcă datele...</h5>
      </div>
    );
  }

  return (
    <div className="container py-5 account-page">
      <h2 className="mb-4">Contul Meu</h2>

      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">Date personale</h5>

          {message && <div className="alert alert-info">{message}</div>}

          {editMode ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-2">
                <label className="form-label">Nume</label>
                <input name="name" value={formData.name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control" required />
              </div>
              <div className="mb-2">
                <label className="form-label">Parolă nouă (opțional)</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirmă parola</label>
                <input name="confirm" type="password" value={formData.confirm} onChange={handleChange} className="form-control" />
              </div>
              <button type="submit" className="btn btn-success me-2">Salvează</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Anulează</button>
            </form>
          ) : (
            <>
              <p><strong>Nume:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <button className="btn btn-primary me-3" onClick={startEdit}>Modifică datele</button>
              <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>Șterge contul</button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4>Comenzile mele (Produse)</h4>
        {orders?.length === 0 ? (
          <p>Nu ai comenzi.</p>
        ) : (
          orders?.map(order => (
            <div key={order.id} className="card mb-3">
              <div className="card-body">
                <p><strong>Data:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Produse:</strong></p>
                <ul>
                  {Array.isArray(JSON.parse(order.items)) && JSON.parse(order.items).map((item, idx) => (
                    <li key={idx}>{item.name} – {item.quantity} buc. – {item.price} RON</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h4>Programările mele (Servicii)</h4>
        {serviceOrders?.length === 0 ? (
          <p>Nu ai programări.</p>
        ) : (
          serviceOrders?.map(so => (
            <div key={so.id} className="card mb-3">
              <div className="card-body">
                <p><strong>Serviciu:</strong> {so.service_name}</p>
                <p><strong>Data:</strong> {so.date} la {so.time}</p>
                <p><strong>Adresă:</strong> {so.address}</p>
                <p><strong>Status:</strong> {so.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Account;
