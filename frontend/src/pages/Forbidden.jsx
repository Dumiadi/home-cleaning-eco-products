import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => (
  <div className="container text-center py-5">
    <h1 className="display-1 text-danger">403</h1>
    <h3>Acces interzis</h3>
    <p>Nu ai permisiunea să accesezi această pagină.</p>
    <Link to="/" className="btn btn-outline-primary mt-3">Înapoi la Acasă</Link>
  </div>
);

export default Forbidden;
