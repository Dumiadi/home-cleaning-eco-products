import React, { createContext, useContext, useState, useCallback } from 'react';

// Context pentru Services
export const ServicesContext = createContext();

// Context pentru Bookings  
export const BookingsContext = createContext();

// Provider pentru Services
export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch toate serviciile
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/services');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Nu am putut încărca serviciile. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch servicii după categorie
  const getServicesByCategory = useCallback(async (category) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/services/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching services by category:', err);
      setError('Nu am putut încărca serviciile pentru această categorie.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Căutare servicii
  const searchServices = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return services;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/services/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Nu am putut căuta serviciile. Te rugăm să încerci din nou.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [services]);

  // Get service by ID
  const getServiceById = useCallback(async (serviceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching service by ID:', err);
      return null;
    }
  }, []);

  // Verifică disponibilitatea pentru o dată
  const checkAvailability = useCallback(async (serviceId, date, time) => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.available;
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  }, []);

  // Get available time slots
  const getAvailableSlots = useCallback(async (serviceId, date) => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}/slots?date=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.slots || [];
    } catch (err) {
      console.error('Error fetching available slots:', err);
      return [];
    }
  }, []);

  const value = {
    services,
    isLoading,
    error,
    fetchServices,
    getServicesByCategory,
    searchServices,
    getServiceById,
    checkAvailability,
    getAvailableSlots
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

// Provider pentru Bookings
export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch rezervările utilizatorului
  const fetchUserBookings = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError('Nu am putut încărca rezervările tale.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Creează o rezervare nouă
  const createBooking = useCallback(async (bookingData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la crearea rezervării');
      }
      
      const newBooking = await response.json();
      setBookings(prev => [...prev, newBooking]);
      
      return { success: true, booking: newBooking };
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizează statusul unei rezervări
  const updateBookingStatus = useCallback(async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedBooking = await response.json();
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      
      return { success: true, booking: updatedBooking };
    } catch (err) {
      console.error('Error updating booking status:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Anulează o rezervare
  const cancelBooking = useCallback(async (bookingId, reason) => {
    return await updateBookingStatus(bookingId, 'cancelled');
  }, [updateBookingStatus]);

  // Reprogramează o rezervare
  const rescheduleBooking = useCallback(async (bookingId, newDate, newTime) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newDate, newTime })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la reprogramare');
      }
      
      const updatedBooking = await response.json();
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      
      return { success: true, booking: updatedBooking };
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Adaugă recenzie pentru un serviciu
  const addReview = useCallback(async (bookingId, rating, comment) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedBooking = await response.json();
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      
      return { success: true, booking: updatedBooking };
    } catch (err) {
      console.error('Error adding review:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Calculează statistici pentru dashboard
  const getBookingStats = useCallback(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: bookings.length,
      thisMonth: bookings.filter(b => new Date(b.created_at) >= thisMonth).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      upcoming: bookings.filter(b => 
        b.status === 'confirmed' && new Date(b.scheduled_date) > now
      ).length,
      totalSpent: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0)
    };
    
    return stats;
  }, [bookings]);

  const value = {
    bookings,
    isLoading,
    error,
    fetchUserBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    addReview,
    getBookingStats
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};

// Combined Provider pentru ușurința utilizării
export const ServiceBookingProvider = ({ children }) => {
  return (
    <ServicesProvider>
      <BookingsProvider>
        {children}
      </BookingsProvider>
    </ServicesProvider>
  );
};

// Custom hooks pentru utilizare
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

// Hook combinat pentru statistici și overview
export const useServiceBookingOverview = () => {
  const services = useServices();
  const bookings = useBookings();
  
  return {
    services: services.services,
    bookings: bookings.bookings,
    isLoading: services.isLoading || bookings.isLoading,
    error: services.error || bookings.error,
    stats: bookings.getBookingStats(),
    ...services,
    ...bookings
  };
};