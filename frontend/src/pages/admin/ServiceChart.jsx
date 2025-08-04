// frontend/src/pages/admin/ServiceChart.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

function ServiceChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchServiceChartData();
  }, [token]);

  const fetchServiceChartData = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin/service-orders/monthly-chart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📈 Service chart data received:', result);
        
        // ✅ ASIGURĂ-TE CĂ RESULT ESTE UN ARRAY
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.warn('API returned non-array data:', result);
          setData([]); // Fallback la array gol
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching service chart data:', error);
      setError(error.message);
      setData([]); // ✅ FALLBACK LA ARRAY GOL
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ VERIFICĂ CĂ DATA ESTE ARRAY ÎNAINTE DE MAP
  const safeData = Array.isArray(data) ? data : [];

  const chartData = {
    labels: safeData.length > 0 ? safeData.map(d => d.month || 'N/A') : ['Nu există date'],
    datasets: [
      {
        label: 'Programări lunare',
        data: safeData.length > 0 ? safeData.map(d => d.total || 0) : [0],
        borderColor: '#20c997',
        backgroundColor: 'rgba(32, 201, 151, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#20c997',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Programări servicii pe lună'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Luna'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Numărul de programări'
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (isLoading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Se încarcă graficul...</span>
          </div>
          <p className="mt-2 text-muted">Se încarcă datele graficului...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning text-center">
          <h6>⚠️ Eroare la încărcarea graficului</h6>
          <p className="mb-2">{error}</p>
          <button 
            className="btn btn-sm btn-outline-warning"
            onClick={fetchServiceChartData}
          >
            🔄 Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">📈 Programări lunare</h5>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={fetchServiceChartData}
            title="Actualizează graficul"
          >
            🔄
          </button>
        </div>
        <div className="card-body">
          {safeData.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18M8 17l4-4 4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h6 className="text-muted">Nu există date pentru grafic</h6>
              <p className="text-muted">Graficul va apărea când vor exista programări în sistem.</p>
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
        <div className="card-footer text-muted text-center">
          <small>
            📊 Total programări afișate: {safeData.reduce((sum, item) => sum + (item.total || 0), 0)}
            {safeData.length > 0 && (
              <span className="ms-3">
                📅 Perioada: {safeData.length} {safeData.length === 1 ? 'lună' : 'luni'}
              </span>
            )}
          </small>
        </div>
      </div>
    </div>
  );
}

export default ServiceChart;