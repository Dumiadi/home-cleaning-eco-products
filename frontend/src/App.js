import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Confirmare from './pages/Confirmare';
import TopProducts from './pages/TopProducts';
import ProductGallery from './components/ProductGallery';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetRequest from './pages/auth/ResetRequest';
import ResetForm from './pages/auth/ResetForm';
import Booking from './pages/Booking';
import LoginSuccess from './pages/auth/LoginSucces';
import UserDashboard from './user/UserDashboard';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminServices from './pages/admin/AdminServices';
import Revenue from './pages/admin/Revenue';
import Users from './pages/admin/Users';
import OrdersProducts from './pages/admin/OrdersProducts';
import OrdersServices from './pages/admin/OrdersServices';

// Protecție
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

// Extra
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/LoadingSpinner';

function AppWrapper() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.user?.role === 'admin';

  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedMode);
    document.body.classList.toggle('dark-mode', storedMode);
    document.body.classList.toggle('light-mode', !storedMode);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <CartProvider>
      <ToastContainer position="top-right" autoClose={2000} />
      {loading && <LoadingSpinner />}

      <Routes>

        {/* 👥 Utilizator */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/confirmare" element={<RequireAuth><Confirmare /></RequireAuth>} />
          <Route path="/top-produse" element={<TopProducts />} />
          <Route path="/galerie" element={<ProductGallery />} />

          {/* Auth pages cu redirect dacă e logat */}
          <Route path="/login" element={user ? <Navigate to={isAdmin ? "/admin/dashboard" : "/account"} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/account" /> : <Register />} />

          <Route path="/resetare" element={<ResetForm />} />
          <Route path="/resetare-cont" element={<ResetRequest />} />
          <Route path="/login-success" element={<LoginSuccess />} />

          <Route path="/account/*" element={<RequireAuth><UserDashboard /></RequireAuth>} />
        </Route>

        {/* 🛠️ Admin */}
        <Route
          path="/admin/dashboard/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="orders-products" element={<OrdersProducts />} />
          <Route path="orders-services" element={<OrdersServices />} />
        </Route>

        <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
        <Route path="/admin/services" element={<RequireAdmin><AdminServices /></RequireAdmin>} />
        <Route path="/admin/revenue" element={<RequireAdmin><Revenue /></RequireAdmin>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
