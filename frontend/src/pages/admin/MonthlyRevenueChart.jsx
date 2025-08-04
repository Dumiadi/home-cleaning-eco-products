// frontend/src/pages/admin/MonthlyRevenueChart.jsx - FIXED VERSION
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
import { useAuth } from '../../context/AuthContext'; // ✅ ADAUGĂ PENTRU TOKEN

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

function MonthlyRevenueChart() {
  const [data, setData] = useState([]); // ✅ INIȚIALIZEAZĂ CU ARRAY GOL
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useAuth(); // ✅ OBȚINE TOKEN PENTRU AUTENTIFICARE

  useEffect(() => {
    fetchRevenueData();
  }, [token]);

  const fetchRevenueData = async () => {
    if (!token) {
      setError('Nu ești autentificat');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching monthly revenue data...');
      
      // ✅ FIX: Endpoint corect conform rutelor admin
      const response = await fetch('http://localhost:5000/api/admin/sales-monthly', {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ ADAUGĂ TOKEN
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Revenue response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Revenue data received:', result);
        
        // ✅ VALIDEAZĂ DATELE
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.warn('⚠️ Revenue data is not an array:', result);
          setData([]); // Setează array gol dacă datele nu sunt valide
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching revenue data:', error);
      setError(error.message);
      setData([]); // ✅ SETEAZĂ ARRAY GOL ÎN CAZ DE EROARE
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ VERIFICĂ DACĂ DATELE SUNT ARRAY ÎNAINTE DE A FACE MAP
  const chartData = {
    labels: Array.isArray(data) ? data.map(item => item.month || 'N/A') : [],
    datasets: [
      {
        label: 'Venit lunar (RON)',
        data: Array.isArray(data) ? data.map(item => parseFloat(item.total) || 0) : [],
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.2)',
        tension: 0.3,
        fill: true,
        borderRadius: 6
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
        text: 'Venituri lunare din produse'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' RON';
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container my-5">
        <h4 className="mb-4">📊 Venituri lunare</h4>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="mt-2">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <h4 className="mb-4">📊 Venituri lunare</h4>
        <div className="alert alert-danger">
          <h6>❌ Eroare la încărcarea datelor</h6>
          <p className="mb-0">{error}</p>
          <button 
            className="btn btn-outline-danger btn-sm mt-2"
            onClick={fetchRevenueData}
          >
            🔄 Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  // Verifică dacă există date pentru afișare
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="container my-5">
        <h4 className="mb-4">📊 Venituri lunare</h4>
        <div className="alert alert-info">
          <h6>📭 Nu există date de venituri</h6>
          <p className="mb-0">Nu există comenzi în sistem pentru a genera graficul.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>📊 Venituri lunare</h4>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchRevenueData}
          title="Actualizează datele"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* ✅ INFORMAȚII SUPLIMENTARE */}
          <div className="mt-3 text-center">
            <small className="text-muted">
              Afișate {data.length} luni • 
              Total venituri: {data.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)} RON
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyRevenueChart;