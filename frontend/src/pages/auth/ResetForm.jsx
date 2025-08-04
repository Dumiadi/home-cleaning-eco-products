// frontend/src/components/auth/ResetForm.jsx - ENGLISH VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight, Check, X, Leaf, Shield, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ResetForm.css';

const ResetForm = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { token } = useParams();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  
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

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
    }
  }, [token]);

  // Password strength checker
  useEffect(() => {
    const password = formData.newPassword;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength({ score, requirements });
  }, [formData.newPassword]);

  const validateForm = () => {
    const errors = {};

    // New Password
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordStrength.score < 4) {
      errors.newPassword = 'Password does not meet all security requirements';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await resetPassword(
        token, 
        formData.newPassword, 
        formData.confirmPassword
      );
      
      if (response.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Password successfully changed! You can now sign in. 🔐'
            }
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      
      if (error.response?.status === 400) {
        if (error.response.data.expired) {
          setFormErrors({ 
            general: 'Reset link has expired. Please request a new one.' 
          });
          setIsTokenValid(false);
        } else {
          setFormErrors({ 
            general: error.response.data.message || 'Invalid or expired token' 
          });
        }
      } else {
        setFormErrors({ 
          general: 'An error occurred. Please try again.' 
        });
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

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="reset-container">
        <div className="reset-wrapper">
          <div className="reset-branding">
            <div className="eco-background"></div>
            <div className="branding-content">
              <div className="logo-section">
                <div className="eco-logo">
                  <AlertCircle size={48} className="logo-icon error" />
                </div>
                <h1>Link Expired</h1>
                <p>The reset link is no longer valid</p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <h3>Security</h3>
                  <p>Reset links expire for your safety</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <Key size={24} />
                  </div>
                  <h3>Quick solution</h3>
                  <p>Request a new link in seconds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reset-form-section">
            <div className="form-container">
              <div className="form-header">
                <div className="warning-icon">⚠️</div>
                <h2>Invalid or expired link</h2>
                <p>The password reset link is not valid or has expired. Please request a new one.</p>
              </div>

              <div className="error-actions">
                <Link to="/reset-request" className="primary-btn">
                  Request new link
                </Link>
                <Link to="/login" className="secondary-btn">
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="reset-container">
        <div className="reset-wrapper">
          <div className="reset-branding success">
            <div className="eco-background"></div>
            <div className="branding-content">
              <div className="logo-section">
                <div className="eco-logo">
                  <CheckCircle size={48} className="logo-icon success" />
                </div>
                <h1>Password Updated!</h1>
                <p>Your account is now more secure</p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <h3>Enhanced security</h3>
                  <p>Your new password meets all safety criteria</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <Leaf size={24} />
                  </div>
                  <h3>Full access</h3>
                  <p>You can access all eco features of your account</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reset-form-section">
            <div className="form-container">
              <div className="form-header">
                <div className="success-icon">🎉</div>
                <h2>Password changed successfully! 🎉</h2>
                <p>Your password has been updated successfully. You will be redirected to the sign in page in a few seconds.</p>
              </div>

              <div className="success-actions">
                <Link to="/login" className="primary-btn">
                  Sign in now
                </Link>
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
                <Key size={48} className="logo-icon" />
              </div>
              <h1>Password Reset</h1>
              <p>Create a new secure password for your eco account</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Advanced security</h3>
                <p>Your data protection is our priority</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Lock size={24} />
                </div>
                <h3>Strong encryption</h3>
                <p>Passwords are securely stored with advanced encryption</p>
              </div>
            </div>

            <div className="security-badge">
              <Shield size={16} />
              <span>The reset process is fully secured</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="reset-form-section">
          <div className="form-container">
            
            <div className="form-header">
              <div className="reset-icon">🔑</div>
              <h2>Create a new password</h2>
              <p>Choose a strong password to secure your Eco Clean account.</p>
            </div>

            {/* Error Message */}
            {formErrors.general && (
              <div className="alert error-alert">
                <AlertCircle size={20} />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="reset-form">
              
              {/* New Password Field */}
              <div className="form-group">
                <label className="form-label">New password *</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.newPassword ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
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
                {formData.newPassword && (
                  <div className="password-requirements">
                    <div className={`requirement ${passwordStrength.requirements.length ? 'met' : ''}`}>
                      {passwordStrength.requirements.length ? <Check size={14} /> : <X size={14} />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : ''}`}>
                      {passwordStrength.requirements.uppercase ? <Check size={14} /> : <X size={14} />}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : ''}`}>
                      {passwordStrength.requirements.lowercase ? <Check size={14} /> : <X size={14} />}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.number ? 'met' : ''}`}>
                      {passwordStrength.requirements.number ? <Check size={14} /> : <X size={14} />}
                      <span>One number (0-9)</span>
                    </div>
                    <div className={`requirement ${passwordStrength.requirements.special ? 'met' : ''}`}>
                      {passwordStrength.requirements.special ? <Check size={14} /> : <X size={14} />}
                      <span>One special character (!@#$%...)</span>
                    </div>
                  </div>
                )}

                {formErrors.newPassword && (
                  <span className="error-text">{formErrors.newPassword}</span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">Confirm new password *</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm new password"
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
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <div className={`password-match ${formData.newPassword === formData.confirmPassword ? 'match' : 'no-match'}`}>
                    {formData.newPassword === formData.confirmPassword ? (
                      <>
                        <Check size={14} />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X size={14} />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}

                {formErrors.confirmPassword && (
                  <span className="error-text">{formErrors.confirmPassword}</span>
                )}
              </div>

              {/* Security Tips */}
              <div className="security-tips">
                <h4>💡 Tips for a secure password:</h4>
                <ul>
                  <li>Use a combination of uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                  <li>Avoid personal information (names, birth dates)</li>
                  <li>Don't use the same password for multiple accounts</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || passwordStrength.score < 4}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Updating...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="reset-footer">
              <Link to="/login" className="back-link">
                Back to sign in
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetForm;