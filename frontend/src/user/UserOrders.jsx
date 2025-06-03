import React, { useEffect, useState } from 'react';
import './UserOrders.css';

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    fetch('http://localhost:5000/api/users/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      })
      .catch(err => {
        console.error('Eroare la comenzi:', err);
        setOrders([]);
      });
  }, [token]);

  const handleDownload = async (orderId) => {
    window.open(`http://localhost:5000/api/invoice/pdf/${orderId}`, '_blank');
  };

  return (
    <div className="user-orders">
      <h3 className="mb-4">📦 Comenzile mele</h3>

      {orders.length === 0 ? (
        <p>Nu ai comenzi înregistrate.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <p><strong>Comandă ID:</strong> #{order.id}</p>
              <p><strong>Data:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Total:</strong> {order.total} RON</p>
              <p><strong>Produse:</strong></p>
              <ul>
                {JSON.parse(order.items).map((item, i) => (
                  <li key={i}>{item.name} – {item.quantity} buc – {item.price} RON</li>
                ))}
              </ul>

              <button
                className="btn btn-outline-success mt-2"
                onClick={() => handleDownload(order.id)}
              >
                📄 Descarcă Factura PDF
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserOrders;
