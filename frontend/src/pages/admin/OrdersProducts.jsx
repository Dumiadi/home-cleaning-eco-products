// frontend/src/components/admin/AdminOrders.jsx - COMPLETE EMAIL & EXPORT SOLUTION
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './OrdersProducts.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { token } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ FETCH ORDERS FROM BACKEND
  const fetchOrders = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      console.log('📦 Fetching orders for admin...');
      
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Orders fetched:', data.length);
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Failed to fetch orders:', response.status);
        toast.error('Eroare la încărcarea comenzilor');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Eroare de conexiune la server');
    } finally {
      setIsLoading(false);
    }
  };
const handleStatusChange = async (orderId, newStatus) => {
  try {
    const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // dacă folosești auth
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(`Order status changed to ${newStatus}`);
      fetchOrders(); // reîncarcă lista
    } else {
      toast.error(data.error || 'Failed to update status');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error updating status');
  }
};

  // ✅ UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!token) {
      toast.error('Nu ești autentificat');
      return;
    }

    setStatusLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status updated successfully');
        toast.success(`Status comandă #${orderId} actualizat cu succes`);
        
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === parseInt(orderId) 
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        console.error('❌ Status update failed:', result);
        toast.error(result.error || 'Eroare la actualizarea statusului');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error('Eroare de conexiune la server');
    } finally {
      setStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // ✅ SEND CONFIRMATION EMAIL
  const sendConfirmationEmail = async (orderId, emailType = 'confirmed') => {
    if (!token) {
      toast.error('Nu ești autentificat');
      return;
    }

    setEmailLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      console.log(`📧 Sending ${emailType} email for order ${orderId}`);
      
      // Method 1: Direct function call
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailType: emailType })
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, try text
        const textResult = await response.text();
        console.log('📧 Email response (text):', textResult);
        result = { success: response.ok, message: textResult };
      }

      if (response.ok && result.success !== false) {
        console.log('✅ Email sent successfully:', result);
        toast.success(`📧 Email de ${emailType} trimis cu succes!`);
        
        // Optional: Update order status to reflect email was sent
        if (emailType === 'confirmed') {
          updateOrderStatus(orderId, 'confirmed');
        }
      } else {
        console.error('❌ Email sending failed:', result);
        toast.error(result.message || result.error || 'Eroare la trimiterea email-ului');
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      toast.error(`Eroare la trimiterea email-ului: ${error.message}`);
    } finally {
      setEmailLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // ✅ EXPORT TO EXCEL
  const exportToExcel = async () => {
    if (!token) {
      toast.error('Nu ești autentificat');
      return;
    }

    setExportLoading(true);
    
    try {
      console.log('📊 Starting Excel export...');
      
      const response = await fetch('http://localhost:5000/api/admin/orders/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        link.download = `comenzi_produse_${currentDate}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Excel export completed');
        toast.success('📊 Export în Excel reușit!');
      } else {
        const errorText = await response.text();
        console.error('❌ Export failed:', errorText);
        toast.error('Eroare la exportul în Excel');
      }
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      toast.error(`Eroare la export: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // ✅ HELPER FUNCTIONS
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info', 
      'processing': 'badge-primary',
      'shipped': 'badge-success',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const parseOrderItems = (itemsString) => {
    try {
      if (!itemsString) return [];
      const items = JSON.parse(itemsString);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.warn('Error parsing order items:', error);
      return [];
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('ro-RO');
    } catch {
      return dateString;
    }
  };

  // ✅ FILTER ORDERS
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All Statuses' || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  // ✅ CALCULATE STATISTICS
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="admin-section">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      
      {/* Header with Statistics */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary">📦 Product Orders</h3>
          <p className="text-muted">Welcome, Administrator!</p>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={fetchOrders}
            title="Refresh"
          >
            🔄 Refresh
          </button>
          
          {/* ✅ EXPORT EXCEL BUTTON */}
          <button 
            className="btn btn-success"
            onClick={exportToExcel}
            disabled={exportLoading || orders.length === 0}
            title="Export to Excel"
          >
            {exportLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Exporting...
              </>
            ) : (
              <>
                📊 Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-primary">{stats.total}</h5>
              <small>Total Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-warning">{stats.pending}</h5>
              <small>Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-info">{stats.confirmed}</h5>
              <small>Confirmed</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-primary">{stats.processing}</h5>
              <small>Processing</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-success">{stats.shipped}</h5>
              <small>Shipped</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-success">{stats.totalRevenue.toFixed(2)} RON</h5>
              <small>Total Revenue</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by email, name, order ID, tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="text-muted">
            Showing: {filteredOrders.length}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders found</h4>
          <p className="text-muted">
            {orders.length === 0 
              ? 'There are no orders in the system yet.' 
              : 'No orders match your current filters.'
            }
          </p>
        </div>
      ) : (
        <div className="row">
          {filteredOrders.map((order) => {
            const items = parseOrderItems(order.items);
            const isEmailLoading = emailLoading[order.id];
            const isStatusLoading = statusLoading[order.id];
            
            return (
              <div key={order.id} className="col-lg-6 mb-4">
                <div className="card">
                  
                  {/* Card Header */}
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Order #{order.id}</h6>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  {/* Card Body */}
                  <div className="card-body">
                    
                    {/* Customer Info */}
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>👤 Customer:</strong> {order.user_name || 'Andrei Dumitrascu'}
                      </p>
                      <p className="mb-1">
                        <strong>📧 Email:</strong> {order.user_email || 'admin@curatenie.ro'}
                      </p>
                      <p className="mb-1">
                        <strong>📞 Phone:</strong> {order.user_phone || 'Pitesti'}
                      </p>
                      <p className="mb-1">
                        <strong>📍 Address:</strong> {order.user_address || 'ECO-1751393031655'}
                      </p>
                      <p className="mb-1">
                        <strong>🆔 Tracking:</strong> 
                        <code className="ms-1">{order.tracking_number || `ECO-${order.id}`}</code>
                      </p>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mb-3">
                      <h6 className="text-muted">📦 Ordered Products:</h6>
                      {items.length > 0 ? (
                        <div className="order-items">
                          {items.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-1">
                              <div>
                                <strong>{item.name || 'Unknown Product'}</strong>
                                <br />
                                <small className="text-muted">
                                  Quantity: {item.quantity || 1} × {item.price || 0} RON
                                </small>
                              </div>
                              <span className="text-success fw-bold">
                                {((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)} RON
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-3 text-muted">
                          Could not load products
                        </div>
                      )}
                      
                      {/* Total */}
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <strong>Total: {parseFloat(order.total || 0).toFixed(2)} RON</strong>
                        <span className="badge bg-success">0 items</span>
                      </div>
                    </div>
                    
                    {/* Order Date */}
                    <p className="mb-3">
                      <strong>📅 Order Date:</strong> {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  {/* Card Footer - Action Buttons */}
                  <div className="card-footer">
                    <div className="d-flex gap-2 flex-wrap">
                      
                      {/* ✅ STATUS UPDATE BUTTONS */}
                      {order.status === 'pending' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          disabled={isStatusLoading}
                        >
                          {isStatusLoading ? (
                            <span className="spinner-border spinner-border-sm me-1" />
                          ) : (
                            '⚙️'
                          )}
                          Processing
                        </button>
                      )}
                      
                      {/* ✅ CONFIRMATION EMAIL BUTTON */}
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => sendConfirmationEmail(order.id, 'confirmed')}
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Sending...
                          </>
                        ) : (
                          <>
                            📧 Confirmation Email
                          </>
                        )}
                      </button>
                      
                      {/* ✅ CANCEL ORDER BUTTON */}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={isStatusLoading}
                        >
                          ❌ Cancel Order
                        </button>
                      )}
                      
                      {/* ✅ ADDITIONAL EMAIL TYPES */}
                      {order.status === 'processing' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => sendConfirmationEmail(order.id, 'shipped')}
                          disabled={isEmailLoading}
                        >
                          📦 Shipped Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;