import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  ShoppingBag, 
  Calendar, 
  MessageCircle, 
  LogOut,
  ChevronRight,
  Home,
  Award,
  Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import './UserSidebar.css';

const UserSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('You have been logged out successfully! 👋');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      path: '/account',
      label: 'Dashboard',
      icon: <Home className="icon" size={20} />,
      exact: true
    },
    {
      path: '/account/orders',
      label: 'My Orders',
      icon: <ShoppingBag className="icon" size={20} />,
      badge: null
    },
    {
      path: '/account/bookings',
      label: 'My Bookings',
      icon: <Calendar className="icon" size={20} />,
      badge: null
    },
    {
      path: '/account/profile',
      label: 'My Profile',
      icon: <User className="icon" size={20} />
    },
    {
      path: '/account/support',
      label: 'Support & Help',
      icon: <MessageCircle className="icon" size={20} />
    }
  ];

  const quickActions = [
    {
      path: '/services',
      label: 'Book a Service',
      icon: <Calendar className="icon" size={18} />,
      color: 'success',
      external: true
    },
    {
      path: '/products',
      label: 'Order Products',
      icon: <ShoppingBag className="icon" size={18} />,
      color: 'primary',
      external: true
    }
  ];

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="rounded-circle"
                width="80"
                height="80"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar-placeholder">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          
          <h5 className="user-name">
            {user?.name || 'User'}
          </h5>
          
          <p className="user-email">
            {user?.email}
          </p>

          {/* User Status Badge */}
          <div className="verified-badge">
            <Shield size={12} />
            <span>Verified Member</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="nav-menu">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <div className="nav-content">
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                </div>
                
                <div className="nav-actions">
                  {item.badge && (
                    <span className="nav-badge">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className="nav-arrow" />
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Quick Actions */}
      <div className="quick-actions-container">
        <h6 className="section-heading">
          Quick Actions
        </h6>
        
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            action.external ? (
              <a
                key={index}
                href={action.path}
                className={`quick-action quick-action-${action.color}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-text">{action.label}</span>
                <div className="action-glow"></div>
              </a>
            ) : (
              <NavLink
                key={index}
                to={action.path}
                className={`quick-action quick-action-${action.color}`}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-text">{action.label}</span>
                <div className="action-glow"></div>
              </NavLink>
            )
          ))}
        </div>
      </div>

      {/* Loyalty Program Section */}
      <div className="eco-points-container">
        <div className="eco-points-card">
          <div className="eco-header">
            <div className="eco-icon-wrapper">
              <Award size={24} />
              <div className="icon-sparkle"></div>
            </div>
            <div className="eco-info">
              <h4>Eco Points</h4>
              <p>You've collected 150 eco points!</p>
            </div>
          </div>
          <button className="eco-rewards-btn">
            <span>View Rewards</span>
            <div className="btn-glow"></div>
          </button>
          <div className="eco-bg-pattern"></div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="logout-container">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="logout-button"
        >
          <LogOut size={18} />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;