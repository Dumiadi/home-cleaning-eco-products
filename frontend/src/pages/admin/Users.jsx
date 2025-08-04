// frontend/src/pages/admin/Users.jsx - UPDATED cu funcționalitate de editare
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import UserEditModal from '../../pages/admin/UserEditModal'; // ✅ IMPORT MODAL

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Toate');
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ STATE PENTRU MODAL
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { token, user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
        setFilteredUsers(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        toast.error('Eroare la încărcarea utilizatorilor');
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Eroare de rețea la încărcarea utilizatorilor');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrare live
  useEffect(() => {
    let result = users;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.id?.toString().includes(s)
      );
    }

    if (roleFilter !== 'Toate') {
      result = result.filter(u => u.role === roleFilter.toLowerCase());
    }

    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  // ✅ FUNCȚII PENTRU MODAL
  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser) => {
    if (updatedUser) {
      // Actualizează utilizatorul în listă
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
      // Reîncarcă lista (pentru ștergere)
      fetchUsers();
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'user':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return '👑 Administrator';
      case 'user':
        return '👤 Utilizator';
      default:
        return '❓ Necunoscut';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'active':
        return '✅ Activ';
      case 'inactive':
        return '❌ Inactiv';
      default:
        return '❓ Necunoscut';
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă utilizatorii...</span>
          </div>
          <p className="mt-2">Se încarcă utilizatorii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👥 Utilizatori</h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={fetchUsers}
            title="Actualizează lista"
          >
            🔄 Actualizează
          </button>
          <a
            href={`http://localhost:5000/api/admin/users/export?token=${token}`}
            className="btn btn-success btn-sm"
            download
          >
            ⬇️ Export Excel
          </a>
        </div>
      </div>

      {/* Statistici rapide */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Total utilizatori</h6>
              <h4 className="text-primary">{users.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Administratori</h6>
              <h4 className="text-danger">
                {users.filter(u => u.role === 'admin').length}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="text-muted">Utilizatori normali</h6>
              <h4 className="text-success">
                {users.filter(u => u.role === 'user').length}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Caută după nume, email sau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>Toate</option>
            <option>admin</option>
            <option>user</option>
          </select>
        </div>
        <div className="col-md-3">
          <span className="form-control-plaintext">
            <strong>Afișați: {filteredUsers.length}</strong>
          </span>
        </div>
      </div>

      {/* Lista utilizatori */}
      {filteredUsers.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="text-muted mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h6 className="text-muted">Nu există utilizatori</h6>
            <p className="text-muted">
              {search || roleFilter !== 'Toate' 
                ? 'Nu există utilizatori care să corespundă filtrelor aplicate.' 
                : 'Nu există utilizatori în sistem.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">📋 Lista utilizatori</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Avatar</th>
                  <th>Nume</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Status</th>
                  <th>Înregistrat la</th>
                  <th className="text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <code>#{u.id}</code>
                    </td>
                    <td>
                      {u.avatar ? (
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="rounded-circle"
                          width="32"
                          height="32"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{u.name || 'Nume lipsă'}</strong>
                      {u.id === user.id && (
                        <span className="badge bg-info ms-2">Tu</span>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(u.status)}`}>
                        {getStatusDisplayName(u.status)}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(u.created_at)}
                      </small>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary" 
                          title="Editează utilizatorul"
                          onClick={() => handleEditUser(u)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-outline-info" 
                          title="Vezi detalii"
                          onClick={() => {
                            // TODO: Implementează modal cu detalii utilizator
                            toast.info(`Detalii pentru: ${u.name} (${u.email})`);
                          }}
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length > 50 && (
            <div className="card-footer text-center">
              <small className="text-muted">
                💡 Sugestie: Pentru mai mult de 50 utilizatori, implementează paginarea
              </small>
            </div>
          )}
        </div>
      )}

      {/* ✅ MODAL DE EDITARE */}
      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default Users;