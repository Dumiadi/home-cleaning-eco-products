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

function ServiceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/service-orders/monthly-chart')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Programări/lună',
      data: data.map(d => d.total),
      backgroundColor: 'rgba(13, 202, 240, 0.6)',
      borderRadius: 6
    }]
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-3">📈 Programări lunare</h4>
      <Bar data={chartData} />
    </div>
  );
}

export default ServiceChart;
