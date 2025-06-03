import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css'; // Stilurile noastre

function Footer() {
  return (
    <footer className="footer bg-dark text-white pt-4">
      <div className="container text-center text-md-left">
        <div className="row text-center text-md-left">
          <div className="col-md-6 col-lg-6 col-xl-6 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Curățenie Eco</h5>
            <p>Platforma ta pentru servicii de curățenie și produse eco-friendly. Grijă pentru casă și natură!</p>
          </div>

          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Linkuri utile</h5>
            <p><Link to="/services" className="text-white" style={{ textDecoration: 'none' }}>Servicii</Link></p>
            <p><Link to="/products" className="text-white" style={{ textDecoration: 'none' }}>Produse</Link></p>
            <p><Link to="/booking" className="text-white" style={{ textDecoration: 'none' }}>Programare</Link></p>
            <p><Link to="/login" className="text-white" style={{ textDecoration: 'none' }}>Contul Meu</Link></p>
          </div>

          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Contactează-ne</h5>
            <p><i className="fas fa-home mr-3"></i> Strada Eco nr. 1, București</p>
            <p><i className="fas fa-envelope mr-3"></i> contact@curatenie-eco.ro</p>
            <p><i className="fas fa-phone mr-3"></i> +40 712 345 678</p>
          </div>
        </div>

        <hr className="mb-4" />

        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p>© 2025 Curățenie Eco - Toate drepturile rezervate.</p>
          </div>

          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-right">
              <ul className="list-unstyled list-inline">
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}>
                    <FaFacebook />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}>
                    <FaInstagram />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}>
                    <FaTwitter />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
