import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('You have successfully logged out! 👋');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className={`navbar fixed-top navbar-expand-lg navbar-dark shadow-sm ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand logo-text" to="/">🧼 Eco Cleaning</Link>
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
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/services">Services</NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">Products</NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="user-dropdown dropdown">
                <button 
                  className="user-button dropdown-toggle" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="user-avatar"
                    />
                  )}
                  <span className="user-name">{user.name}</span>
                </button>
                
                <ul className="dropdown-menu dropdown-menu-end user-menu">
                  <li>
                    <Link className="dropdown-item" to="/account/bookings">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      My Bookings
                    </Link>
                  </li>
                  
                  <li>
                    <Link className="dropdown-item" to="/account/profile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Account Settings
                    </Link>
                  </li>
                  
                  <li>
                    <Link className="dropdown-item" to="/account/orders">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Order History
                    </Link>
                  </li>
                  
                  {user.role === 'admin' && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item admin-item" to="/admin/dashboard">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item logout-item" 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <NavLink to="/login" className="login-btn">
                Login/Register
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;