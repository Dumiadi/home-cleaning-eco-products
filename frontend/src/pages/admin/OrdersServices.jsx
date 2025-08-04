// import React, { useEffect, useState } from 'react';
// import './OrdersServices.css';
// import ServiceChart from './ServiceChart';

// function OrdersServices() {
//   const [services, setServices] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState('');
//   const [filterStatus, setFilterStatus] = useState('Toate');

//   // Fetch programări
//   useEffect(() => {
//     fetch('http://localhost:5000/api/admin/service-orders')
//       .then(res => res.json())
//       .then(data => {
//         setServices(data);
//         setFiltered(data);
//       })
//       .catch(err => console.error('Eroare programări:', err));
//   }, []);

//   // Filtrare live
//   useEffect(() => {
//     let result = services;

//     if (search) {
//       const s = search.toLowerCase();
//       result = result.filter(order =>
//         order.service_name?.toLowerCase().includes(s) ||
//         order.user_email?.toLowerCase().includes(s) ||
//         order.address?.toLowerCase().includes(s)
//       );
//     }

//     if (filterStatus !== 'Toate') {
//       result = result.filter(order => order.status === filterStatus);
//     }

//     setFiltered(result);
//   }, [search, filterStatus, services]);

//   // Modificare status
//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       });

//       const updated = services.map(item =>
//         item.id === id ? { ...item, status: newStatus } : item
//       );
//       setServices(updated);
//     } catch (err) {
//       console.error('Eroare actualizare status:', err);
//     }
//   };

//   // Ștergere programare
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm('Sigur vrei să ștergi această programare?');
//     if (!confirmDelete) return;

//     try {
//       await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
//         method: 'DELETE'
//       });

//       setServices(prev => prev.filter(order => order.id !== id));
//     } catch (err) {
//       console.error('Eroare la ștergere:', err);
//     }
//   };

//   return (
//     <div className="container orders-container">
//       <h3 className="mb-4">🧼 Programări Servicii</h3>

//       {/* Export Excel */}
//       <a
//         href="http://localhost:5000/api/admin/service-orders/export"
//         className="btn btn-success mb-4"
//         download
//       >
//         ⬇️ Exportă în Excel
//       </a>

//       {/* Căutare + Filtru */}
//       <div className="row mb-4">
//         <div className="col-md-6">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Caută după serviciu, email sau adresă..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//         <div className="col-md-3">
//           <select
//             className="form-select"
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option>Toate</option>
//             <option>În așteptare</option>
//             <option>Confirmat</option>
//             <option>Anulat</option>
//             <option>Finalizat</option>
//           </select>
//         </div>
//       </div>

//       {/* Lista programări */}
//       {filtered.length === 0 ? (
//         <p>Nu există programări potrivite.</p>
//       ) : (
//         filtered.map((order) => (
//           <div key={order.id} className="card mb-3">
//             <div className="card-body">
//               <p><strong>Serviciu:</strong> {order.service_name}</p>
//               <p><strong>Data:</strong> {order.date} la {order.time}</p>
//               <p><strong>Adresă:</strong> {order.address}</p>
//               <p><strong>User:</strong> {order.user_email || 'Anonim'}</p>

//               <div className="d-flex align-items-center mb-2">
//                 <strong className="me-2">Status:</strong>
//                 <select
//                   className="form-select form-select-sm w-auto"
//                   value={order.status}
//                   onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                 >
//                   <option value="În așteptare">În așteptare</option>
//                   <option value="Confirmat">Confirmat</option>
//                   <option value="Anulat">Anulat</option>
//                   <option value="Finalizat">Finalizat</option>
//                 </select>
//               </div>

//               <button
//                 className="btn btn-sm btn-outline-danger"
//                 onClick={() => handleDelete(order.id)}
//               >
//                 🗑️ Șterge programarea
//               </button>
//             </div>
//           </div>
//         ))
//       )}

//       {/* Grafic programări lunare */}
//       <ServiceChart />
//     </div>
//   );
// }

// export default OrdersServices;
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // ✅ IMPORT AUTHCONTEXT
import './OrdersServices.css';
import ServiceChart from './ServiceChart';

