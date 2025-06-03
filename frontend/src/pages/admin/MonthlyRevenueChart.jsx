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
import './MonthlyRevenueChart.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

function MonthlyRevenueChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/orders/monthly-revenue')
      .then(res => res.json())
      .then(setData);
  }, []);

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Venit lunar (RON)',
        data: data.map(d => d.total),
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="container monthly-revenue-container">
      <h4 className="mb-4">📈 Venituri Lunare din Produse</h4>
      <Line data={chartData} height={100} />
    </div>
  );
}

export default MonthlyRevenueChart;
