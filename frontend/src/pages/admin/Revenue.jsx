// frontend/src/pages/admin/Revenue.jsx - COMPLETE ENGLISH VERSION
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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
  Tooltip, 
  Legend
);

function Revenue() {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  
  const { token } = useAuth();

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💰 Fetching revenue data...');
      
      const response = await fetch('http://localhost:5000/api/admin/sales-monthly', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('💰 Revenue response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('💰 Revenue data received:', result);
        
        if (Array.isArray(result)) {
          setSalesData(result);
        } else {
          console.warn('⚠️ Revenue data is not an array:', result);
          setSalesData([]);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching revenue data:', error);
      setError(error.message);
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CALCULATE STATISTICS
  const totalRevenue = Array.isArray(salesData) 
    ? salesData.reduce((sum, item) => sum + parseFloat(item.total || 0), 0)
    : 0;

  const averageMonthly = salesData.length > 0 
    ? totalRevenue / salesData.length 
    : 0;

  const bestMonth = salesData.length > 0 
    ? salesData.reduce((best, current) => 
        parseFloat(current.total || 0) > parseFloat(best.total || 0) ? current : best, 
        salesData[0]
      )
    : null;

  // ✅ CHART DATA CONFIGURATION
  const chartData = {
    labels: Array.isArray(salesData) ? salesData.map(item => {
      // Format month from "2025-06" to "Jun 2025"
      try {
        const [year, month] = (item.month || '').split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
        return `${monthName} ${year}`;
      } catch {
        return item.month || 'N/A';
      }
    }) : [],
    datasets: [
      {
        label: 'Monthly Revenue (RON)',
        data: Array.isArray(salesData) ? salesData.map(item => parseFloat(item.total) || 0) : [],
        backgroundColor: chartType === 'bar' 
          ? 'rgba(25, 135, 84, 0.6)' 
          : 'rgba(25, 135, 84, 0.1)',
        borderColor: 'rgba(25, 135, 84, 1)',
        borderWidth: 2,
        borderRadius: chartType === 'bar' ? 8 : 0,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : 0,
        pointBackgroundColor: 'rgba(25, 135, 84, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 6 : 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Product Sales Revenue by Month',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ${context.parsed.y.toFixed(2)} RON`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toFixed(0) + ' RON';
          },
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>💰 Revenue Analytics</h2>
        </div>
        
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>💰 Revenue Analytics</h2>
        </div>
        
        <div className="alert alert-danger">
          <h5>❌ Error Loading Data</h5>
          <p className="mb-3">{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={fetchRevenueData}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(salesData) || salesData.length === 0) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>💰 Revenue Analytics</h2>
          <button 
            className="btn btn-outline-primary"
            onClick={fetchRevenueData}
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="alert alert-info text-center py-5">
          <div className="mb-3">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-info">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h5>📭 No Revenue Data</h5>
          <p className="mb-0">No orders found in the system to generate revenue charts.</p>
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
            <a href="/admin" className="text-decoration-none">
              🏠 Dashboard
            </a>
          </li>
          <li className="breadcrumb-item">
            <span className="text-muted">Reports</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            💰 Revenue Analytics
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          {/* ✅ BACK BUTTON */}
          <button 
            className="btn btn-outline-secondary"
            onClick={() => window.location.href = '/admin'}
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <h2 className="mb-0">💰 Revenue Analytics</h2>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${chartType === 'bar' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setChartType('bar')}
            >
              📊 Bar Chart
            </button>
            <button 
              className={`btn ${chartType === 'line' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setChartType('line')}
            >
              📈 Line Chart
            </button>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={fetchRevenueData}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ✅ STATISTICS CARDS */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-6 text-success mb-2">💰</div>
              <h6 className="card-title text-muted">Total Revenue</h6>
              <h4 className="text-success">{totalRevenue.toFixed(2)} RON</h4>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-6 text-info mb-2">📊</div>
              <h6 className="card-title text-muted">Average Monthly</h6>
              <h4 className="text-info">{averageMonthly.toFixed(2)} RON</h4>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-6 text-warning mb-2">🏆</div>
              <h6 className="card-title text-muted">Best Month</h6>
              <h4 className="text-warning">
                {bestMonth ? `${parseFloat(bestMonth.total).toFixed(2)} RON` : 'N/A'}
              </h4>
              {bestMonth && (
                <small className="text-muted">
                  {(() => {
                    try {
                      const [year, month] = bestMonth.month.split('-');
                      const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
                      return `${monthName} ${year}`;
                    } catch {
                      return bestMonth.month;
                    }
                  })()}
                </small>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-6 text-primary mb-2">📅</div>
              <h6 className="card-title text-muted">Months Tracked</h6>
              <h4 className="text-primary">{salesData.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ QUICK NAVIGATION */}
      <div className="card mb-4 bg-light border-0">
        <div className="card-body py-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted me-2">📋 Quick Access:</span>
            <a href="/admin" className="btn btn-sm btn-outline-primary">
              🏠 Dashboard
            </a>
            <a href="/admin/orders-products" className="btn btn-sm btn-outline-success">
              📦 Product Orders
            </a>
            <a href="/admin/products" className="btn btn-sm btn-outline-info">
              🛍️ Manage Products
            </a>
            <a href="/admin/users" className="btn btn-sm btn-outline-warning">
              👥 Users
            </a>
            <a href="/admin/analytics" className="btn btn-sm btn-outline-secondary">
              📊 Analytics
            </a>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CHART */}
      <div className="card shadow">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📈 Revenue Trends</h5>
            <span className="badge bg-success fs-6">
              {salesData.length} month{salesData.length !== 1 ? 's' : ''} of data
            </span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ height: '400px' }}>
            {chartType === 'bar' ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
          
          <div className="mt-4 text-center">
            <small className="text-muted">
              📊 Showing {salesData.length} month{salesData.length !== 1 ? 's' : ''} • 
              💰 Total Revenue: <strong>{totalRevenue.toFixed(2)} RON</strong> • 
              📈 Average: <strong>{averageMonthly.toFixed(2)} RON/month</strong>
            </small>
          </div>
        </div>
      </div>

      {/* ✅ DETAILED TABLE */}
      <div className="card mt-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">📋 Monthly Breakdown</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>📅 Month</th>
                  <th>💰 Revenue</th>
                  <th>📊 % of Total</th>
                  <th>📈 Growth</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item, index) => {
                  const revenue = parseFloat(item.total || 0);
                  const percentage = totalRevenue > 0 ? (revenue / totalRevenue * 100) : 0;
                  const previousRevenue = index > 0 ? parseFloat(salesData[index - 1].total || 0) : 0;
                  const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue * 100) : 0;

                  return (
                    <tr key={index}>
                      <td>
                        <strong>
                          {(() => {
                            try {
                              const [year, month] = item.month.split('-');
                              const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
                              return `${monthName} ${year}`;
                            } catch {
                              return item.month;
                            }
                          })()}
                        </strong>
                      </td>
                      <td>
                        <span className="text-success fw-bold">{revenue.toFixed(2)} RON</span>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td>
                        {index === 0 ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <span className={`fw-bold ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
                            {growth >= 0 ? '↗️' : '↘️'} {Math.abs(growth).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Revenue;