function OrdersServices() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Toate');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FOLOSEȘTE AUTHCONTEXT PENTRU TOKEN
  const { token, user, isAuthenticated } = useAuth();

  // ✅ VERIFICĂ AUTENTIFICAREA ȘI ROLUL
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      toast.error('Acces interzis - necesare permisiuni admin');
      window.location.href = '/';
      return;
    }
    
    fetchServices();
  }, [isAuthenticated, user, token]);

  // Fetch programări cu autentificare
  const fetchServices = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/service-orders', {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ ADAUGĂ TOKEN
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
        setFiltered(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        toast.error('Eroare la încărcarea programărilor');
        setServices([]);
        setFiltered([]);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
      toast.error('Eroare de rețea la încărcarea programărilor');
      setServices([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrare live
  useEffect(() => {
    let result = services;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(order =>
        order.service_name?.toLowerCase().includes(s) ||
        order.user_email?.toLowerCase().includes(s) ||
        order.address?.toLowerCase().includes(s) ||
        order.user_name?.toLowerCase().includes(s)
      );
    }

    if (filterStatus !== 'Toate') {
      result = result.filter(order => order.status === filterStatus);
    }

    setFiltered(result);
  }, [search, filterStatus, services]);

  // Modificare status cu autentificare
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ ADAUGĂ TOKEN
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updated = services.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        );
        setServices(updated);
        toast.success(`✅ Status actualizat la: ${newStatus}`);
      } else {
        toast.error('Eroare la actualizarea statusului');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Eroare de rețea la actualizarea statusului');
    }
  };

  // Ștergere programare cu autentificare
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi această programare?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/service-orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // ✅ ADAUGĂ TOKEN
        }
      });

      if (response.ok) {
        setServices(prev => prev.filter(order => order.id !== id));
        toast.success('✅ Programare ștearsă cu succes');
      } else {
        toast.error('Eroare la ștergerea programării');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Eroare de rețea la ștergerea programării');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'în asteptare':
      case 'În așteptare':
        return 'bg-warning text-dark';
      case 'confirmat':
      case 'Confirmat':
        return 'bg-success';
      case 'anulat':
      case 'Anulat':
        return 'bg-danger';
      case 'finalizat':
      case 'Finalizat':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă programările...</span>
          </div>
          <p className="mt-2">Se încarcă programările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🧼 Programări Servicii</h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={fetchServices}
            title="Actualizează lista"
          >
            🔄 Actualizează
          </button>
          <a
            href={`http://localhost:5000/api/admin/service-orders/export?token=${token}`}
            className="btn btn-success btn-sm"
            download
          >
            ⬇️ Export Excel
          </a>
        </div>
      </div>

      {/* ✅ STATISTICI RAPIDE */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Total programări</h6>
              <h4 className="text-primary">{services.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">În așteptare</h6>
              <h4 className="text-warning">
                {services.filter(s => s.status === 'în asteptare' || s.status === 'În așteptare').length}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Confirmate</h6>
              <h4 className="text-success">
                {services.filter(s => s.status === 'confirmat' || s.status === 'Confirmat').length}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Finalizate</h6>
              <h4 className="text-primary">
                {services.filter(s => s.status === 'finalizat' || s.status === 'Finalizat').length}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Căutare + Filtru */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Caută după serviciu, email, nume sau adresă..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>Toate</option>
            <option>în asteptare</option>
            <option>În așteptare</option>
            <option>confirmat</option>
            <option>Confirmat</option>
            <option>anulat</option>
            <option>Anulat</option>
            <option>finalizat</option>
            <option>Finalizat</option>
          </select>
        </div>
        <div className="col-md-3">
          <span className="form-control-plaintext">
            <strong>Afișate: {filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Lista programări */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="text-muted mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h6 className="text-muted">Nu există programări</h6>
            <p className="text-muted">
              {search || filterStatus !== 'Toate' 
                ? 'Nu există programări care să corespundă filtrelor aplicate.' 
                : 'Nu există programări în sistem.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="row">
          {filtered.map((order) => (
            <div key={order.id} className="col-lg-6 col-xl-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">#{order.id}</h6>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    {order.service_name || 'Serviciu necunoscut'}
                  </h6>
                  
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>📅 Data:</strong> {order.date}
                    </p>
                    <p className="mb-1">
                      <strong>⏰ Ora:</strong> {order.time}
                    </p>
                    <p className="mb-1">
                      <strong>📍 Adresă:</strong> {order.address}
                    </p>
                    <p className="mb-1">
                      <strong>👤 Client:</strong> {order.user_name || order.user_email || 'Anonim'}
                    </p>
                    {order.user_email && order.user_name && (
                      <p className="mb-1">
                        <strong>📧 Email:</strong> {order.user_email}
                      </p>
                    )}
                    {order.note && (
                      <p className="mb-1">
                        <strong>📝 Notă:</strong> {order.note}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label"><strong>Actualizează status:</strong></label>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="în asteptare">În așteptare</option>
                      <option value="confirmat">Confirmat</option>
                      <option value="anulat">Anulat</option>
                      <option value="finalizat">Finalizat</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-outline-danger btn-sm w-100"
                    onClick={() => handleDelete(order.id)}
                  >
                    🗑️ Șterge programarea
                  </button>
                </div>
                
                <div className="card-footer text-muted text-center">
                  <small>
                    Creată: {new Date(order.created_at).toLocaleDateString('ro-RO')}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grafic programări lunare */}
      <div className="mt-5">
        <ServiceChart />
      </div>
    </div>
  );
}

export default OrdersServices;