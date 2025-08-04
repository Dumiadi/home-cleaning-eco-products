// import React, { useEffect, useState } from 'react';
// import SalesChart from './SalesChart';

// function Stats() {
//   const [stats, setStats] = useState({ users: 0, orders: 0, services: 0, revenue: 0 });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch('http://localhost:5000/api/admin/stats');
//         const data = await res.json();
//         setStats(data);
//       } catch (err) {
//         console.error('Eroare la preluarea statisticilor:', err);
//       }
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div className="container">
//       <h3 className="mb-4">📊 Statistici generale</h3>
//       <div className="row">
//         <div className="col-md-3 mb-3">
//           <div className="card text-center shadow-sm">
//             <div className="card-body">
//               <h5>👥 Utilizatori</h5>
//               <p className="fs-4">{stats.users}</p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3 mb-3">
//           <div className="card text-center shadow-sm">
//             <div className="card-body">
//               <h5>🛒 Comenzi Produse</h5>
//               <p className="fs-4">{stats.orders}</p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3 mb-3">
//           <div className="card text-center shadow-sm">
//             <div className="card-body">
//               <h5>🧼 Programări</h5>
//               <p className="fs-4">{stats.services}</p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-3 mb-3">
//           <div className="card text-center shadow-sm">
//             <div className="card-body">
//               <h5>💰 Venit Total</h5>
//               <p className="fs-4">{stats.revenue} RON</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
    
//   );
//   <SalesChart />
  
// }

// export default Stats;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // ✅ IMPORT AUTHCONTEXT
import { toast } from 'react-toastify';
import SalesChart from './SalesChart';

function Stats() {
  const [stats, setStats] = useState({ 
    users: 0, 
    orders: 0, 
    services: 0, 
    revenue: 0 
  });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FOLOSEȘTE AUTHCONTEXT PENTRU TOKEN
  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      toast.error('Acces interzis - necesare permisiuni admin');
      return;
    }
    
    fetchStats();
  }, [isAuthenticated, user, token]);

  const fetchStats = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ ADAUGĂ TOKEN
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Eroare la încărcarea statisticilor');
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Eroare de rețea la încărcarea statisticilor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă statisticile...</span>
          </div>
          <p className="mt-2">Se încarcă statisticile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="mb-4">📊 Statistici generale</h3>
      
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="text-primary mb-2" style={{fontSize: '2rem'}}>👥</div>
              <h5>Utilizatori</h5>
              <p className="fs-4 text-primary">{stats.users}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="text-success mb-2" style={{fontSize: '2rem'}}>🛒</div>
              <h5>Comenzi Produse</h5>
              <p className="fs-4 text-success">{stats.orders}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="text-info mb-2" style={{fontSize: '2rem'}}>🧼</div>
              <h5>Programări</h5>
              <p className="fs-4 text-info">{stats.services}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <div className="text-warning mb-2" style={{fontSize: '2rem'}}>💰</div>
              <h5>Venit Total</h5>
              <p className="fs-4 text-warning">{stats.revenue} RON</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grafice */}
      <SalesChart />
    </div>
  );
}

export default Stats;