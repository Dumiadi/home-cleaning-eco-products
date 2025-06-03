import React, { useEffect, useState } from 'react';
import SalesChart from './SalesChart';

function Stats() {
  const [stats, setStats] = useState({ users: 0, orders: 0, services: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Eroare la preluarea statisticilor:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container">
      <h3 className="mb-4">📊 Statistici generale</h3>
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>👥 Utilizatori</h5>
              <p className="fs-4">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>🛒 Comenzi Produse</h5>
              <p className="fs-4">{stats.orders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>🧼 Programări</h5>
              <p className="fs-4">{stats.services}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>💰 Venit Total</h5>
              <p className="fs-4">{stats.revenue} RON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
  <SalesChart />
  
}

export default Stats;
