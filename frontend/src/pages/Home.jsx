import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Leaf, Shield, Heart, Users, Award, Zap, Globe,
  ArrowRight, Star, CheckCircle, Play, Phone, Calculator,
  DollarSign, Home, Truck, MessageCircle, Wind, Sun,
  Droplets, Recycle, MapPin, Calendar, Clock, ChevronDown,
  Eye, Target, TrendingUp, Lightbulb, Wifi, Smartphone,
  Camera, Image, Send, ThumbsUp
} from 'lucide-react';
import './Home.css';

const UltraModernEcoCleanHome = () => {
  // Navigation
  const navigate = useNavigate();

  // State management
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [homeSize, setHomeSize] = useState('');
  const [selectedService, setSelectedService] = useState('deep');
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [showPriceCards, setShowPriceCards] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [userReviews, setUserReviews] = useState([]);

  // Refs
  const heroRef = useRef(null);
  const observerRefs = useRef([]);

  // Data
  const pricingRates = {
    deep: 15,
    maintenance: 8,
    event: 20,
    general: 12
  };

  const serviceDetails = {
    deep: { 
      name: "Deep Eco Cleaning", 
      description: "Intensive cleaning with 100% natural products and eco disinfection",
      tag: "🔥 Most Popular",
      features: ["Eco disinfection", "Certified products", "Premium equipment"]
    },
    maintenance: { 
      name: "Premium Maintenance", 
      description: "Regular cleaning to maintain your home's hygiene",
      tag: "⭐ Best Value",
      features: ["Flexible subscription", "Dedicated team", "Reduced price"]
    },
    event: { 
      name: "Post-Event Cleaning", 
      description: "Intensive cleaning after parties or special events",
      tag: "💎 Premium",
      features: ["Fast cleaning", "Special equipment", "24/7 available"]
    },
    general: { 
      name: "General Eco Cleaning", 
      description: "Complete house cleaning with eco-friendly products",
      tag: "🌿 Eco-Friendly",
      features: ["All rooms", "Natural products", "Flawless finish"]
    }
  };

  const features = [
    { 
      icon: <Leaf className="feature-icon" />, 
      title: "100% Carbon Neutral", 
      description: "Romania's first platform with zero environmental impact",
      className: "feature-emerald",
      stats: "0 CO2 emissions"
    },
    { 
      icon: <Shield className="feature-icon" />, 
      title: "Total Guarantee", 
      description: "100% satisfaction guarantee or your money back",
      className: "feature-blue",
      stats: "99.8% satisfaction"
    },
    { 
      icon: <Zap className="feature-icon" />, 
      title: "Ultra-Fast Service", 
      description: "2-minute booking, same-day services",
      className: "feature-purple",
      stats: "< 30 min response"
    },
    { 
      icon: <Heart className="feature-icon" />, 
      title: "Family Health", 
      description: "Zero toxic substances, safe for children and pets",
      className: "feature-rose",
      stats: "100% non-toxic"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of 3 children",
      content: "My children have asthma and I finally found cleaning services that don't trigger their attacks. The products are truly natural!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      location: "Bucharest, Sector 1"
    },
    {
      name: "Alexander Constantin",
      role: "TechStart CEO",
      content: "Our office with 50 employees has never been so clean. The team is professional and respects all eco requirements.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      location: "Bucharest, Pipera"
    },
    {
      name: "Elena Marcu",
      role: "Interior Designer",
      content: "I work with sensitive materials and need non-aggressive products. EcoClean is the only solution that works perfectly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      location: "Ilfov, Voluntari"
    }
  ];

  const stats = [
    { number: "25,000+", label: "Homes Transformed", icon: <Home className="stat-icon" /> },
    { number: "4.98★", label: "Perfect Rating", icon: <Star className="stat-icon" /> },
    { number: "100%", label: "Eco Certified", icon: <Leaf className="stat-icon" /> },
    { number: "0", label: "Carbon Impact", icon: <Globe className="stat-icon" /> }
  ];

  // Gallery images
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop",
      title: "Professional Team at Work",
      description: "Our certified eco cleaning specialists in action"
    },
    {
      url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
      title: "Eco-Friendly Products",
      description: "100% natural and certified cleaning products"
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      title: "Modern Home Cleaning",
      description: "Transform your space into a wellness sanctuary"
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      title: "Before & After Results",
      description: "See the amazing transformation results"
    },
    {
      url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=600&fit=crop",
      title: "Smart Technology",
      description: "AI-powered cleaning optimization"
    },
    {
      url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop",
      title: "Happy Families",
      description: "Safe and healthy homes for families"
    }
  ];

  // Navigation functions
  const goToServices = () => {
    navigate('/services');
  };

  const goToBooking = () => {
    navigate('/services');
  };

  const callNow = () => {
    window.open('tel:+40800326253', '_self');
  };

  // Review functions
  const submitReview = (e) => {
  e.preventDefault();
  if (newReview.name && newReview.comment) {
    axios.post('http://localhost:5000/api/reviews', newReview)
      .then(() => {
        alert('Review submitted!');
        setNewReview({ name: '', rating: 5, comment: '' });
        return axios.get('http://localhost:5000/api/reviews');
      })
      .then((res) => setUserReviews(res.data))
      .catch((err) => console.error('Review error:', err));
  }
};

  // Effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGalleryImage(prev => (prev + 1) % galleryImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [galleryImages.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observerRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Price calculation
  useEffect(() => {
    const size = parseFloat(homeSize);
    if (size && size > 0) {
      const basePrice = size * pricingRates[selectedService];
      const finalPrice = Math.ceil(basePrice / 5) * 5;
      setCalculatedPrice(finalPrice);
      setShowPriceCards(true);
    } else {
      setCalculatedPrice(null);
      setShowPriceCards(false);
    }
  }, [homeSize, selectedService]);
