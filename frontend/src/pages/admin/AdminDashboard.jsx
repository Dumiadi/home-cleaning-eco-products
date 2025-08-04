import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import Users from './Users';
import OrdersProducts from './OrdersProducts';
import OrdersServices from './OrdersServices';
import Stats from './Stats';
import ContactMessages from './ContactMessages';
// ✅ IMPORT TOATE COMPONENTELE LIPSĂ
import AdminProducts from './AdminProducts';
import Analytics from './Analytics'; // ✅ ADĂUGAT IMPORTUL PENTRU ANALYTICS
import SupportMessages from './SupportMessages';
function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>🚫 Access Denied</h4>
          <p>You must be logged in to access the admin panel.</p>
          <a href="/login" className="btn btn-primary">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          <h4>⚠️ Insufficient Permissions</h4>
          <p>You do not have the required permissions to access the admin panel.</p>
          <p><strong>Your role:</strong> {user.role || 'user'}</p>
          <div className="mt-3">
            <a href="/" className="btn btn-primary me-2">
              🏠 Back to Home
            </a>
            <a href="/account" className="btn btn-outline-primary">
              👤 My Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-grow-1 p-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-secondary d-md-none me-3" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰ Menu
            </button>
            <div>
              <h4 className="mb-0">👑 Admin Panel</h4>
              <small className="text-muted">
                Welcome, {user.name?.split(' ')[0] || 'Admin'}!
              </small>
            </div>
          </div>
          
          <div className="d-none d-md-flex align-items-center">
            {user.avatar && (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="rounded-circle me-2"
                width="32"
                height="32"
                style={{ objectFit: 'cover' }}
              />
            )}
            <span className="text-muted">
              {user.email}
            </span>
          </div>
        </div>

        {/* ✅ TOATE RUTELE ADMIN */}
        <Routes>
          {/* Dashboard principal */}
          <Route path="" element={<Stats />} />
          <Route path="/" element={<Stats />} />
          <Route path="dashboard" element={<Stats />} />
          
          {/* Utilizatori */}
          <Route path="users" element={<Users />} />
          <Route path="dashboard/users" element={<Users />} />
          
          {/* ✅ PRODUSE - RUTA PRINCIPALĂ */}
          <Route path="products" element={<AdminProducts />} />
          
          {/* Comenzi */}
          <Route path="orders-products" element={<OrdersProducts />} />
          <Route path="dashboard/orders-products" element={<OrdersProducts />} />
          <Route path="orders-services" element={<OrdersServices />} />
          <Route path="dashboard/orders-services" element={<OrdersServices />} />
          
          {/* Mesaje contact */}
          <Route path="contact-messages" element={<ContactMessages />} />
          <Route path="dashboard/contact-messages" element={<ContactMessages />} />
          
          {/* ✅ ANALYTICS - RUTA ADĂUGATĂ */}
          <Route path="analytics" element={<Analytics />} />
        <Route path="support-messages" element={<SupportMessages />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;