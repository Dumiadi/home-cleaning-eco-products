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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/sales-monthly')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Eroare la grafic:', err));
  }, []);

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Vânzări lunare (RON)',
        data: data.map(item => item.total),
        backgroundColor: 'rgba(25, 135, 84, 0.6)',
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="container my-5">
      <h4 className="mb-4">📊 Vânzări lunare</h4>
      <Bar data={chartData} height={100} />
    </div>
  );
}

export default SalesChart;
