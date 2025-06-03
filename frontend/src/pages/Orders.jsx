import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function Orders() {
  const { orders } = useContext(CartContext);

  return (
    <div className="orders-page py-5">
      <div className="container">
        <h2 className="text-center mb-5">Istoric Comenzi</h2>

        {orders.length === 0 ? (
          <h4 className="text-center">Nu ai comenzi plasate.</h4>
        ) : (
          orders.map(order => (
            <div key={order.id} className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5>Comandă #{order.id}</h5>
                <p><strong>Data:</strong> {order.date}</p>
                <p><strong>Nume:</strong> {order.user.name}</p>
                <p><strong>Adresă:</strong> {order.user.address}</p>
                <p><strong>Telefon:</strong> {order.user.phone}</p>
                <h6>Produse:</h6>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} - {item.quantity} x {item.price} RON</li>
                  ))}
                </ul>
                <h6 className="text-end">Total: {order.total} RON</h6>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;
