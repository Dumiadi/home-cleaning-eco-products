import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Booking.css';

function Booking() {
  const [form, setForm] = useState({
    service_id: '',
    date: '',
    time: '',
    address: '',
    note: '',
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  // Obține lista serviciilor
  useEffect(() => {
    fetch('http://localhost:5000/api/users/services')
      .then(res => res.json())
      .then(data => setServices(data));
  }, []);

  // Obține datele ocupate
  useEffect(() => {
    fetch('http://localhost:5000/api/bookings/ocupate')
      .then(res => res.json())
      .then(data => {
        const parsedDates = data.map(d => new Date(d));
        setDisabledDates(parsedDates);
      });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warning("Trebuie să fii autentificat.");
      return navigate('/login');
    }

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Programare efectuată!');
        navigate('/account');
      } else {
        toast.error(data.message || 'Eroare la trimiterea programării.');
      }
    } catch (err) {
      toast.error('Eroare de rețea');
    }
  };

  return (
    <div className="container py-5">
      <div className="booking-form-container mx-auto" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4">Programează un serviciu</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Serviciu</label>
            <select name="service_id" className="form-select" onChange={handleChange} required>
              <option value="">Alege un serviciu</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} – {s.price} RON</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Dată</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setForm(prev => ({
                  ...prev,
                  date: date.toISOString().split('T')[0]
                }));
              }}
              excludeDates={disabledDates}
              minDate={new Date()}
              placeholderText="Selectează o dată"
              className="form-control"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Oră</label>
            <input type="time" name="time" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Adresă</label>
            <input type="text" name="address" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Observații</label>
            <textarea name="note" className="form-control" rows="3" onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="btn btn-success w-100">Trimite Programarea</button>
        </form>
      </div>
    </div>
  );
}

export default Booking;
