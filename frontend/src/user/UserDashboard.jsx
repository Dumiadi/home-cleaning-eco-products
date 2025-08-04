// ======================
// UserDashboard.js
// ======================

import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

import UserSidebar from './UserSidebar';
import UserSupport from './UserSupport';
import UserBookings from './UserBookings';
import UserOrders from './UserOrders';
import UserProfile from './UserProfile';

function UserDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          <h4>Access Restricted</h4>
          <p>You must be authenticated to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard d-flex">
      <UserSidebar />

      <main className="content flex-grow-1 p-4">
        <Routes>
          <Route
            path=""
            element={
              <div>
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <div>
                    <h2>👋 Welcome back, {user.name?.split(' ')[0] || 'User'}!</h2>
                    <p className="text-muted mb-0">
                      Manage your orders, bookings, and profile from your personal dashboard.
                    </p>
                  </div>
                  <div className="col-auto ms-auto text-end">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="rounded-circle"
                        width="60"
                        height="60"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="row mt-4 mb-5">
                  <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-primary mb-2" style={{ fontSize: '2rem' }}>📦</div>
                        <h5>Product Orders</h5>
                        <p className="text-muted mb-0">View your order history and tracking</p>
                        <a href="/account/orders" className="btn btn-outline-primary btn-sm mt-2">
                          View Orders
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-success mb-2" style={{ fontSize: '2rem' }}>🧼</div>
                        <h5>Service Bookings</h5>
                        <p className="text-muted mb-0">Manage your scheduled cleaning services</p>
                        <a href="/account/bookings" className="btn btn-outline-success btn-sm mt-2">
                          View Bookings
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-info mb-2" style={{ fontSize: '2rem' }}>👤</div>
                        <h5>My Profile</h5>
                        <p className="text-muted mb-0">Update your personal information</p>
                        <a href="/account/profile" className="btn btn-outline-info btn-sm mt-2">
                          Edit Profile
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header">
                        <h6 className="mb-0">🔄 Recent Activity</h6>
                      </div>
                      <div className="card-body">
                        <p className="text-muted">
                          To view recent activity, navigate to the corresponding sections.
                        </p>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          <a href="/services" className="btn btn-primary btn-sm w-100 w-sm-auto">
                            📅 Book a Service
                          </a>
                          <a href="/products" className="btn btn-success btn-sm w-100 w-sm-auto">
                            🛒 Order Eco Products
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

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
