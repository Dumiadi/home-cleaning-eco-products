// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaLeaf, FaShoppingCart, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
// import './Navbar.css';

// function Navbar({ cartCount = 0 }) {
//   const navigate = useNavigate();
//   const [darkMode, setDarkMode] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const savedMode = localStorage.getItem('darkMode') === 'true';
//     const savedUser = JSON.parse(localStorage.getItem('user'));
//     setDarkMode(savedMode);
//     setUser(savedUser);
//     document.body.classList.toggle('dark-mode', savedMode);
//   }, []);

//   const toggleDarkMode = () => {
//     const newMode = !darkMode;
//     setDarkMode(newMode);
//     localStorage.setItem('darkMode', newMode);
//     document.body.classList.toggle('dark-mode', newMode);
//     document.body.classList.toggle('light-mode', !newMode);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('isAdmin');
//     navigate('/login');
//   };

//   const isAdmin = localStorage.getItem('isAdmin') === 'true';

//   return (
//     <nav className="navbar navbar-expand-lg shadow-sm fixed-top bg-white">
//       <div className="container-fluid px-4">
//         <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to="/">
//           <FaLeaf /> Curățenie Eco
//         </Link>
//         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse justify-content-end" id="navbarMain">
//           <ul className="navbar-nav align-items-center gap-3">
//             <li className="nav-item"><Link className="nav-link" to="/">Acasă</Link></li>
//             <li className="nav-item"><Link className="nav-link" to="/services">Servicii</Link></li>
//             <li className="nav-item"><Link className="nav-link" to="/products">Produse</Link></li>
//             <li className="nav-item"><Link className="nav-link" to="/booking">Programare</Link></li>
//             <li className="nav-item"><Link className="nav-link" to="/top-produse">Top Produse</Link></li>

//             {isAdmin && (
//               <li className="nav-item">
//                 <Link className="nav-link text-danger fw-bold" to="/admin/products">Dashboard</Link>
//               </li>
//             )}

//             <li className="nav-item">
//               <button className="btn btn-outline-light" onClick={toggleDarkMode}>
//                 {darkMode ? <FaSun /> : <FaMoon />}
//               </button>
//             </li>

//             <li className="nav-item position-relative">
//               <Link to="/cart" className="nav-link">
//                 <FaShoppingCart size={22} />
//                 {cartCount > 0 && (
//                   <span className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill">
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>
//             </li>

//             {!user && (
//               <li className="nav-item">
//                <Link to="/login" className="btn btn-success rounded-pill px-3 fw-semibold">
//                   Login / Register
//              </Link>
//               </li>
//             )}

//             {user && (
//               <li className="nav-item dropdown">
//                 <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
//                   <FaUserCircle /> {user.user.name || 'Contul Meu'}
//                 </button>
//                 <ul className="dropdown-menu dropdown-menu-end">
//                   <li><Link className="dropdown-item" to="/account">📄 Contul Meu</Link></li>
//                   <li><button className="dropdown-item text-danger" onClick={handleLogout}>🚪 Logout</button></li>
//                 </ul>
//               </li>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))?.user;
  const { t, i18n } = useTranslation();

  // Schimbare limbă
  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  // Limbă din localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ro';
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  // Temă întunecată
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand logo-text" to="/">
          🧼 Curățenie Eco
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">{t('Home')}</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/services">{t('Services')}</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">{t('Products')}</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/booking">{t('Booking')}</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/top-produse">{t('Top')}</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* 🌐 Limbi */}
            <div className="dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                🌐
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item" onClick={() => handleLanguageChange('ro')}>Română</button></li>
                <li><button className="dropdown-item" onClick={() => handleLanguageChange('en')}>English</button></li>
              </ul>
            </div>

            {/* 🌙 Dark Mode */}
            <button onClick={toggleTheme} className="btn btn-outline-light">
              {darkMode ? '🌙' : '☀️'}
            </button>

            {/* 🛒 Coș */}
            <NavLink to="/cart" className="btn btn-outline-light">🛒</NavLink>

            {/* 👤 Utilizator */}
            {user ? (
  <div className="dropdown d-flex align-items-center gap-2">
    {user.avatar && (
      <img
        src={user.avatar}
        alt="Avatar"
        className="rounded-circle"
        style={{ width: 32, height: 32, objectFit: 'cover' }}
      />
    )}
    <button
      className="btn btn-success dropdown-toggle"
      data-bs-toggle="dropdown"
    >
      {user.name}
    </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/account">{t('account')}</Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item" to="/admin/dashboard">{t('adminDashboard')}</Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>{t('logout')}</button>
                  </li>
                </ul>
              </div>
            ) : (
              <NavLink to="/login" className="btn btn-success">
                {t('Login/Register')}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
