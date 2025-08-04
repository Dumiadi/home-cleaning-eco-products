import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminSidebar.css';

function AdminSidebar({ isOpen, onToggle }) {
  const { pathname } = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('Successfully logged out! 👋');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout error');
      localStorage.clear();
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`admin-sidebar bg-dark text-white p-3 ${isOpen ? 'open' : ''}`}>
      
      {/* Header with admin info */}
      <div className="admin-header mb-4">
        <div className="d-flex justify-content-between align-items-center d-md-none">
          <h5 className="mb-0">Admin Panel</h5>
          <button className="btn btn-sm btn-outline-light" onClick={onToggle}>✖</button>
        </div>
        
        {/* Admin info */}
        <div className="admin-info mt-3 d-none d-md-block">
          <div className="d-flex align-items-center">
            <div className="admin-avatar me-3">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="rounded-circle"
                  width="40"
                  height="40"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="avatar-placeholder">
                  👑
                </div>
              )}
            </div>
            <div>
              <div className="admin-name">{user?.name || 'Administrator'}</div>
              <div className="admin-role">🔧 Admin Panel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <ul className="nav flex-column">
        <li className={`nav-item ${isActive('/admin/dashboard') && pathname === '/admin/dashboard' ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard" className="nav-link text-white">
            📊 Dashboard
          </Link>
        </li>
        
        <li className={`nav-item ${isActive('/admin/dashboard/users') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/users" className="nav-link text-white">
            👥 Users
          </Link>
        </li>
        
        <li className={`nav-item ${isActive('/admin/dashboard/orders-products') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/orders-products" className="nav-link text-white">
            📦 Product Orders
          </Link>
        </li>
        
        <li className={`nav-item ${isActive('/admin/dashboard/orders-services') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/orders-services" className="nav-link text-white">
            🧼 Service Bookings
          </Link>
        </li>

        {/* Content Management */}
        <li><hr className="text-light my-3" /></li>
        <li className="nav-item">
          <div className="nav-link text-white-50 small fw-bold">
            📝 CONTENT MANAGEMENT
          </div>
        </li>
        <li className={`nav-item ${isActive('/admin/products') ? 'active-link' : ''}`}>
          <Link to="/admin/products" className="nav-link text-white">
            🛍️ Products
          </Link>
        </li>
        
        <li className={`nav-item ${isActive('/admin/services') ? 'active-link' : ''}`}>
          <Link to="/admin/services" className="nav-link text-white">
            🧽 Services
          </Link>
        </li>
        
        <li className={`nav-item ${isActive('/admin/dashboard/contact-messages') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/contact-messages" className="nav-link text-white">
            📧 Contact Messages
          </Link>
        </li>

        {/* Reports */}
        <li><hr className="text-light my-3" /></li>
        <li className="nav-item">
          <div className="nav-link text-white-50 small fw-bold">
            📈 REPORTS
          </div>
        </li>
        
        <li className={`nav-item ${isActive('/admin/revenue') ? 'active-link' : ''}`}>
          <Link to="/admin/revenue" className="nav-link text-white">
            💰 Revenue
          </Link>
        </li>

        <li className={`nav-item ${isActive('/admin/dashboard/analytics') ? 'active-link' : ''}`}>
          <Link to="/admin/dashboard/analytics" className="nav-link text-white">
            📊 Analytics
          </Link>
        </li>
      </ul>

      {/* Quick Actions */}
      <div className="quick-actions mt-4 d-none d-md-block">
        <h6 className="text-light mb-3">⚡ Quick Actions</h6>
        <div className="d-grid gap-2">
          <Link to="/admin/products" className="btn btn-outline-primary btn-sm">
            ➕ Add Product
          </Link>
          <Link to="/admin/services" className="btn btn-outline-success btn-sm">
            ➕ Add Service
          </Link>
          <a href="/" className="btn btn-outline-info btn-sm" target="_blank">
            🏠 View Site
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats mt-4 d-none d-md-block">
        <h6 className="text-light mb-3">📊 Today</h6>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">12</div>
            <div className="stat-label">Visitors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Orders</div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-auto pt-4 d-none d-md-block">
        <button 
          className="btn btn-outline-danger btn-sm w-100" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Logging out...
            </>
          ) : (
            <>🚪 Logout</>
          )}
        </button>
      </div>

      {/* Mobile Logout */}
      <div className="mt-4 d-md-none">
        <button 
          className="btn btn-outline-danger btn-sm w-100" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : '🚪 Logout'}
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;