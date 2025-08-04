import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../pages/admin/AdminSidebar';
import AdminBreadcrumb from '../components/AdminBreadcrumb';  
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout d-flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-grow-1 p-3 admin-content">
        <button
          className="btn btn-outline-secondary d-md-none mb-3"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰ Meniu
        </button>

        <AdminBreadcrumb />  

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
