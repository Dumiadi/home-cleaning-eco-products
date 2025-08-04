// frontend/src/pages/auth/TwoFAVerification.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const TwoFAVerification = ({ email, onBack }) => {
  const { verify2FA, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
        
    if (code.length !== 6) {
      return;
    }

    setIsSubmitting(true);
        
    try {
      const response = await verify2FA(email, code);
            
      if (response.success) {
        // Login success - AuthContext va face redirect
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (error) clearError();
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Verificare în doi pași 🔐</h2>
        <p>Introdu codul de 6 cifre trimis pe email-ul tău</p>
        <p className="text-sm text-gray-600">{email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">
            Cod de verificare
          </label>
          <div className="input-container">
            <input
              type="text"
              value={code}
              onChange={handleInputChange}
              className="form-input text-center text-2xl tracking-wider"
              placeholder="123456"
              maxLength={6}
              disabled={isSubmitting}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Codul este valid 10 minute
          </p>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading || code.length !== 6}
        >
          {(isSubmitting || isLoading) ? (
            <>
              <Loader2 className="spinner" size={20} />
              Se verifică...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Verifică codul
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} />
          Înapoi la login
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Nu ai primit codul?{' '}
          <button 
            type="button"
            className="text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
            onClick={() => {
              // TODO: Implementează resend code
              console.log('Resend code for:', email);
            }}
          >
            Retrimite
          </button>
        </p>
      </div>
    </div>
  );
};

export default TwoFAVerification;