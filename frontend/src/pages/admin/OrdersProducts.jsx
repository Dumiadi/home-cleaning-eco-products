
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function OrdersProducts() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setFiltered(data);
        calculateTotal(data);
      });
  }, []);

  const calculateTotal = (ordersList) => {
    let total = 0;
    ordersList.forEach(order => {
      const items = JSON.parse(order.items);
      items.forEach(item => {
        const price = parseFloat(item.price?.replace(' RON', '') || 0);
        const qty = parseInt(item.quantity || 1);
        total += price * qty;
      });
    });
    setTotalSum(total.toFixed(2));
  };

  useEffect(() => {
    let results = orders;

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(order =>
        JSON.stringify(order).toLowerCase().includes(s)
      );
    }

    if (selectedDate) {
      const selected = new Date(selectedDate).toDateString();
      results = results.filter(order =>
        new Date(order.created_at).toDateString() === selected
      );
    }

    setFiltered(results);
    calculateTotal(results);
  }, [search, selectedDate, orders]);

  return (
    <div className="container">
      <h3 className="mb-4">📦 Comenzi Produse</h3>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Caută produs/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />

        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          placeholderText="Filtru după dată"
          className="form-control"
        />

        <a
          href="http://localhost:5000/api/admin/orders/export"
          className="btn btn-success"
        >
          ⬇️ Export Excel
        </a>
      </div>

      <p><strong>Total comenzi afișate:</strong> {filtered.length}</p>
      <p><strong>Suma totală:</strong> {totalSum} RON</p>

      {filtered.map(order => (
        <div key={order.id} className="card mb-3">
          <div className="card-body">
            <p><strong>Email:</strong> {order.user_email || 'Anonim'}</p>
            <p><strong>Data:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Produse:</strong></p>
            <ul>
              {JSON.parse(order.items).map((item, idx) => (
                <li key={idx}>
                  {item.name} – {item.quantity} x {item.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrdersProducts;
