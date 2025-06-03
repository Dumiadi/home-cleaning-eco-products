import React, { useEffect, useState } from 'react';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchServices = () => {
    fetch('http://localhost:5000/api/admin/services')
      .then(res => res.json())
      .then(setServices);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/admin/services/${editingId}`
      : `http://localhost:5000/api/admin/services`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setFormData({ name: '', description: '', price: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleEdit = (service) => {
    setFormData(service);
    setEditingId(service.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ștergi serviciul?')) return;
    await fetch(`http://localhost:5000/api/admin/services/${id}`, { method: 'DELETE' });
    fetchServices();
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">🧽 Administrare Servicii</h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <input name="name" className="form-control" placeholder="Nume" value={formData.name} onChange={handleChange} required />
          <input name="description" className="form-control" placeholder="Descriere" value={formData.description} onChange={handleChange} required />
          <input name="price" className="form-control" placeholder="Preț (RON)" value={formData.price} onChange={handleChange} required />
        </div>
        <button className="btn btn-success mt-3">{editingId ? '✅ Salvează modificările' : '➕ Adaugă serviciu'}</button>
      </form>

      <ul className="list-group">
        {services.map(service => (
          <li key={service.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <strong>{service.name}</strong> – {service.price} RON
            </span>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(service)}>✏️</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(service.id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminServices;