useEffect(() => {
  axios.get('http://localhost:5000/api/reviews')
    .then(res => setUserReviews(res.data))
    .catch(err => console.error('Fetch reviews failed:', err));
}, []);

  // Dynamic styles for mouse interaction
  const backgroundStyle = {
    background: `
      radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
    `
  };

  return (
    <div className="ultra-modern-home">
      
      {/* Advanced Background Effects */}
      <div className="background-effects">
        {/* Animated Gradient Mesh */}
        <div className="gradient-mesh" style={backgroundStyle} />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="grid-pattern" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="container">
          <div className="hero-grid">
            
            {/* Left Content */}
            <div className="hero-content">
              {/* Badge */}
              <div className="eco-badge">
                <div className="badge-pulse-dot" />
                <Globe className="badge-icon" />
                <span className="badge-text">
                  Carbon-Neutral Certified • EU Ecolabel • First in Romania
                </span>
              </div>

              {/* Main Title */}
              <div className="title-section">
                <h1 className="hero-title">
                  <span className="title-gradient">
                    CLEANING
                  </span>
                  <span className="title-dark">
                    REINVENTED
                  </span>
                </h1>
                
                <div className="title-underline" />
                
                <p className="hero-subtitle">
                  Transform your home into a{" "}
                  <span className="subtitle-highlight-green">wellness sanctuary</span>{" "}
                  with Romania's first{" "}
                  <span className="subtitle-highlight-cyan">100% eco platform</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="cta-buttons">
                <button className="btn-primary" onClick={goToServices}>
                  <div className="btn-overlay" />
                  <div className="btn-content">
                    <Sparkles className="btn-icon" />
                    Book Your Eco-Revolution
                    <ArrowRight className="btn-arrow" />
                  </div>
                </button>
                
                <button className="btn-secondary" onClick={goToServices}>
                  <div className="btn-content">
                    <Play className="btn-icon" />
                    Experience the Difference
                  </div>
                </button>
              </div>

              {/* Live Stats */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-icon-wrapper">
                      {stat.icon}
                    </div>
                    <div className="stat-number">
                      {stat.number}
                    </div>
                    <div className="stat-label">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Interactive Calculator */}
            <div className="calculator-section">
              <div className="calculator-card">
                {/* Glassmorphism effect */}
                <div className="calculator-overlay" />
                
                <div className="calculator-content">
                  {/* Header */}
                  <div className="calculator-header">
                    <h3 className="calculator-title">
                      Live Transformation
                    </h3>
                    <p className="calculator-subtitle">
                      Watch the eco magic in action
                    </p>
                  </div>

                  {/* Before/After Demo */}
                  <div className="demo-grid">
                    <div className="demo-item">
                      <div className="demo-card demo-before">
                        <span className="demo-label">Before</span>
                        <div className="demo-overlay" />
                      </div>
                      <p className="demo-status demo-status-before">❌ Chemical Residues</p>
                    </div>
                    
                    <div className="demo-item">
                      <div className="demo-card demo-after">
                        <span className="demo-label">After</span>
                        <div className="demo-overlay-after" />
                      </div>
                      <p className="demo-status demo-status-after">✅ Pure & Natural</p>
                    </div>
                  </div>

                  {/* Price Calculator */}
                  <div className="price-calculator">
                    <div className="calculator-label-row">
                      <Calculator className="calculator-icon" />
                      Smart Price Calculator
                    </div>
                    
                    <select 
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="service-select"
                    >
                      <option value="deep">Deep Cleaning - 15 RON/sqm</option>
                      <option value="general">General Cleaning - 12 RON/sqm</option>
                      <option value="maintenance">Premium Maintenance - 8 RON/sqm</option>
                      <option value="event">Post-Event - 20 RON/sqm</option>
                    </select>

                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="e.g: 80 sqm"
                        value={homeSize}
                        onChange={(e) => setHomeSize(e.target.value)}
                        className="size-input"
                      />
                      <Calculator className="input-icon" />
                    </div>

                    {calculatedPrice && (
                      <div className="price-result">
                        <div className="price-amount">
                          <DollarSign className="price-icon" />
                          {calculatedPrice} RON
                        </div>
                        <p className="price-description">
                          Estimated price for {homeSize} sqm
                        </p>
                        <p className="price-service">
                          {serviceDetails[selectedService].description}
                        </p>
                      </div>
                    )}

                    <button className="explore-btn" onClick={goToServices}>
                      <div className="explore-content">
                        <Sparkles className="btn-icon" />
                        Explore All Services
                        <ArrowRight className="btn-icon" />
                      </div>
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="trust-indicators">
                    <span>💡 All materials included</span>
                    <span>🚚 Free shipping</span>
                    <span>🛡️ Insurance included</span>
                  </div>
                </div>

                {/* Floating Trust Badges */}
                <div className="trust-badge trust-badge-top">
                  🏆 #1 Eco Service
                </div>
                
                <div className="trust-badge trust-badge-bottom">
                  ⚡ Available Today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <p className="scroll-text">Discover Our Services</p>
          <ChevronDown className="scroll-arrow" />
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={el => observerRefs.current[0] = el}
        data-section="features"
        className="features-section"
      >
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Zap className="badge-icon" />
              Why EcoClean Leads the Market
            </div>
            
            <h2 className="section-title">
              We're Revolutionizing{" "}
              <span className="title-gradient">
                Cleaning
              </span>
            </h2>
            
            <p className="section-subtitle">
              Romania's first platform combining AI technology with 100% eco-friendly products for impeccable results
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${feature.className} ${
                  activeFeature === index ? 'feature-active' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-overlay" />
                
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    {feature.icon}
                  </div>
                  
                  <h3 className="feature-title">
                    {feature.title}
                  </h3>
                  
                  <p className="feature-description">
                    {feature.description}
                  </p>
                  
                  <div className="feature-stats">
                    <TrendingUp className="stats-icon" />
                    <span className="stats-text">
                      {feature.stats}
                    </span>
                  </div>
                </div>

                {activeFeature === index && (
                  <div className="feature-active-indicator">
                    <CheckCircle className="active-icon" />
                    <span className="active-text">Active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={el => observerRefs.current[1] = el}
        data-section="testimonials"
        className="testimonials-section"
      >
        <div className="container">
          <div className="section-header">
            <div className="section-badge section-badge-yellow">
              <Star className="badge-icon" />
              Over 25,000 Families Recommend Us
            </div>
            
            <h2 className="section-title">
              Real{" "}
              <span className="title-yellow">
                Transformations
              </span>
            </h2>
          </div>

          {/* Featured Testimonial */}
          <div className="testimonial-featured">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="testimonial-avatar"
                />
                
                <div className="testimonial-text">
                  <div className="testimonial-rating">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="rating-star" />
                    ))}
                  </div>
                  
                  <blockquote className="testimonial-quote">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  
                  <div className="testimonial-author">
                    <div className="author-name">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="author-role">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="author-location">
                      <MapPin className="location-icon" />
                      {testimonials[currentTestimonial].location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation dots */}
            <div className="testimonial-navigation">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`nav-dot ${index === currentTestimonial ? 'nav-dot-active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Camera className="badge-icon" />
              Our Work Gallery
            </div>
            
            <h2 className="section-title">
              See the{" "}
              <span className="title-gradient">
                Transformation
              </span>
            </h2>
            
            <p className="section-subtitle">
              Real results from real homes. Browse through our portfolio of eco-friendly cleaning transformations
            </p>
          </div>

          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`gallery-item ${index === currentGalleryImage ? 'active' : ''}`}
                onClick={() => setCurrentGalleryImage(index)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <div className="gallery-content">
                    <h4 className="gallery-title">{image.title}</h4>
                    <p className="gallery-description">{image.description}</p>
                    <Eye className="gallery-icon" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Image */}
          <div className="gallery-featured">
            <img
              src={galleryImages[currentGalleryImage].url}
              alt={galleryImages[currentGalleryImage].title}
              className="featured-image"
            />
            <div className="featured-info">
              <h3 className="featured-title">{galleryImages[currentGalleryImage].title}</h3>
              <p className="featured-description">{galleryImages[currentGalleryImage].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <MessageCircle className="badge-icon" />
              Leave Your Review
            </div>
            
            <h2 className="section-title">
              Share Your{" "}
              <span className="title-gradient">
                Experience
              </span>
            </h2>
            
            <p className="section-subtitle">
              Help other families discover the power of eco-friendly cleaning
            </p>
          </div>

          <div className="reviews-grid">
            {/* Review Form */}
            <div className="review-form-card">
              <h3 className="form-title">Write a Review</h3>
              <form onSubmit={submitReview} className="review-form">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`rating-star-input ${star <= newReview.rating ? 'filled' : ''}`}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="form-textarea"
                    placeholder="Share your experience with our eco cleaning services..."
                    rows="4"
                    required
                  />
                </div>
                
                <button type="submit" className="submit-review-btn">
                  <Send className="btn-icon" />
                  Submit Review
                </button>
              </form>
            </div>

            {/* User Reviews Display */}
            <div className="user-reviews">
              <h3 className="reviews-title">Recent Reviews ({userReviews.length})</h3>
              {userReviews.length === 0 ? (
                <div className="no-reviews">
                  <MessageCircle className="no-reviews-icon" />
                  <p>Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {userReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <h4 className="reviewer-name">{review.name}</h4>
                        <div className="review-rating">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="review-star" />
                          ))}
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      <div className="review-actions">
                        <button className="like-btn">
                          <ThumbsUp className="like-icon" />
                          Helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-overlay" />
        
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready for Your{" "}
              <span className="cta-title-highlight">
                Eco-Revolution?
              </span>
            </h2>
            
            <p className="cta-subtitle">
              Join 25,000+ families who have discovered the power of truly healthy cleaning
            </p>
            
            <div className="cta-buttons-row">
              <button className="cta-btn-primary" onClick={callNow}>
                <div className="btn-content">
                  <Phone className="btn-icon" />
                  Call Now: 0800-ECO-CLEAN
                </div>
              </button>
              
              <button className="cta-btn-secondary" onClick={goToBooking}>
                <div className="btn-content">
                  <Calendar className="btn-icon" />
                  Book Online
                </div>
              </button>
            </div>
            
            <div className="cta-guarantees">
              <div className="guarantee-item">
                <Shield className="guarantee-icon" />
                <span>100% satisfaction guarantee</span>
              </div>
              <div className="guarantee-item">
                <Clock className="guarantee-icon" />
                <span>Same-day service</span>
              </div>
              <div className="guarantee-item">
                <Heart className="guarantee-icon" />
                <span>Safe for your family</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UltraModernEcoCleanHome;