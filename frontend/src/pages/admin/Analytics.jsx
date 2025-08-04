// frontend/src/pages/admin/Analytics.jsx - COMPLETE ANALYTICS PAGE
import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  ArcElement,
  Tooltip, 
  Legend
);

function Analytics() {
  const [stats, setStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '30d', '7d'
  
  const { token } = useAuth();

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching analytics data...');
      
      // Fetch all data in parallel
      const [statsRes, salesRes, productsRes, usersRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5000/api/admin/sales-monthly', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5000/api/admin/orders/top-products', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5000/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      // Process responses
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesData(Array.isArray(salesData) ? salesData : []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(Array.isArray(productsData) ? productsData : []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }

      console.log('✅ Analytics data loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ PROCESS USER REGISTRATION DATA
  const processUserRegistrations = () => {
    const monthlySignups = {};
    
    users.forEach(user => {
      if (user.created_at) {
        try {
          const date = new Date(user.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
        } catch (error) {
          console.warn('Error parsing user date:', error);
        }
      }
    });

    return Object.entries(monthlySignups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // ✅ PROCESS ORDER STATUS DISTRIBUTION
  const processOrderStatus = () => {
    const statusCounts = {};
    
    orders.forEach(order => {
      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  };

  // ✅ CHART CONFIGURATIONS
  const userRegistrationsData = {
    labels: processUserRegistrations().map(item => {
      try {
        const [year, month] = item.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
        return `${monthName} ${year}`;
      } catch {
        return item.month;
      }
    }),
    datasets: [{
      label: 'New Users',
      data: processUserRegistrations().map(item => item.count),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      borderRadius: 6,
      tension: 0.4
    }]
  };

  const topProductsData = {
    labels: topProducts.slice(0, 5).map(p => p.name || 'Unknown Product'),
    datasets: [{
      label: 'Units Sold',
      data: topProducts.slice(0, 5).map(p => p.count || 0),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 2
    }]
  };

  const orderStatusData = {
    labels: processOrderStatus().map(item => {
      const statusLabels = {
        'pending': 'Pending',
        'processing': 'Processing', 
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };
      return statusLabels[item.status] || item.status;
    }),
    datasets: [{
      data: processOrderStatus().map(item => item.count),
      backgroundColor: [
        'rgba(255, 193, 7, 0.8)',
        'rgba(13, 202, 240, 0.8)', 
        'rgba(25, 135, 84, 0.8)',
        'rgba(220, 53, 69, 0.8)'
      ],
      borderColor: [
        'rgba(255, 193, 7, 1)',
        'rgba(13, 202, 240, 1)',
        'rgba(25, 135, 84, 1)', 
        'rgba(220, 53, 69, 1)'
      ],
      borderWidth: 2
    }]
  };

  const revenueData = {
    labels: salesData.map(item => {
      try {
        const [year, month] = (item.month || '').split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
        return `${monthName} ${year}`;
      } catch {
        return item.month || 'N/A';
      }
    }),
    datasets: [{
      label: 'Revenue (RON)',
      data: salesData.map(item => parseFloat(item.total) || 0),
      backgroundColor: 'rgba(25, 135, 84, 0.1)',
      borderColor: 'rgba(25, 135, 84, 1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(25, 135, 84, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    }]
  };

  // ✅ CHART OPTIONS
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading analytics...</span>
          </div>
          <p className="mt-3 text-muted">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h5>❌ Error Loading Analytics</h5>
          <p className="mb-3">{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchAllAnalytics}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* ✅ BREADCRUMB NAVIGATION */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/admin" className="text-decoration-none">🏠 Dashboard</a>
          </li>
          <li className="breadcrumb-item">
            <span className="text-muted">Reports</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            📊 Analytics
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => window.location.href = '/admin'}
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <h2 className="mb-0">📊 Business Analytics</h2>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${timeRange === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
            <button 
              className={`btn ${timeRange === '30d' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </button>
            <button 
              className={`btn ${timeRange === '7d' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </button>
          </div>
          <button 
            className="btn btn-outline-success"
            onClick={fetchAllAnalytics}
            title="Refresh all data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ✅ QUICK NAVIGATION */}
      <div className="card mb-4 bg-light border-0">
        <div className="card-body py-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted me-2">📋 Quick Access:</span>
            <a href="/admin" className="btn btn-sm btn-outline-primary">🏠 Dashboard</a>
            <a href="/admin/revenue" className="btn btn-sm btn-outline-success">💰 Revenue</a>
            <a href="/admin/orders-products" className="btn btn-sm btn-outline-info">📦 Orders</a>
            <a href="/admin/users" className="btn btn-sm btn-outline-warning">👥 Users</a>
            <a href="/admin/products" className="btn btn-sm btn-outline-secondary">🛍️ Products</a>
          </div>
        </div>
      </div>

      {/* ✅ KEY METRICS */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center h-100 border-primary">
            <div className="card-body">
              <div className="display-6 text-primary mb-2">👥</div>
              <h6 className="card-title text-muted">Total Users</h6>
              <h3 className="text-primary">{stats.users || 0}</h3>
              <small className="text-muted">
                {users.filter(u => {
                  const createdAt = new Date(u.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdAt >= thirtyDaysAgo;
                }).length} new this month
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100 border-success">
            <div className="card-body">
              <div className="display-6 text-success mb-2">📦</div>
              <h6 className="card-title text-muted">Total Orders</h6>
              <h3 className="text-success">{stats.orders || 0}</h3>
              <small className="text-muted">
                {orders.filter(o => {
                  const createdAt = new Date(o.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdAt >= thirtyDaysAgo;
                }).length} new this month
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100 border-warning">
            <div className="card-body">
              <div className="display-6 text-warning mb-2">🧼</div>
              <h6 className="card-title text-muted">Service Bookings</h6>
              <h3 className="text-warning">{stats.services || 0}</h3>
              <small className="text-muted">All time bookings</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100 border-info">
            <div className="card-body">
              <div className="display-6 text-info mb-2">💰</div>
              <h6 className="card-title text-muted">Total Revenue</h6>
              <h3 className="text-info">{(stats.revenue || 0).toFixed(2)} RON</h3>
              <small className="text-muted">From product sales</small>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CHARTS GRID */}
      <div className="row mb-4">
        {/* Revenue Trend */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">📈 Revenue Trend</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {salesData.length > 0 ? (
                  <Line data={revenueData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div className="text-center">
                      <div className="mb-2">📭</div>
                      <div>No revenue data available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">📊 Order Status</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {orders.length > 0 ? (
                  <Doughnut data={orderStatusData} options={doughnutOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div className="text-center">
                      <div className="mb-2">📭</div>
                      <div>No orders available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        {/* User Registrations */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">👥 User Registrations</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {processUserRegistrations().length > 0 ? (
                  <Bar data={userRegistrationsData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div className="text-center">
                      <div className="mb-2">👥</div>
                      <div>No user registration data</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">🏆 Top Products</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {topProducts.length > 0 ? (
                  <Pie data={topProductsData} options={doughnutOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div className="text-center">
                      <div className="mb-2">🛍️</div>
                      <div>No product sales data</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ DETAILED TABLES */}
      <div className="row">
        {/* Recent Orders Table */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📦 Recent Orders</h5>
              <a href="/admin/orders-products" className="btn btn-sm btn-outline-primary">
                View All
              </a>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order, index) => (
                      <tr key={index}>
                        <td><strong>#{order.id}</strong></td>
                        <td>{order.user_name || order.user_email || 'Guest'}</td>
                        <td className="text-success fw-bold">
                          {(() => {
                            let total = 0;
                            if (order.originalData?.total) {
                              total = parseFloat(order.originalData.total);
                            } else if (order.total) {
                              total = parseFloat(order.total);
                            }
                            return `${total.toFixed(2)} RON`;
                          })()}
                        </td>
                        <td>
                          <span className={`badge ${
                            order.status === 'pending' ? 'bg-warning' :
                            order.status === 'completed' ? 'bg-success' :
                            order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {orders.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <div className="mb-2">📭</div>
                    <div>No recent orders</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">💡 Key Insights</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">Most Popular Product</div>
                    <small className="text-muted">
                      {topProducts.length > 0 ? topProducts[0].name : 'No data'}
                    </small>
                  </div>
                  <span className="badge bg-primary rounded-pill">
                    {topProducts.length > 0 ? topProducts[0].count : 0}
                  </span>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">Average Order Value</div>
                    <small className="text-muted">Per order</small>
                  </div>
                  <span className="badge bg-success rounded-pill">
                    {orders.length > 0 
                      ? (salesData.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) / orders.length).toFixed(2)
                      : 0
                    } RON
                  </span>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">User Growth Rate</div>
                    <small className="text-muted">This month</small>
                  </div>
                  <span className="badge bg-info rounded-pill">
                    {(() => {
                      const thisMonth = users.filter(u => {
                        const createdAt = new Date(u.created_at);
                        const now = new Date();
                        return createdAt.getMonth() === now.getMonth() && 
                               createdAt.getFullYear() === now.getFullYear();
                      }).length;
                      return thisMonth > 0 ? `+${thisMonth}` : '0';
                    })()}
                  </span>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">Conversion Rate</div>
                    <small className="text-muted">Orders/Users</small>
                  </div>
                  <span className="badge bg-warning rounded-pill">
                    {stats.users > 0 ? ((stats.orders / stats.users) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;