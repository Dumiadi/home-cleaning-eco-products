
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import './TopProductsChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function TopProductsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/orders/top-products')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const chartData = {
    labels: data.map(p => p.name),
    datasets: [{
      label: 'Vânzări (bucăți)',
      data: data.map(p => p.count),
      backgroundColor: 'rgba(255, 193, 7, 0.7)',
      borderRadius: 6
    }]
  };

  return (
    <div className="container top-products-container">
      <h4 className="mb-3">🏆 Top 10 Produse Vândute</h4>
      <Bar data={chartData} height={100} />
    </div>
  );
}

export default TopProductsChart;
