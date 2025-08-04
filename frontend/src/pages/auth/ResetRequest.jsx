// frontend/src/components/auth/ResetRequest.jsx - ENGLISH VERSION
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2, Send, Shield, Clock, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ResetRequest.css';

const ResetRequest = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await forgotPassword(email.toLowerCase().trim());
      
      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (isSuccess) {
    return (
      <div className="reset-container">
        <div className="reset-wrapper">
          <div className="reset-branding success">
            <div className="eco-background"></div>
            <div className="branding-content">
              <div className="logo-section">
                <div className="eco-logo">
                  <Send size={48} className="logo-icon success" />
                </div>
                <h1>Email sent!</h1>
                <p>Check your email for instructions</p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Clock size={24} />
                  </div>
                  <h3>Temporary link</h3>
                  <p>The link will be valid for 1 hour for your safety</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <h3>Security</h3>
                  <p>The reset process is completely secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reset-form-section">
            <div className="form-container">
              <div className="form-header">
                <div className="success-icon">📧</div>
                <h2>Email sent successfully! 📧</h2>
                <p>If an account exists with the address <strong>{email}</strong>, you will receive password reset instructions shortly.</p>
              </div>

              <div className="success-tips">
                <h4>What's next:</h4>
                <ol>
                  <li>Check your inbox and spam folder</li>
                  <li>Open the email from Eco Clean</li>
                  <li>Follow the link to reset your password</li>
                  <li>Create a new strong password</li>
                </ol>
              </div>

              <div className="success-actions">
                <Link to="/login" className="back-to-login-btn">
                  <ArrowLeft size={20} />
                  Back to sign in
                </Link>
                
                <button 
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="resend-btn"
                >
                  Send again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-wrapper">
        
        {/* LEFT BRANDING SIDE */}
        <div className="reset-branding">
          <div className="eco-background"></div>
          <div className="branding-content">
            <div className="logo-section">
              <div className="eco-logo">
                <Mail size={48} className="logo-icon" />
              </div>
              <h1>Password Recovery</h1>
              <p>Don't worry! We'll help you recover your eco account</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Secure process</h3>
                <p>Password reset is done through a secure process</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Clock size={24} />
                </div>
                <h3>Fast and simple</h3>
                <p>You'll receive instructions in minutes</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Leaf size={24} />
                </div>
                <h3>Your eco account</h3>
                <p>Keep your access to sustainable products</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Mail size={24} />
                </div>
                <h3>Secure email</h3>
                <p>Reset link is valid for only 1 hour</p>
              </div>
            </div>

            <div className="security-badge">
              <Shield size={16} />
              <span>Protected by 256-bit SSL encryption</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="reset-form-section">
          <div className="form-container">
            
            <div className="form-header">
              <div className="reset-icon">🔐</div>
              <h2>Forgot your password?</h2>
              <p>Don't worry! Enter your email address and we'll send you instructions to reset your password.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="reset-form">
              <div className="form-group">
                <label className="form-label">
                  Email address
                </label>
                <div className="input-container">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`form-input ${error ? 'error' : ''}`}
                    placeholder="example@email.com"
                    disabled={isSubmitting}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <small className="input-help">
                  Enter the email address associated with your account
                </small>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send instructions
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="security-note">
              <div className="security-icon">🔒</div>
              <div>
                <h4>Your security is important</h4>
                <p>
                  For security reasons, you will only receive the email if the address 
                  is associated with an existing account. The link will be valid for 1 hour.
                </p>
              </div>
            </div>

            {/* Back to Login */}
            <div className="reset-footer">
              <Link to="/login" className="back-link">
                <ArrowLeft size={18} />
                Back to sign in
              </Link>
              
              <div className="help-text">
                <span>Need help? </span>
                <Link to="/contact" className="contact-link">
                  Contact us
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetRequest;