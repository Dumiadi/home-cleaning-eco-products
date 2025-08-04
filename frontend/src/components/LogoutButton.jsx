// frontend/src/components/LogoutButton.jsx
import React, { useState } from 'react';
import { LogOut, Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LogoutButton = ({ className = '', variant = 'button' }) => {
  const { logout, user, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('Ești sigur că vrei să te deconectezi?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('Te-ai deconectat cu succes! 👋');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Eroare la deconectare');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === 'dropdown-item') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut || isLoading}
        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors ${className}`}
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        <span>{isLoggingOut ? 'Se deconectează...' : 'Deconectare'}</span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut || isLoading}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        title="Deconectare"
      >
        {isLoggingOut ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        ) : (
          <LogOut className="w-5 h-5 text-gray-600" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut || isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Se deconectează...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          <span>Deconectare</span>
        </>
      )}
    </button>
  );
};

// ✅ USER DROPDOWN COMPONENT (pentru navbar)
export const UserDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <span className="hidden md:block font-medium text-gray-700">
          {user.name || 'Utilizator'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                  Administrator
                </span>
              )}
            </div>
            
            <div className="py-2">
              <a
                href="/account"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Contul meu</span>
              </a>
              
              {user.role === 'admin' && (
                <a
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Panou Admin</span>
                </a>
              )}
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <LogoutButton variant="dropdown-item" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LogoutButton;