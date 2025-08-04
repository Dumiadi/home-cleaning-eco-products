// frontend/src/components/auth/Register.jsx - COMPLETE ENGLISH VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, 
  CheckCircle, Loader2, ArrowRight, Check, X, Leaf, 
  Sparkles, Globe, Users, Gift, Heart, Award 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletterSubscribe: false,
    ecoPreferences: {
      ecoPackaging: true,
      carbonNeutral: true,
      ecoNewsletter: true,
      sustainabilityAlerts: true,
      categories: []
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    
    setPasswordStrength({ score, requirements });
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};

    // First Name
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Phone (optional but if provided, must be valid)
    if (formData.phone && !/^(\+?1)?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 4) {
      errors.password = 'Password does not meet all security requirements';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms and Conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('ecoPreferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ecoPreferences: {
          ...prev.ecoPreferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear field error
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
      const response = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms,
        newsletterSubscribe: formData.newsletterSubscribe,
        ecoPreferences: formData.ecoPreferences
      });
      
      if (response.success) {
        navigate('/login', {
          state: {
            message: 'Account created successfully! Check your email to activate your account. 📧'
          }
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response?.status === 409) {
        setFormErrors({ email: 'An account with this email already exists' });
      } else if (error.response?.data?.errors) {
        setFormErrors({ general: error.response.data.errors.join(', ') });
      } else {
        setFormErrors({ general: 'Failed to create account. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#ef4444';
    if (passwordStrength.score <= 3) return '#f59e0b';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        
        {/* Form Section */}
        <div className="register-form-section">
          <div className="form-container">
            
            <div className="form-header">
              <div className="eco-logo-header">
                <Leaf size={32} className="logo-icon" />
              </div>
              <h2>Join the eco community! 🌱</h2>
              <p>Create your account and start your journey towards a sustainable lifestyle</p>
            </div>

            {/* Error Messages */}
            {(error || formErrors.general) && (
              <div className="alert error-alert">
                <AlertCircle size={20} />
                <span>{error || formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              
              {/* Name Fields */}
              <div className="name-row">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    First Name *
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                      placeholder="Your first name"
                      disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.firstName && (
                    <span className="error-text">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Last Name *
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                      placeholder="Your last name"
                      disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.lastName && (
                    <span className="error-text">{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email *
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
                {formErrors.email && (
                  <span className="error-text">{formErrors.email}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone (optional)
                </label>
                <div className="input-container">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.phone && (
                  <span className="error-text">{formErrors.phone}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Password *
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.password ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                    <span 
                      className="strength-text"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="password-requirements">
                    <div className={`requirement ${passwordStrength.requirements.length ? 'met' : ''}`}>
                      {passwordStrength.requirements.length ? <Check size={14} /> : <X size={14} />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : ''}`}>
                      {passwordStrength.requirements.uppercase ? <Check size={14} /> : <X size={14} />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : ''}`}>
                      {passwordStrength.requirements.lowercase ? <Check size={14} /> : <X size={14} />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.number ? 'met' : ''}`}>
                      {passwordStrength.requirements.number ? <Check size={14} /> : <X size={14} />}
                      <span>One number</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.special ? 'met' : ''}`}>
                      {passwordStrength.requirements.special ? <Check size={14} /> : <X size={14} />}
                      <span>One special character</span>
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <span className="error-text">{formErrors.password}</span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Confirm Password *
                </label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="error-text">{formErrors.confirmPassword}</span>
                )}
              </div>

              {/* Eco Preferences */}
              <div className="eco-preferences">
                <div className="preferences-header">
                  <Leaf size={20} />
                  <h4>Your eco preferences</h4>
                </div>
                <p>Customize your experience for maximum environmental impact</p>
                
                <div className="preferences-grid">
                  <label className="preference-item">
                    <input
                      type="checkbox"
                      name="ecoPreferences.ecoPackaging"
                      checked={formData.ecoPreferences.ecoPackaging}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkmark"></span>
                    <div className="preference-content">
                      <div className="preference-icon">📦</div>
                      <div>
                        <strong>Eco packaging</strong>
                        <small>Prefer biodegradable and recyclable packaging</small>
                      </div>
                    </div>
                  </label>

                  <label className="preference-item">
                    <input
                      type="checkbox"
                      name="ecoPreferences.carbonNeutral"
                      checked={formData.ecoPreferences.carbonNeutral}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkmark"></span>
                    <div className="preference-content">
                      <div className="preference-icon">🚚</div>
                      <div>
                        <strong>Carbon neutral shipping</strong>
                        <small>Zero environmental impact delivery</small>
                      </div>
                    </div>
                  </label>

                  <label className="preference-item">
                    <input
                      type="checkbox"
                      name="ecoPreferences.ecoNewsletter"
                      checked={formData.ecoPreferences.ecoNewsletter}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkmark"></span>
                    <div className="preference-content">
                      <div className="preference-icon">📧</div>
                      <div>
                        <strong>Eco newsletter</strong>
                        <small>Receive sustainability tips and eco news</small>
                      </div>
                    </div>
                  </label>

                  <label className="preference-item">
                    <input
                      type="checkbox"
                      name="ecoPreferences.sustainabilityAlerts"
                      checked={formData.ecoPreferences.sustainabilityAlerts}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkmark"></span>
                    <div className="preference-content">
                      <div className="preference-icon">🔔</div>
                      <div>
                        <strong>Sustainability alerts</strong>
                        <small>Notifications about eco products and offers</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms and Newsletter */}
              <div className="agreements-section">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <span className="checkmark"></span>
                  <span>
                    I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link> and{' '}
                    <Link to="/privacy" target="_blank">Privacy Policy</Link> *
                  </span>
                </label>
                {formErrors.agreeToTerms && (
                  <span className="error-text">{formErrors.agreeToTerms}</span>
                )}

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="newsletterSubscribe"
                    checked={formData.newsletterSubscribe}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <span className="checkmark"></span>
                  <span>I want to receive newsletters with eco offers and news</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Benefits Section */}
        <div className="register-benefits">
          <div className="eco-background"></div>
          <div className="benefits-content">
            <div className="benefits-header">
              <div className="benefits-logo">
                <Sparkles size={32} />
              </div>
              <h3>Why choose Eco Clean?</h3>
              <p>Join a community that makes a difference for the planet</p>
            </div>
            
            <div className="benefits-list">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <Leaf size={24} />
                </div>
                <div>
                  <h4>100% Natural products</h4>
                  <p>All products are tested and certified as eco-friendly</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Globe size={24} />
                </div>
                <div>
                  <h4>Carbon neutral delivery</h4>
                  <p>Eco-friendly transport with zero environmental impact</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Heart size={24} />
                </div>
                <div>
                  <h4>Personal Eco Score</h4>
                  <p>Track your positive environmental impact in real-time</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Gift size={24} />
                </div>
                <div>
                  <h4>Eco rewards</h4>
                  <p>Earn points for every sustainable purchase</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Users size={24} />
                </div>
                <div>
                  <h4>Active community</h4>
                  <p>Join our community of 75,000+ eco members</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <Award size={24} />
                </div>
                <div>
                  <h4>Premium certifications</h4>
                  <p>Products with international sustainability certifications</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p>"Since using Eco Clean, my home is cleaner and the environment is healthier. The product quality is exceptional!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">AM</div>
                  <div>
                    <strong>Anna Marie Johnson</strong>
                    <span>Verified customer from New York</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="community-stats">
              <div className="stat-card">
                <span className="stat-number">75K+</span>
                <span className="stat-label">Active members</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1.2M+</span>
                <span className="stat-label">Kg CO₂ saved</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer satisfaction</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;