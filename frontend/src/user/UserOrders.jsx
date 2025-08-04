import React, { useState, useEffect, useCallback } from 'react';
import { Download, Mail, RefreshCw, Package, Calendar, DollarSign, Sparkles, Leaf, Droplets, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './UserOrders.css';

const ModernEcoOrders = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [emailingIds, setEmailingIds] = useState(new Set());
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // 🔄 FETCH ORDERS FROM API
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const ordersArray = Array.isArray(data) ? data : [];
        
        // 🔔 CHECK FOR NEW ORDERS AND NOTIFY
        if (lastOrderCount > 0 && ordersArray.length > lastOrderCount) {
          const newOrdersCount = ordersArray.length - lastOrderCount;
          toast.success(`🎉 ${newOrdersCount} comandă nouă adăugată!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        
        setOrders(ordersArray);
        setLastOrderCount(ordersArray.length);
     } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Error loading orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
        toast.error('Network error while loading orders');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, lastOrderCount]);

  // 🚀 INITIAL LOAD
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ⚡ AUTO-REFRESH EVERY 30 SECONDS TO CHECK FOR NEW ORDERS
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchOrders, isAuthenticated]);

  // 🔄 MANUAL REFRESH
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchOrders();
    toast.success('✅ Order list updated!');
  };

  // 📥 ENHANCED DOWNLOAD WITH REAL API
  const handleDownload = async (orderId) => {
    if (downloadingIds.has(orderId)) return;
    
    setDownloadingIds(prev => new Set([...prev, orderId]));
    
    try {
      const response = await fetch(`http://localhost:5000/api/invoice/pdf/${orderId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Eroare necunoscută' }));
        throw new Error(errorData.message || `Eroare server: ${response.status}`);
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Fișierul nu este un PDF valid');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Fișierul PDF este gol');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-eco-${orderId}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`✅ Factura #${orderId} descărcată cu succes!`);
      
    } catch (error) {
      console.error(`Error downloading invoice #${orderId}:`, error);
      toast.error(`❌ Eroare descărcare: ${error.message}`);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // 📧 ENHANCED EMAIL WITH REAL API
  const handleEmail = async (orderId) => {
    if (emailingIds.has(orderId)) return;
    
    setEmailingIds(prev => new Set([...prev, orderId]));
    
    try {
      const response = await fetch(`http://localhost:5000/api/invoice/pdf/${orderId}?sendEmail=true`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Eroare server: ${response.status}`);
      }
      
      toast.success(data.message || `✅ Email trimis cu succes pentru factura #${orderId}!`);
      
    } catch (error) {
      console.error(`Error sending email for #${orderId}:`, error);
      toast.error(`❌ Eroare email: ${error.message}`);
    } finally {
      setEmailingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // 🔐 AUTHENTICATION CHECK
  if (!isAuthenticated) {
    return (
      <div className="user-orders-wrapper">
        <div className="auth-required">
          <div className="auth-card">
            <div className="auth-icon">
              <Package size={32} color="white" />
            </div>
            <h3>Access Restricted</h3>
            <p>You must be authenticated to view your orders.</p>
            <button className="auth-btn">
              🔐 Log In
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="user-orders-wrapper">
      
      {/* Animated Background Elements */}
      <div className="floating-eco-icons">
        <div className="eco-bg-element"></div>
        <div className="eco-bg-element"></div>
        <div className="eco-bg-element"></div>
        
        {/* Floating Icons */}
        <div className="floating-icon"><Leaf size={24} /></div>
        <div className="floating-icon"><Droplets size={20} /></div>
        <div className="floating-icon"><Wind size={16} /></div>
        <div className="floating-icon"><Leaf size={24} /></div>
        <div className="floating-icon"><Droplets size={20} /></div>
        <div className="floating-icon"><Wind size={16} /></div>
      </div>

      <div className="orders-main-content">
        
        {/* Modern Header */}
        <div className="orders-header">
          <div className="orders-title-container">
            <div className="orders-logo-badge">
              <Package size={32} color="white" />
              <div className="orders-sparkle-badge">
                <Sparkles size={12} color="white" />
              </div>
            </div>
            
            <div>
              <h1 className="orders-main-title">
                  My Orders
              </h1>
              <p className="orders-subtitle">
               Hello, {user?.firstName || user?.name || 'Utilizator'}! 🌿 Eco Cleaning Platform
              </p>
            </div>
          </div>

          <div className="orders-controls">
            {/* 🔴 LIVE INDICATOR */}
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Live Updates</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="refresh-btn"
            >
              <RefreshCw size={20} className={`refresh-icon ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizare...' : 'Actualizează'}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3>Total Orders</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="stat-icon emerald">
                  <Package size={24} color="white" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3>Valoare Totală</h3>
                  <p>
                    {orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0).toFixed(2)} RON
                  </p>
                </div>
                <div className="stat-icon blue">
                  <DollarSign size={24} color="white" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3>Ultima Comandă</h3>
                  <p>
                    {orders[0] ? new Date(orders[0].created_at).toLocaleDateString('ro-RO') : 'N/A'}
                  </p>
                </div>
                <div className="stat-icon teal">
                  <Calendar size={24} color="white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-icon">
              <div className="loading-spinner-large"></div>
            </div>
            <h3>Se încarcă comenzile...</h3>
            <p>Te rugăm să aștepți</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={64} />
            </div>
            <h3>Nu ai nicio comandă</h3>
            <p>Comandă produse eco-friendly pentru a le vedea aici</p>
            <a href="/products" className="empty-state-btn" target="_blank" rel="noopener noreferrer">
              🛒 Vezi Produsele
            </a>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order, index) => (
              <div key={order.id} className="order-card">
                {/* Gradient Header */}
                <div className="order-header">
                  <div className="order-header-content">
                    <div>
                      <h3 className="order-title">Comandă #{order.id}</h3>
                      <p className="order-subtitle">Eco Cleaning Order</p>
                    </div>
                    <div className="order-status-badge">
                      ✅ Finalizată
                    </div>
                  </div>
                  
                  {/* Animated waves */}
                  <div className="order-header-wave">
                    <svg width="100%" height="16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,60 C300,100 900,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.1" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="order-body">
                  {/* Date and Total */}
                  <div className="order-details">
                    <div className="order-date-section">
                      <div className="date-icon-container">
                        <Calendar size={20} />
                      </div>
                      <div className="date-info">
                        <h4>Data comenzii</h4>
                        <p>
                          {new Date(order.created_at).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="order-total-section">
                      <h4>Total</h4>
                      <p className="order-total-amount">
                        {order.total} RON
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="products-section">
                    <h4>
                      <Package size={16} />
                      Produse Comandate
                    </h4>
                    <div className="products-list">
                      {(function() {
                        try {
                          const items = JSON.parse(order.items || '[]');
                          return items.map((item, i) => (
                            <div key={i} className="product-item">
                              <div className="product-info">
                                <div className="product-icon">
                                  <Leaf size={16} color="white" />
                                </div>
                                <div className="product-details">
                                  <h5>{item.name}</h5>
                                  <p>{item.quantity} buc × {item.price} RON</p>
                                </div>
                              </div>
                              <div className="product-price">
                                <span>{(item.quantity * parseFloat(item.price)).toFixed(2)} RON</span>
                              </div>
                            </div>
                          ));
                        } catch {
                          return (
                            <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '16px' }}>
                              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>❌ Eroare la afișarea produselor</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => handleDownload(order.id)}
                      disabled={downloadingIds.has(order.id)}
                      className="download-btn"
                    >
                      <div className="btn-content">
                        {downloadingIds.has(order.id) ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Download...</span>
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            <span>📥 Dowlnoad Factura PDF</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleEmail(order.id)}
                      disabled={emailingIds.has(order.id)}
                      className="email-btn"
                    >
                      <div className="btn-content">
                        {emailingIds.has(order.id) ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={20} />
                            <span>📧 Send to Email</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="order-footer">
                  <p>
                    Comandat la: {new Date(order.created_at).toLocaleString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernEcoOrders;