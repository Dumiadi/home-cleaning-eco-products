import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import './UserDashboard.css';

import UserSidebar from './UserSidebar'; // ✔ sidebar modern
import UserSupport from './UserSupport';
import UserBookings from './UserBookings';
import UserOrders from './UserOrders';
import UserProfile from './UserProfile';

function UserDashboard() {
  return (
    <div className="user-dashboard d-flex">
      <UserSidebar /> {/* ✅ Sidebar compact, curat */}

      <main className="content flex-grow-1 p-4">
        <Routes>
          <Route path="" element={<div><h2>📊 Dashboard utilizator</h2></div>} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="support" element={<UserSupport />} />
          <Route path="profile" element={<UserProfile />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
}

export default UserDashboard;
