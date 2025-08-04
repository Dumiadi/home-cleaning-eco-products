// frontend/src/pages/Orders.jsx - CUSTOMER ORDERS PAGE IN ENGLISH
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [error, setError] = useState(null);

  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view orders');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch product orders
      const productResponse = await fetch('http://localhost:5000/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (productResponse.ok) {
        const productData = await productResponse.json();
        setOrders(Array.isArray(productData) ? productData : []);
      } else {
        console.error('Error fetching product orders:', productResponse.status);
      }

      // Fetch service orders
      const serviceResponse = await fetch('http://localhost:5000/api/users/service-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        setServiceOrders(Array.isArray(serviceData) ? serviceData : []);
      } else {
        console.error('Error fetching service orders:', serviceResponse.status);
      }

    } catch (error) {
      console.error('Fetch orders error:', error);
      setError('Error loading orders');
      toast.error('Error loading orders');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ HELPER FUNCTIONS
  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'in asteptare': 'Pending',
      'confirmat': 'Confirmed',
      'anulat': 'Cancelled',
      'finalizat': 'Completed'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'processing': 'badge-primary',
      'shipped': 'badge-success',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger',
      'in asteptare': 'badge-warning',
      'confirmat': 'badge-info',
      'anulat': 'badge-danger',
      'finalizat': 'badge-success'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const parseOrderItems = (itemsString) => {
    try {
      const items = JSON.parse(itemsString || '[]');
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  };

  const calculateOrderTotal = (items) => {
    try {
      const itemsArray = Array.isArray(items) ? items : parseOrderItems(items);
      return itemsArray.reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return total + (price * quantity);
      }, 0);
    } catch {
      return 0;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="orders-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
            <p className="mt-3">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="orders-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-danger">
              <h4>Error Loading Orders</h4>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchOrders}>
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-warning">
              <h4>🔒 Access Restricted</h4>
              <p>You must be logged in to view orders.</p>
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-primary">📦 My Orders</h2>
                <p className="text-muted">Track the status of your orders</p>
              </div>
              <button 
                className="btn btn-outline-primary"
                onClick={fetchOrders}
                title="Refresh"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  🛍️ Product Orders ({orders.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  🧼 Service Bookings ({serviceOrders.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Product Orders Tab */}
        {activeTab === 'products' && (
          <div className="tab-content">
            {orders.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-muted">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8L6 5H3m4 8v6a1 1 0 001 1h8a1 1 0 001-1v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="text-muted">No product orders yet</h4>
                <p className="text-muted">When you place your first order, it will appear here.</p>
                <Link to="/products" className="btn btn-primary">
                  🛍️ Browse Products
                </Link>
              </div>
            ) : (
              <div className="row">
                {orders.map((order) => {
                  const items = parseOrderItems(order.items);
                  const total = order.total || calculateOrderTotal(items);
                  
                  return (
                    <div key={order.id} className="col-lg-6 col-xl-4 mb-4">
                      <div className="card order-card h-100 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Order #{order.id}</h6>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        <div className="card-body">
                          {/* Order Info */}
                          <div className="order-info mb-3">
                            <p className="mb-1">
                              <strong>📅 Date:</strong> {formatDate(order.created_at)}
                            </p>
                            {order.tracking_number && (
                              <p className="mb-1">
                                <strong>📦 Tracking:</strong> 
                                <code className="ms-1">{order.tracking_number}</code>
                              </p>
                            )}
                          </div>
                          
                          {/* Products */}
                          <div className="products-list mb-3">
                            <h6 className="text-muted mb-2">📦 Products:</h6>
                            {items.length > 0 ? (
                              <div className="product-items">
                                {items.map((item, index) => (
                                  <div key={index} className="product-item d-flex justify-content-between align-items-center py-1">
                                    <div className="product-details">
                                      <small className="fw-bold">{item.name}</small>
                                      {item.eco_badge && (
                                        <span className="badge bg-success ms-1" style={{fontSize: '0.6em'}}>
                                          {item.eco_badge}
                                        </span>
                                      )}
                                      <br />
                                      <small className="text-muted">Quantity: {item.quantity || 1}</small>
                                    </div>
                                    <div className="product-price">
                                      <small className="text-success fw-bold">
                                        {((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)} RON
                                      </small>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <small className="text-muted">Could not load products</small>
                            )}
                          </div>
                          
                          {/* Total */}
                          <div className="order-total">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>Total:</strong>
                              <strong className="text-success">{parseFloat(total).toFixed(2)} RON</strong>
                            </div>
                          </div>
                          
                          {/* Status Timeline */}
                          <div className="status-timeline mt-3">
                            <div className="timeline-steps">
                              <div className={`timeline-step ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                                <span className="step-icon">📝</span>
                                <small>Placed</small>
                              </div>
                              <div className={`timeline-step ${['confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                                <span className="step-icon">✅</span>
                                <small>Confirmed</small>
                              </div>
                              <div className={`timeline-step ${['processing', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                                <span className="step-icon">⚙️</span>
                                <small>Processing</small>
                              </div>
                              <div className={`timeline-step ${['shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                                <span className="step-icon">🚚</span>
                                <small>Shipped</small>
                              </div>
                              <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                                <span className="step-icon">🎁</span>
                                <small>Delivered</small>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card-footer text-center">
                          {order.status === 'delivered' && (
                            <small className="text-success">
                              ✅ Order delivered successfully!
                            </small>
                          )}
                          {order.status === 'cancelled' && (
                            <small className="text-danger">
                              ❌ Order cancelled
                            </small>
                          )}
                          {['pending', 'confirmed', 'processing', 'shipped'].includes(order.status) && (
                            <small className="text-info">
                              ⏳ Order in progress
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Service Orders Tab */}
        {activeTab === 'services' && (
          <div className="tab-content">
            {serviceOrders.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-muted">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="text-muted">No service bookings yet</h4>
                <p className="text-muted">When you book your first service, it will appear here.</p>
                <Link to="/services" className="btn btn-primary">
                  🧼 Browse Services
                </Link>
              </div>
            ) : (
              <div className="row">
                {serviceOrders.map((booking) => (
                  <div key={booking.id} className="col-lg-6 col-xl-4 mb-4">
                    <div className="card service-card h-100 shadow-sm">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Booking #{booking.id}</h6>
                        <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      
                      <div className="card-body">
                        <div className="service-info">
                          <h6 className="text-primary">{booking.service_name || 'Unknown Service'}</h6>
                          
                          <div className="booking-details mt-3">
                            <p className="mb-1">
                              <strong>📅 Date:</strong> {booking.date}
                            </p>
                            <p className="mb-1">
                              <strong>🕐 Time:</strong> {booking.time}
                            </p>
                            <p className="mb-1">
                              <strong>📍 Address:</strong> {booking.address}
                            </p>
                            {booking.note && (
                              <p className="mb-1">
                                <strong>📝 Note:</strong> {booking.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer text-center">
                        <small className="text-muted">
                          Booked: {formatDate(booking.created_at)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>🚀 Quick Actions</h5>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <Link to="/products" className="btn btn-primary">
                    🛍️ Order Products
                  </Link>
                  <Link to="/services" className="btn btn-success">
                    🧼 Book Service
                  </Link>
                  <Link to="/contact" className="btn btn-outline-secondary">
                    📞 Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;