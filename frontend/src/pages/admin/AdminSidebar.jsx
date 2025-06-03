import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar({ isOpen, onToggle }) {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className={`admin-sidebar bg-dark text-white p-3 ${isOpen ? 'open' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-4 d-md-none">
        <h5 className="mb-0">Admin Panel</h5>
        <button className="btn btn-sm btn-outline-light" onClick={onToggle}>✖</button>
      </div>

      <ul className="nav flex-column">
        <li className={`nav-item ${isActive('/admin/dashboard') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard" className="nav-link text-white">📊 Statistici</Link>
        </li>
        <li className={`nav-item ${isActive('/admin/dashboard/users') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/users" className="nav-link text-white">👥 Utilizatori</Link>
        </li>
        <li className={`nav-item ${isActive('/admin/dashboard/orders-products') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/orders-products" className="nav-link text-white">📦 Comenzi Produse</Link>
        </li>
        <li className={`nav-item ${isActive('/admin/dashboard/orders-services') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/orders-services" className="nav-link text-white">🧼 Servicii</Link>
        </li>
        <li className={`nav-item ${isActive('/admin/revenue') ? 'active-link' : ''}`}>
          <Link to="/admin/revenue" className="nav-link text-white">💰 Venituri</Link>
        </li>
      </ul>

      <div className="mt-auto pt-4 d-none d-md-block">
        <button className="btn btn-outline-light btn-sm w-100" onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
