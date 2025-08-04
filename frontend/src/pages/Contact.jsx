import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  CheckCircle,
  AlertTriangle,
  Globe,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Award,
  Users,
  Timer,
  HelpCircle,
  ChevronDown,
  Calendar,
  Heart
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal',
    propertySize: '',
    cleaningFrequency: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      details: ['+40 748 123 456', '+40 749 987 654'],
      description: 'Available Mon - Fri, 8:00 AM - 6:00 PM',
      action: 'tel:+40748123456',
      color: 'from-emerald-500'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      details: ['hello@eco-cleaning-pitesti.com', 'support@eco-cleaning-pitesti.com'],
      description: 'We respond within 2 hours',
      action: 'mailto:hello@eco-cleaning-pitesti.com',
      color: 'from-blue-500'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Location',
      details: ['Calea Craiovei', 'Pitești, Argeș'],
      description: 'Our headquarters',
      color: 'from-purple-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Working Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 3:00 PM'],
      description: 'Sunday: Closed',
      color: 'from-orange-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Insurance & Safety',
      details: ['Fully Insured & Bonded', 'Background Checked Staff'],
      description: 'Your peace of mind guaranteed',
      color: 'from-green-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Certifications',
      details: ['ISO 9001 Certified', 'Eco-Friendly Approved'],
      description: 'Quality & environmental standards',
      color: 'from-indigo-500'
    }
  ];

  const serviceTypes = [
    'General Cleaning',
    'Post-Construction Cleaning',
    'Office Cleaning',
    'Window Cleaning',
    'Deep Cleaning',
    'Move-in/Move-out',
    'Specialized Services',
    'Consultation',
    'Other'
  ];

  const propertyTypes = [
    'Studio (< 40m²)',
    'Small Apartment (40-60m²)',
    'Medium Apartment (60-90m²)',
    'Large Apartment (90-120m²)',
    'House (120m²+)',
    'Office Space',
    'Commercial'
  ];

  const frequencyOptions = [
    'One-time service',
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'Quarterly',
    'As needed'
  ];

  const faqData = [
    {
      question: "How quickly can you provide a quote?",
      answer: "We provide instant quotes for standard services and detailed quotes within 2 hours for custom requests during business hours."
    },
    {
      question: "Do you bring your own eco-friendly supplies?",
      answer: "Yes! We bring all certified eco-friendly cleaning supplies and equipment. We can also use your preferred products if requested."
    },
    {
      question: "What areas do you serve in Pitești?",
      answer: "We serve all districts of Pitești and surrounding areas within a 30km radius. Same-day service available in most locations."
    },
    {
      question: "Are you insured and bonded?",
      answer: "Absolutely! We carry full liability insurance and all our staff are bonded and background-checked for your peace of mind."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, bank transfers, credit/debit cards, and digital payments. Payment is due upon completion of service unless arranged otherwise."
    },
    {
      question: "Can you clean while I'm not home?",
      answer: "Yes! Many of our clients prefer this option. We'll arrange a secure key exchange and provide detailed before/after photos of our work."
    }
  ];

  const isBusinessOpen = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    
    if (day === 0) return false; // Sunday
    if (day === 6) return hour >= 9 && hour < 15; // Saturday
    return hour >= 8 && hour < 18; // Monday-Friday
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrors({});
    
    try {
      console.log('📧 Sending contact message...', formData);
      
      // ✅ TRIMITE CĂTRE BACKEND
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service: formData.service,
          subject: formData.subject,
          message: formData.message,
          preferredContact: formData.preferredContact,
          urgency: formData.urgency,
          serviceType: formData.service, // Pentru compatibilitate
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });

      console.log('📨 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success:', data);
        
        setSubmitStatus('success');
        
        // ✅ RESETEAZĂ FORMULARUL
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          subject: '',
          message: '',
          preferredContact: 'email',
          urgency: 'normal',
          propertySize: '',
          cleaningFrequency: ''
        });
        
        // ✅ SCROLL TO SUCCESS MESSAGE
        setTimeout(() => {
          const successElement = document.querySelector('.alert-success');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setSubmitStatus('error');
      setErrors({ 
        general: error.message || 'Failed to send message. Please try again or contact us directly.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Enhanced Hero Section */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-pattern"></div>
        
        <div className="hero-content">
          <div className="hero-center">
            <div className="status-indicator">
              <div className={`status-dot ${isBusinessOpen() ? 'open' : 'closed'}`}></div>
              <span className="status-text">
                {isBusinessOpen() ? 'We\'re Open Now!' : 'Currently Closed'}
              </span>
            </div>
            
            <h1 className="hero-title">
              Get in <span className="hero-accent">Touch</span>
            </h1>
            
            <p className="hero-subtitle">
              Ready to transform your space with our eco-friendly cleaning services in Pitești? 
              Let's discuss how we can help you maintain a spotless, healthy environment.
            </p>
            
            <div className="hero-badges">
              <div className="hero-badge">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>4.9/5 Customer Rating</span>
              </div>
              <div className="hero-badge">
                <Users className="w-5 h-5 text-green-300" />
                <span>1000+ Happy Clients</span>
              </div>
              <div className="hero-badge">
                <Award className="w-5 h-5 text-blue-300" />
                <span>5 Years Excellence</span>
              </div>
            </div>

            <div className="hero-actions">
              <a href="#contact-form" className="btn btn-primary">
                Get Free Quote
              </a>
              <a href="tel:+40722123456" className="btn btn-secondary">
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-content">
          <h2 className="stats-title">Trusted by Thousands</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Cleanings Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Info Cards */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className={`info-icon ${info.color}`}>
                {info.icon}
              </div>
              
              <h3 className="info-title">{info.title}</h3>
              
              <div className="info-details">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="info-detail">
                    {info.action ? (
                      <a href={info.action} className="info-link">{detail}</a>
                    ) : (
                      detail
                    )}
                  </p>
                ))}
              </div>
              
              <p className="info-description">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="main-content">
        <div className="content-grid">
          
          {/* Enhanced Contact Form */}
          <div id="contact-form" className="form-section">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">Send us a Message</h2>
                <p className="form-subtitle">
                  Fill out the form below and we'll get back to you within 2 hours during business hours
                </p>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <CheckCircle className="alert-icon" />
                  <div>
                    <h4 className="alert-title">Message sent successfully!</h4>
                    <p className="alert-message">
                      Thank you for contacting us! We've received your message and will respond within 2 hours during business hours.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error" style={{
                  backgroundColor: '#fee2e2',
                  borderColor: '#fecaca',
                  color: '#dc2626'
                }}>
                  <AlertTriangle className="alert-icon" />
                  <div>
                    <h4 className="alert-title">Failed to send message</h4>
                    <p className="alert-message">
                      {errors.general || 'There was a problem sending your message. Please try again or contact us directly.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Show general form errors */}
              {errors.general && submitStatus !== 'error' && (
                <div className="alert alert-error" style={{
                  backgroundColor: '#fee2e2',
                  borderColor: '#fecaca',
                  color: '#dc2626',
                  marginBottom: '1rem'
                }}>
                  <AlertTriangle className="alert-icon" />
                  <p className="alert-message">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                {/* Two-column layout for larger forms */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                    />
                    {errors.name && <span className="error-message">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.name}
                    </span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && <span className="error-message">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.email}
                    </span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="+40 722 123 456"
                      disabled={isSubmitting}
                    />
                    {errors.phone && <span className="error-message">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.phone}
                    </span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company (Optional)</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Your Company Name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-row-three">
                  <div className="form-group">
                    <label className="form-label">Service Needed</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a service</option>
                      {serviceTypes.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Property Size</label>
                    <select
                      name="propertySize"
                      value={formData.propertySize}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      <option value="">Select size</option>
                      {propertyTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      name="cleaningFrequency"
                      value={formData.cleaningFrequency}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      <option value="">Select frequency</option>
                      {frequencyOptions.map((freq, index) => (
                        <option key={index} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                    placeholder="Apartment cleaning quote request"
                    disabled={isSubmitting}
                  />
                  {errors.subject && <span className="error-message">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.subject}
                  </span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Please describe your cleaning needs in detail..."
                    disabled={isSubmitting}
                    rows="5"
                  />
                  {errors.message && <span className="error-message">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.message}
                  </span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Contact Method</label>
                  <div className="radio-group">
                    {[
                      { value: 'email', icon: '📧', label: 'Email' },
                      { value: 'phone', icon: '📞', label: 'Phone Call' },
                      { value: 'whatsapp', icon: '💬', label: 'WhatsApp' }
                    ].map((option) => (
                      <label key={option.value} className={`radio-option ${formData.preferredContact === option.value ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="preferredContact"
                          value={option.value}
                          checked={formData.preferredContact === option.value}
                          onChange={handleInputChange}
                          className="radio-input"
                          disabled={isSubmitting}
                        />
                        <span className="radio-emoji">{option.icon}</span>
                        <span className="radio-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <div className="radio-group">
                    {[
                      { value: 'normal', icon: '📝', label: 'Normal' },
                      { value: 'high', icon: '⚠️', label: 'High Priority' },
                      { value: 'urgent', icon: '🚨', label: 'Urgent' }
                    ].map((option) => (
                      <label key={option.value} className={`radio-option ${formData.urgency === option.value ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="urgency"
                          value={option.value}
                          checked={formData.urgency === option.value}
                          onChange={handleInputChange}
                          className="radio-input"
                          disabled={isSubmitting}
                        />
                        <span className="radio-emoji">{option.icon}</span>
                        <span className="radio-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" />
                      Send Message
                      <ArrowRight className="btn-icon" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="sidebar">
            
            {/* Quick Contact */}
            <div className="quick-contact">
              <h3 className="sidebar-title">
                <Zap className="title-icon" />
                Quick Contact
              </h3>
              
              <div className="quick-contact-list">
                <a href="tel:+40748123456" className="quick-contact-item phone">
                  <div className="contact-icon">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Call Now</span>
                    <span className="contact-value">+40 748 123 456</span>
                  </div>
                </a>
                
                <a href="mailto:hello@eco-cleaning-pitesti.com" className="quick-contact-item email">
                  <div className="contact-icon">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Email Us</span>
                    <span className="contact-value">hello@eco-cleaning-pitesti.com</span>
                  </div>
                </a>
                
                <a href="https://wa.me/40748123456" className="quick-contact-item whatsapp" target="_blank" rel="noopener noreferrer">
                  <div className="contact-icon">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">WhatsApp</span>
                    <span className="contact-value">Instant Message</span>
                  </div>
                </a>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h4 className="social-title">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Follow Us
                </h4>
                <div className="social-links">
                  <a href="#" className="social-link facebook">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="social-link instagram">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="social-link website">
                    <Globe className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="business-hours">
              <h3 className="sidebar-title">
                <Clock className="title-icon" />
                Business Hours
              </h3>
              
              <div className="hours-list">
                <div className="hours-item">
                  <span className="day">Monday - Friday</span>
                  <span className="time">8:00 AM - 6:00 PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Saturday</span>
                  <span className="time">9:00 AM - 3:00 PM</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sunday</span>
                  <span className="time closed">Closed</span>
                </div>
              </div>
              
              <div className="emergency-notice">
                <Shield className="w-5 h-5 text-orange-500" />
                <div>
                  <strong>Emergency Services:</strong>
                  <p>Available 24/7 for urgent cleaning needs</p>
                </div>
              </div>
            </div>

            {/* Testimonial Section */}
            <div className="testimonial-section">
              <h3 className="sidebar-title">
                <Star className="title-icon" />
                What Clients Say
              </h3>
              
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "Exceptional service! They transformed our office space in Pitești and maintain it perfectly. 
                  The eco-friendly approach is exactly what we needed."
                </p>
                <div className="testimonial-author">
                  <strong>Maria Ionescu</strong>
                  <span>Business Owner, Pitești</span>
                </div>
              </div>
              
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "Professional, reliable, and thorough. I've been using their services in Trivale for 2 years 
                  and couldn't be happier!"
                </p>
                <div className="testimonial-author">
                  <strong>Alexandru Popescu</strong>
                  <span>Apartment Owner, Trivale</span>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div className="service-areas">
              <h3 className="sidebar-title">
                <MapPin className="title-icon" />
                Service Areas
              </h3>
              
              <div className="areas-list">
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Centru - Bulevardul Republicii</span>
                </div>
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Nord - Trivale, Războieni</span>
                </div>
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Sud - Gavana, Bradu</span>
                </div>
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Est - Craiovei, Exercițiu</span>
                </div>
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Vest - Calea Craiovei</span>
                </div>
                <div className="area-item">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Periferie - Ștefănești, Mioveni</span>
                </div>
              </div>
              
              <div className="coverage-note">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <strong>Full Coverage:</strong>
                  <p>We serve all areas of Pitești plus surrounding localities like Mioveni, Ștefănești, Bradu, and Câmpulung area.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h3 className="sidebar-title">
                <HelpCircle className="title-icon" />
                Frequently Asked
              </h3>
              
              <div className="faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <button 
                      className={`faq-question ${expandedFaq === index ? 'expanded' : ''}`}
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`faq-chevron ${expandedFaq === index ? 'rotated' : ''}`} />
                    </button>
                    {expandedFaq === index && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-content">
          <h2 className="section-title">Find Us</h2>
          <p className="section-subtitle">
            Visit our headquarters in the heart of Pitești. We serve the entire metropolitan area 
            and surrounding regions with our eco-friendly cleaning services.
          </p>
          
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.8357678145924!2d24.8666477635691!3d44.8564797135799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b2c87da9c5a7%3A0x7b6de82c28ae5af!2sCalea%20Craiovei%2C%20Pitești%2C%20Romania!5e0!3m2!1sen!2sus!4v1703083234567!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '24px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="google-map"
            />
          </div>
          
          <div className="map-info-grid">
            <div className="map-info-item">
              <MapPin className="map-info-icon address" />
              <h4>Address</h4>
              <p>Calea Craiovei<br />Pitești, Argeș</p>
            </div>
            <div className="map-info-item">
              <Clock className="map-info-icon service" />
              <h4>Service Area</h4>
              <p>Pitești & surrounding<br />Argeș County area</p>
            </div>
            <div className="map-info-item">
              <Timer className="map-info-icon response" />
              <h4>Response Time</h4>
              <p>Same day service<br />available in most areas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;