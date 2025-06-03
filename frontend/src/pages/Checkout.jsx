import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Checkout.css';
import StepIndicator from '../components/StepIndicator';

function Checkout() {
  const { cartItems, placeOrder } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '' // am adăugat email aici direct!
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    placeOrder(formData);
    navigate('/confirmare'); // DUCE LA CONFIRMARE!!
  };

  return (
    <div className="checkout-page">
      <div className="container">

        {/* Step Indicator - PASUL 2 activ */}
        <StepIndicator activeStep={2} />

        {/* Card formular */}
        <div className="d-flex justify-content-center align-items-center">
          <div className="card shadow p-4" style={{ maxWidth: "600px", width: "100%", borderRadius: "15px" }}>
            <h2 className="text-center mb-4 text-primary">Finalizare Comandă</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nume Complet</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  name="name"
                  placeholder="Ion Popescu"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Adresă de Livrare</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  name="address"
                  placeholder="Strada Exemplu, Nr. 10, București"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Telefon</label>
                <input
                  type="tel"
                  className="form-control form-control-lg rounded-3"
                  name="phone"
                  placeholder="07xx xxx xxx"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-3"
                  name="email"
                  placeholder="exemplu@email.com"
                  required
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-success btn-lg w-100 rounded-3">
                Trimite Comanda
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
