import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container text-center py-5">
    <h1 className="display-1 text-danger">404</h1>
    <h3>Ups! Pagina nu a fost găsită.</h3>
    <p>Se pare că ai nimerit un drum greșit.</p>
    <Link to="/" className="btn btn-primary mt-3">Înapoi la Acasă</Link>
  </div>
);

export default NotFound;
