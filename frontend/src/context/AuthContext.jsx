// frontend/src/context/AuthContext.js - FINAL DEBUG VERSION
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // ✅ START WITH LOADING TRUE
  error: null,
  token: null,
  requires2FA: false,
  pendingEmail: null
};

const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_2FA_REQUIRED: 'AUTH_2FA_REQUIRED',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
};

const authReducer = (state, action) => {
  console.log('🔄 AuthContext Action:', action.type, action.payload);
  
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        requires2FA: false
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requires2FA: false,
        pendingEmail: null
      };

    case AUTH_ACTIONS.AUTH_2FA_REQUIRED:
      return {
        ...state,
        isLoading: false,
        error: null,
        requires2FA: true,
        pendingEmail: action.payload.email,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        requires2FA: false,
        pendingEmail: null
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// ✅ IMPROVED API CALL HELPER
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  console.log(`🌐 API Call: ${endpoint}`, { method: config.method || 'GET', hasToken: !!token });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // ✅ HANDLE TOKEN EXPIRY
  if (response.status === 401) {
    console.warn('🚨 Token expired, clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Session expired');
  }

  const data = await response.json();
  console.log(`📨 API Response: ${endpoint}`, { status: response.status, data });

  if (!response.ok) {
    throw {
      message: data.message || 'Request failed',
      response: response,
      status: response.status
    };
  }

  return data;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ CHECK AUTH ON LOAD
  useEffect(() => {
    console.log('🔍 AuthProvider: Checking initial auth state');
    checkAuth();
  }, []);

  // ✅ DEBUG LOG STATE CHANGES
  useEffect(() => {
    console.log('🔍 AuthContext State Update:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user ? { name: state.user.name, email: state.user.email, role: state.user.role } : null,
      isLoading: state.isLoading,
      hasToken: !!state.token,
      requires2FA: state.requires2FA,
      error: state.error
    });
  }, [state]);

  const checkAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      
      console.log('🔍 CheckAuth:', { hasToken: !!token, hasUser: !!userString });
      
      if (!token || !userString) {
        console.log('❌ No token or user found, logging out');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      // ✅ VALIDATE TOKEN WITH BACKEND
      const response = await apiCall('/users/me');
      
      console.log('✅ Auth validated:', response);
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response,
          token: token
        }
      });
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      console.log('📝 Registering user:', { email: userData.email });
      
      const response = await apiCall('/users/register', {
        method: 'POST',
        body: userData
      });
      
      if (response.user && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: response.user,
            token: response.token
          }
        });
        
        return { success: true, data: response };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const errorMessage = error.message || 'Eroare la înregistrare';
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      console.log('🔐 Logging in user:', { email: credentials.email });
      
      const response = await apiCall('/users/login', {
        method: 'POST',
        body: credentials
      });
      
      console.log('📨 Login response received:', response);
      
      if (response.user && response.token) {
        // ✅ LOGIN DIRECT (fără 2FA)
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: response.user,
            token: response.token
          }
        });
        
        return { success: true, data: response };
      } else if (response.requires2FA || response.userId) {
        // ✅ 2FA REQUIRED
        dispatch({ 
          type: AUTH_ACTIONS.AUTH_2FA_REQUIRED,
          payload: { email: credentials.email }
        });
        return { success: false, requires2FA: true, message: response.message };
      } else {
        // ✅ LOGIN FAILED
        const errorMessage = response.message || 'Credențiale invalide';
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.message || 'Eroare la autentificare';
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  const verify2FA = async (email, code) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      const response = await apiCall('/users/2fa/verify', {
        method: 'POST',
        body: { email, code }
      });
      
      if (response.user && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: response.user,
            token: response.token
          }
        });
        
        return { success: true, data: response };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Eroare la verificarea codului';
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  // ✅ IMPROVED LOGOUT FUNCTION
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🚪 Logging out user');
      
      // ✅ NOTIFY BACKEND OF LOGOUT
      if (token) {
        try {
          await apiCall('/users/logout', {
            method: 'POST'
          });
        } catch (error) {
          console.warn('Backend logout failed:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ COMPLETE CLEANUP - ALWAYS EXECUTE
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      sessionStorage.clear();
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // ✅ FORCE REDIRECT TO LOGIN
      window.location.href = '/login';
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const updateUser = (userData) => {
    console.log('👤 Updating user data:', userData);
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
    
    // ✅ UPDATE LOCALSTORAGE TOO
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiCall('/users/forgot-password', {
        method: 'POST',
        body: { email }
      });
      return { success: true, message: response.message };
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiCall(`/users/reset-password/${token}`, {
        method: 'POST',
        body: { newPassword, confirmPassword }
      });
      return { success: true, message: response.message };
    } catch (error) {
      throw error;
    }
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    register,
    login,
    verify2FA,
    logout,
    clearError,
    checkAuth,
    updateUser,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;