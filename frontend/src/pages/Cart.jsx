import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import StepIndicator from '../components/StepIndicator'; // corect importat componenta nouă!

function Cart() {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    <div className="cart-page py-5">
      <div className="container">

        {/* Step Indicator - Pasul 1 activ */}
        <StepIndicator activeStep={1} />

        <h2 className="text-center mb-5">Coșul Meu</h2>

        {cartItems.length === 0 ? (
          <h4 className="text-center">Coșul este gol!</h4>
        ) : (
          <>
            <div className="row">
              {cartItems.map((item, index) => (
                <div key={index} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <img src={item.image} className="card-img-top" alt={item.name} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.description}</p>
                      <p className="fw-bold">Cantitate: {item.quantity}</p>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{item.price} RON</span>
                        <button className="btn btn-danger" onClick={() => removeFromCart(item.id)}>Șterge</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <h4>Total: {total} RON</h4>
              <Link to="/checkout">
                <button className="btn btn-success btn-lg mt-3">Finalizare Comandă</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
