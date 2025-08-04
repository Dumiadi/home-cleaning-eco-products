// frontend/src/pages/auth/Login.jsx - ENGLISH VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight, Leaf, Sparkles, Globe, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import TwoFAVerification from './TwoFAVerification';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated, requires2FA, pendingEmail, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo =
        user.role === 'admin'
          ? '/admin/dashboard'
          : location.state?.from?.pathname || '/account';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (response.success) {
        toast.success('Welcome back! 🌿');
        const role = response.data?.user?.role;
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            const redirectTo = location.state?.from?.pathname || '/account';
            navigate(redirectTo, { replace: true });
          }
        }, 1000);
      } else if (response.requires2FA) {
        setSuccessMessage('Verification code sent to your email! 📧');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 423) {
        errorMessage = 'Account is temporarily locked.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account is not activated.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      }
      toast.error(errorMessage);
      setFormErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">

        {/* LEFT BRANDING SIDE */}
        <div className="login-branding">
          <div className="eco-background"></div>
          <div className="branding-content">
            <div className="logo-section">
              <div className="eco-logo">
                <Leaf size={48} className="logo-icon" />
              </div>
              <h1>Eco Clean</h1>
              <p>Natural products for a sustainable future</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Sparkles size={24} />
                </div>
                <h3>100% Natural</h3>
                <p>Certified eco-friendly and verified products</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Globe size={24} />
                </div>
                <h3>Carbon Neutral</h3>
                <p>Zero-impact shipping and packaging</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Leaf size={24} />
                </div>
                <h3>Zero Waste</h3>
                <p>100% biodegradable and recyclable packaging</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <h3>Community</h3>
                <p>Over 50,000 active eco members</p>
              </div>
            </div>

            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-number">75K+</span>
                <span className="stat-label">Products delivered</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1,200+</span>
                <span className="stat-label">Tons CO₂ saved</span>
              </div>
            </div>

            <div className="eco-badge">
              <Leaf size={16} />
              <span>Certified B-Corp for sustainability</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="login-form-section">
          <div className="form-container">
            {requires2FA ? (
              <TwoFAVerification 
                email={pendingEmail} 
                onBack={() => {
                  clearError();
                  setFormData({ email: '', password: '', rememberMe: false });
                }}
              />
            ) : (
              <>
                <div className="form-header">
                  <div className="welcome-icon">👋</div>
                  <h2>Welcome back!</h2>
                  <p>Sign in to continue your eco journey</p>
                </div>

                {successMessage && (
                  <div className="alert success-alert">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                  </div>
                )}

                {(error || formErrors.general) && (
                  <div className="alert error-alert">
                    <AlertCircle size={20} />
                    <span>{error || formErrors.general}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={16} />
                      Email
                    </label>
                    <div className="input-container">
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className={`form-input ${formErrors.email ? 'error' : ''}`} 
                        placeholder="example@email.com" 
                        disabled={isSubmitting} 
                        autoComplete="email" 
                      />
                    </div>
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={16} />
                      Password
                    </label>
                    <div className="input-container">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        className={`form-input ${formErrors.password ? 'error' : ''}`} 
                        placeholder="Enter your password" 
                        disabled={isSubmitting} 
                        autoComplete="current-password" 
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)} 
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        name="rememberMe" 
                        checked={formData.rememberMe} 
                        onChange={handleInputChange} 
                        disabled={isSubmitting} 
                      />
                      <span className="checkmark"></span>
                      <span>Remember me</span>
                    </label>
                    <Link to="/reset-request" className="forgot-link">
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" className="submit-button" disabled={isSubmitting || isLoading}>
                    {(isSubmitting || isLoading) ? (
                      <>
                        <Loader2 className="spinner" size={20} />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="divider">
                  <span>or continue with</span>
                </div>

                <div className="social-login">
                  <button className="social-button google" onClick={handleGoogleLogin} type="button">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                    <span>Google</span>
                  </button>
                  <button className="social-button facebook" onClick={handleFacebookLogin} type="button">
                    <div className="fb-icon">f</div>
                    <span>Facebook</span>
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                      Create free account
                    </Link>
                  </p>
                </div>

                <div className="help-links">
                  <Link to="/help">Help</Link>
                  <span>•</span>
                  <Link to="/contact">Contact</Link>
                  <span>•</span>
                  <Link to="/privacy">Privacy</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;