// frontend/src/App.js
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';

// Context Providers
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ServiceBookingProvider } from './context/ServicesContext';

// Layouts & Pages
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/LoadingSpinner';

// 🔐 Route protection
import RequireAuth, { RequireAdmin, RequireUser } from './components/RequireAuth';


// Lazy-loaded
const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const Products = React.lazy(() => import('./pages/Products'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Confirmare = React.lazy(() => import('./pages/Confirmare'));
const TopProducts = React.lazy(() => import('./pages/TopProducts'));
const ProductGallery = React.lazy(() => import('./components/ProductGallery'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ResetRequest = React.lazy(() => import('./pages/auth/ResetRequest'));
const ResetForm = React.lazy(() => import('./pages/auth/ResetForm'));
const LoginSuccess = React.lazy(() => import('./pages/auth/LoginSuccess'));
const UserDashboard = React.lazy(() => import('./user/UserDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminServices = React.lazy(() => import('./pages/admin/AdminServices'));
const Revenue = React.lazy(() => import('./pages/admin/Revenue'));

// 🔁 Auto redirect după login în funcție de rol
const AuthRedirectHandler = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/account';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <ThemeProvider>
      <ServiceBookingProvider>
        <CartProvider>
          <ToastContainer autoClose={3000} />
          {loading && <LoadingSpinner />}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* 👤 USER ROUTES */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/booking" element={<Navigate to="/services" replace />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                <Route path="/confirmare" element={<RequireAuth><Confirmare /></RequireAuth>} />
                <Route path="/top-produse" element={<TopProducts />} />
                <Route path="/galerie" element={<ProductGallery />} />

                {/* 🧩 Auth routes */}
                <Route path="/login" element={<AuthRedirectHandler><Login /></AuthRedirectHandler>} />
                <Route path="/register" element={<AuthRedirectHandler><Register /></AuthRedirectHandler>} />
                <Route path="/resetare-parola/:token" element={<ResetForm />} />
                <Route path="/reset-request" element={<ResetRequest />} />
                <Route path="/login-success" element={<LoginSuccess />} />

                {/* 🧑‍💼 User Dashboard */}
                <Route path="/account/*" element={<RequireAuth><UserDashboard /></RequireAuth>} />
              </Route>

              {/* 🛠️ ADMIN ROUTES */}
              <Route path="/admin/dashboard/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
              <Route path="/admin/services" element={<RequireAdmin><AdminServices /></RequireAdmin>} />
              <Route path="/admin/revenue" element={<RequireAdmin><Revenue /></RequireAdmin>} />
              <Route path="/admin" element={<RequireAdmin><Navigate to="/admin/dashboard" replace /></RequireAdmin>} />

              {/* ❌ 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </ServiceBookingProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppWrapper />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
