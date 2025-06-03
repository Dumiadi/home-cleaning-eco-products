import React from 'react';
import StepIndicator from '../components/StepIndicator'; // folosim StepIndicator
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Confirmare.css'; // Importăm css separat pentru Confirmare

function Confirmare() {
  return (
    <div className="confirmare-page py-5">
      <div className="container d-flex flex-column align-items-center justify-content-center text-center">
        
        <StepIndicator activeStep={3} /> {/* PASUL 3 activ */}
        
        <div className="card shadow p-5" style={{ maxWidth: '600px', width: '100%', borderRadius: '15px' }}>
          <div className="mb-4">
            <div className="success-icon mb-3">✅</div>
            <h2 className="text-success">Mulțumim pentru comandă!</h2>
            <p className="mt-3">Veți primi detalii despre livrare pe adresa de e-mail sau telefon.</p>
          </div>

          <Link to="/">
            <button className="btn btn-primary mt-4">Înapoi la Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Confirmare;
