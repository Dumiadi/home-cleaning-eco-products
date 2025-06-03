import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Users from './Users';
import OrdersProducts from './OrdersProducts';
import OrdersServices from './OrdersServices';
import Stats from './Stats';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-grow-1 p-3">
        {/* Mobile toggle */}
        <button className="btn btn-outline-secondary d-md-none mb-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰ Meniu
        </button>

        <Routes>
          <Route path="/" element={<Stats />} />
          <Route path="users" element={<Users />} />
          <Route path="orders-products" element={<OrdersProducts />} />
          <Route path="orders-services" element={<OrdersServices />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
