import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Users, CheckCircle, ArrowRight, Filter, Search, ChevronDown } from 'lucide-react';
import { useServices } from '../context/ServicesContext';
import { useAuth } from '../context/AuthContext';
import BookingModal from './BookingModal';
import './Services.css';

// Badge-uri pentru tipurile de servicii
const serviceBadges = {
  "Eco": { class: "eco", icon: "🌿" },
  "Premium": { class: "premium", icon: "✨" },
  "Express": { class: "express", icon: "⚡" },
  "Standard": { class: "standard", icon: "🏠" },
  "Deep Clean": { class: "deep", icon: "🧽" }
};

// Categorii pentru filtrare
const serviceCategories = [
 "All Services",
 "Residential Cleaning", 
 "Commercial Cleaning",
 "Specialized Services",
 "Regular Maintenance"
];
function Services() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // popular, price_low, price_high, duration
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [durationFilter, setDurationFilter] = useState("all");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Context hooks
  const { 
    services, 
    isLoading, 
    error, 
    fetchServices, 
    getServicesByCategory,
    searchServices 
  } = useServices();
  
  const { user, isAuthenticated } = useAuth();

  // Effects
  useEffect(() => {
    fetchServices();
  }, []);

  // Utility functions
  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBookingClick = (service) => {
    if (!isAuthenticated) {
      showToast("Please login to book a service!");
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    showToast("Your reservation has been successfully placed! 🎉");
  };

  // Filtering and sorting logic
  const filteredAndSortedServices = React.useMemo(() => {
    let filtered = services.filter(service => {
      // Category filter
      const matchesCategory = selectedCategory === "All Services" || 
                            service.category === selectedCategory;
      
      // Search filter
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.features?.some(feature => 
                            feature.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      // Price filter
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      
      // Duration filter
      const matchesDuration = durationFilter === "all" || 
        (durationFilter === "quick" && service.duration <= 120) ||
        (durationFilter === "standard" && service.duration > 120 && service.duration <= 240) ||
        (durationFilter === "extended" && service.duration > 240);

      return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    });

    // Sorting
    switch (sortBy) {
      case "price_low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price_high":
        return filtered.sort((a, b) => b.price - a.price);
      case "duration":
        return filtered.sort((a, b) => a.duration - b.duration);
      case "rating":
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "popular":
      default:
        return filtered.sort((a, b) => (b.bookings_count || 0) - (a.bookings_count || 0));
    }
  }, [services, selectedCategory, searchTerm, sortBy, priceRange, durationFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="services-loading">
        <div className="loading-spinner-large"></div>
        <h3>Services loading up...</h3>
        <p>We deliver the best solutions for you</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="services-error">
        <div className="error-icon">❌</div>
        <h3>Error loading services</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchServices}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="services-container">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className={`toast-notification ${showNotification ? 'show' : ''}`}>
          <div className="toast-content">
            <span>🧹</span>
            {notificationMessage}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🧽</span>
            Our Professional Services
          </h1>
          <p className="hero-subtitle">
            Our expert team offers complete cleaning solutions
            for your home and office. Guaranteed quality, impeccable results.
          </p>
          
          {/* Quick stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Satisfied customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Customer satisfaction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24h</span>
              <span className="stat-label">Răspuns rapid</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="services-filters-section">
        <div className="filters-container">
          
          {/* Search Bar */}
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Caută serviciul perfect pentru tine..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {serviceCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-filters">
            <button 
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="filter-icon" />
              Advanced Filters
              <ChevronDown className={`chevron ${showFilters ? 'rotated' : ''}`} />
            </button>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="popular">Popularity</option>
                    <option value="price_low">Rising price</option>
                    <option value="price_high">Price decreasing</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Duration:</label>
                  <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="quick">Fast (up to 2h)</option>
                    <option value="standard">Standard (2-4h)</option>
                    <option value="extended">Extended (over 4h)</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Price range: {priceRange[0]} - {priceRange[1]} RON</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="price-range"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Counter */}
          <div className="results-counter">
            <span>{filteredAndSortedServices.length} services found</span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="services-wrapper">
          
          {filteredAndSortedServices.length === 0 ? (
            <div className="no-services">
              <div className="no-services-icon">🔍</div>
              <h3>No services found</h3>
              <p>Try changing your search criteria or choose a different category</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory("Toate Serviciile");
                  setSearchTerm("");
                  setPriceRange([0, 500]);
                  setDurationFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {filteredAndSortedServices.map((service) => (
                <div key={service.id} className="service-card">
                  
                  {/* Service Image */}
                  <div className="service-image-container">
                    <img
                      src={service.image_url || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop&q=80`}
                      alt={service.name}
                      className="service-image"
                    />
                    
                    {/* Service Badge */}
                    {service.badge && (
                      <div className="service-badge-container">
                        <span className={`service-badge ${serviceBadges[service.badge]?.class || 'standard'}`}>
                          {serviceBadges[service.badge]?.icon || '🏠'} {service.badge}
                        </span>
                      </div>
                    )}

                    {/* Popular indicator */}
                    {service.is_popular && (
                      <div className="popular-indicator">
                        <Star className="star-icon" />
                        Popular
                      </div>
                    )}
                  </div>
                  
                  {/* Service Content */}
                  <div className="service-content">
                    
                    {/* Header */}
                    <div className="service-header">
                      <h3 className="service-title">{service.name}</h3>
                      <div className="service-category">{service.category}</div>
                    </div>

                    {/* Description */}
                    <p className="service-description">{service.description}</p>
                    
                    
{(() => {
  // Asigură-te că features este un array valid
  let features = [];
  try {
    if (service.features) {
      features = Array.isArray(service.features) 
        ? service.features 
        : JSON.parse(service.features);
    }
  } catch (e) {
    console.error('Error parsing features:', e);
    features = [];
  }
  
  return features.length > 0 && (
    <div className="service-features">
      {features.slice(0, 3).map((feature, index) => (
        <div key={index} className="feature-item">
          <CheckCircle className="feature-icon" />
          <span>{feature}</span>
        </div>
      ))}
      {features.length > 3 && (
        <div className="more-features">
          +{features.length - 3} other benefits
        </div>
      )}
    </div>
  );
})()}

                    {/* Service Info */}
                    <div className="service-info">
                      <div className="info-item">
                        <Clock className="info-icon" />
                        <span>{Math.floor(service.duration / 60)}h {service.duration % 60}min</span>
                      </div>
                      
                      {service.area_coverage && (
                        <div className="info-item">
                          <MapPin className="info-icon" />
                          <span>{service.area_coverage}</span>
                        </div>
                      )}
                      
                      {service.team_size && (
                        <div className="info-item">
                          <Users className="info-icon" />
                          <span>{service.team_size} {service.team_size === 1 ? 'persoană' : 'persoane'}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {service.rating && (
                      <div className="service-rating">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`rating-star ${i < Math.floor(service.rating) ? 'filled' : 'empty'}`}
                            />
                          ))}
                        </div>
                        <span className="rating-text">
                          ({service.rating}) • {service.reviews_count || 0} reviews
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="service-footer">
                      <div className="service-price">
                        <span className="price-label">From</span>
                        <span className="price-amount">{service.price} RON</span>
                        {service.price_unit && (
                          <span className="price-unit">/{service.price_unit}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleBookingClick(service)}
                        className={`book-service-btn ${!service.is_available ? 'disabled' : ''}`}
                        disabled={!service.is_available}
                      >
                        {service.is_available ? (
                          <>
                            <Calendar className="btn-icon" />
                            Book Now
                            <ArrowRight className="arrow-icon" />
                          </>
                        ) : (
                          'Indisponibil'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
   <section className="trust-section">
    <div className="trust-content">
     <h2>Why choose us?</h2>
     <div className="trust-features">
      <div className="trust-item">
        <div className="trust-icon">🛡️</div>
        <h3>Fully Insured</h3>
        <p>All employees are insured and verified for your safety</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">🌿</div>
        <h3>Eco Products</h3>
        <p>We use only eco-friendly products, safe for your family</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">⚡</div>
        <h3>Fast Services</h3>
        <p>Book in 2 minutes, services completed on time</p>
      </div>
      <div className="trust-item">
        <div className="trust-icon">💯</div>
        <h3>100% Guarantee</h3>
        <p>If you're not satisfied, we'll come back for free to remedy</p>
      </div>
     </div>
    </div>
   </section>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default Services;