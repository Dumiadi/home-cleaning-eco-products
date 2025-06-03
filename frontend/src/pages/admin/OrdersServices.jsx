import React, { useEffect, useState } from 'react';
import './OrdersServices.css';
import ServiceChart from './ServiceChart';

function OrdersServices() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Toate');

  // Fetch programări
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/service-orders')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setFiltered(data);
      })
      .catch(err => console.error('Eroare programări:', err));
  }, []);

  // Filtrare live
  useEffect(() => {
    let result = services;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(order =>
        order.service_name?.toLowerCase().includes(s) ||
        order.user_email?.toLowerCase().includes(s) ||
        order.address?.toLowerCase().includes(s)
      );
    }

    if (filterStatus !== 'Toate') {
      result = result.filter(order => order.status === filterStatus);
    }

    setFiltered(result);
  }, [search, filterStatus, services]);

  // Modificare status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const updated = services.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      );
      setServices(updated);
    } catch (err) {
      console.error('Eroare actualizare status:', err);
    }
  };

  // Ștergere programare
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Sigur vrei să ștergi această programare?');
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
        method: 'DELETE'
      });

      setServices(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  return (
    <div className="container orders-container">
      <h3 className="mb-4">🧼 Programări Servicii</h3>

      {/* Export Excel */}
      <a
        href="http://localhost:5000/api/admin/service-orders/export"
        className="btn btn-success mb-4"
        download
      >
        ⬇️ Exportă în Excel
      </a>

      {/* Căutare + Filtru */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Caută după serviciu, email sau adresă..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>Toate</option>
            <option>În așteptare</option>
            <option>Confirmat</option>
            <option>Anulat</option>
            <option>Finalizat</option>
          </select>
        </div>
      </div>

      {/* Lista programări */}
      {filtered.length === 0 ? (
        <p>Nu există programări potrivite.</p>
      ) : (
        filtered.map((order) => (
          <div key={order.id} className="card mb-3">
            <div className="card-body">
              <p><strong>Serviciu:</strong> {order.service_name}</p>
              <p><strong>Data:</strong> {order.date} la {order.time}</p>
              <p><strong>Adresă:</strong> {order.address}</p>
              <p><strong>User:</strong> {order.user_email || 'Anonim'}</p>

              <div className="d-flex align-items-center mb-2">
                <strong className="me-2">Status:</strong>
                <select
                  className="form-select form-select-sm w-auto"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="În așteptare">În așteptare</option>
                  <option value="Confirmat">Confirmat</option>
                  <option value="Anulat">Anulat</option>
                  <option value="Finalizat">Finalizat</option>
                </select>
              </div>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(order.id)}
              >
                🗑️ Șterge programarea
              </button>
            </div>
          </div>
        ))
      )}

      {/* Grafic programări lunare */}
      <ServiceChart />
    </div>
  );
}

export default OrdersServices;
