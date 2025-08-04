import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, Leaf, Shield, Heart, Users, Award, Zap, Globe,
  ArrowRight, Star, CheckCircle, Play, Phone, Mail, MapPin,
  Clock, TreePine, Droplets, Wind, Recycle, Home, Car,
  Building, Calendar, Camera, Eye, Target, Lightbulb,
  TrendingUp, Cpu, Wifi, Smartphone, ChevronDown, Quote,
  X, MessageCircle, Send, Download, Share2, Filter,
  Calculator, ThumbsUp, Video, Image, FileText, Bell
} from 'lucide-react';

const EcoCleanEnhanced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSection, setVisibleSection] = useState(0);
  const [currentStat, setCurrentStat] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  // State pentru chat cu răspunsuri rapide
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Bună! 👋 Sunt asistentul virtual EcoClean. Te pot ajuta cu informații despre serviciile noastre eco-friendly. Ce te interesează?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [notification, setNotification] = useState('');
  const heroRef = useRef(null);

  // Date pentru booking
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Date pentru calculator preț
  const [priceData, setPriceData] = useState({
    serviceType: 'residential',
    roomCount: 1,
    frequency: 'once',
    extras: []
  });

 const stats = [
    { number: '25,000+', label: 'Happy Families', icon: <Heart className="w-8 h-8" />, color: 'emerald' },
    { number: '98,000+', label: 'Cleaned Homes', icon: <Home className="w-8 h-8" />, color: 'green' },
    { number: '99.8%', label: 'Eco Products', icon: <Leaf className="w-8 h-8" />, color: 'teal' },
    { number: '4.9★', label: 'Average Rating', icon: <Star className="w-8 h-8" />, color: 'yellow' }
];
 const services = [
    {
      icon: <Home className="w-12 h-12" />,
      title: 'Residential Cleaning',
      description: 'Houses and apartments cleaned with 100% eco-friendly products',
      features: ['Deep Cleaning', 'Regular Maintenance', 'Move-In/Out'],
      color: 'emerald',
      basePrice: 120
    },
    {
      icon: <Building className="w-12 h-12" />,
      title: 'Commercial Cleaning',
      description: 'Offices and commercial premises with impeccable standards',
      features: ['Flexible Schedule', 'Professional Equipment', 'High Standards'],
      color: 'blue',
      basePrice: 200
    },
    {
      icon: <Car className="w-12 h-12" />,
      title: 'Eco Auto Detailing',
      description: 'Shiny cars without harmful substances',
      features: ['Premium Exterior', 'Interior Detailing', 'Ceramic Protection'],
      color: 'purple',
      basePrice: 150
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Special Services',
      description: 'After-construction, events, cleaning after renovations',
      features: ['Post-Construction', 'Events', 'Disinfection'],
      color: 'pink',
      basePrice: 300
    }
  ];

  // Funcții pentru notificări
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Funcții de navigare și acțiuni
 const handleLearnMore = (serviceName) => {
  // Direct navigation to services page
  navigate('/services', {
    state: { 
      selectedService: serviceName 
    }
  });
};

  const handleWatchDemo = () => {
    setIsVideoPlaying(true);
  };

  const handleBookNow = (service = '') => {
    setBookingData(prev => ({ ...prev, service }));
    setShowBookingModal(true);
  };

  const handleCallNow = () => {
    window.open('tel:+40800326253', '_self');
    showNotification('Calling +40723927689');
  };

  const handleEmailContact = () => {
    window.open('mailto:contact@ecoclean.ro?subject=Information Request', '_self');
    showNotification('Opening email application...');
  };

  const goToContact = () => {
    setShowContactModal(true);
  };

  const handleSharePage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'EcoClean Romania - 100% Eco Cleaning',
        text: 'First eco-friendly cleaning service in Romania',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link copied to clipboard!');
    }
  };

  const handleDownloadBrochure = () => {
    showNotification('Downloading brochure...');
    // Simulate download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = 'EcoClean-Brochure.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Brochure downloaded successfully!');
    }, 1500);
  };

  // Booking functions
  const handleBookingSubmit = () => {
    if (!bookingData.service || !bookingData.date || !bookingData.time || !bookingData.address || !bookingData.phone || !bookingData.email) {
      showNotification('Please complete all required fields.');
      return;
    }
    showNotification('Booking submitted successfully! We will contact you shortly.');
    setShowBookingModal(false);
    setBookingData({
      service: '',
      date: '',
      time: '',
      address: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  // Funcții pentru chat bot cu răspunsuri inteligente
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Întrebări despre preturi și tarife
    if (message.includes('pret') || message.includes('tarif') || message.includes('cost') || message.includes('bani')) {
      return 'Prețurile noastre încep de la 120 RON pentru curățenie rezidențială. Folosește calculatorul de preț pentru o estimare exactă sau programează o vizită gratuită pentru estimare personalizată!';
    }
    
    // Întrebări despre servicii
    if (message.includes('servicii') || message.includes('ce faceți') || message.includes('ce oferiti')) {
      return 'Oferim: Curățenie Rezidențială (case/apartamente), Curățenie Comercială (birouri), Detailing Auto Eco și Servicii Speciale (post-construcție, evenimente). Toate cu produse 100% eco-friendly!';
    }
    
    // Întrebări despre produse eco
    if (message.includes('eco') || message.includes('mediu') || message.includes('toxic') || message.includes('chimice')) {
      return 'Suntem prima companie din România 100% eco-friendly! Folosim doar produse certificate EU Ecolabel, fără substanțe toxice. Chiar plantăm câte un copac pentru fiecare comandă! 🌱';
    }
    
    // Întrebări despre programare
    if (message.includes('programare') || message.includes('rezervare') || message.includes('cand') || message.includes('orar')) {
      return 'Programările se pot face 24/7 prin platformă sau telefonic. Lucrăm Luni-Duminică 8:00-20:00. Răspunsul nostru este garantat în 30 de minute!';
    }
    
    // Întrebări despre contact
    if (message.includes('telefon') || message.includes('contact') || message.includes('număr')) {
      return 'Ne poți contacta la: 📞 0800-ECO-CLEAN (gratuit), 📧 contact@ecoclean.ro sau prin chat aici. Suntem disponibili 24/7 pentru urgențe!';
    }
    
    // Întrebări despre zonă/livraRE
    if (message.includes('zona') || message.includes('sector') || message.includes('bucurești') || message.includes('ilfov')) {
      return 'Deservim întreaga zonă București și Ilfov! Pentru alte județe, verifică disponibilitatea - ne extindem rapid în toată țara. Transport gratuit în raza de 25km!';
    }
    
    // Întrebări despre garanții
    if (message.includes('garantie') || message.includes('asigurare') || message.includes('probleme')) {
      return 'Oferim garanție 100% satisfacție! Dacă nu ești mulțumit, refacem gratuit în 24h. Suntem asigurați pentru daune și avem certificări EU pentru toate produsele.';
    }
    
    // Întrebări despre timp/durată
    if (message.includes('timp') || message.includes('durata') || message.includes('cat dureaza') || message.includes('ore')) {
      return 'Durata depinde de serviciu: Apartament 2-3h, Casă 4-6h, Birou 2-4h, Auto 2-3h. Echipele noastre sunt rapide și eficiente, fără compromisuri la calitate!';
    }
    
    // Întrebări despre plata
    if (message.includes('plata') || message.includes('card') || message.includes('cash') || message.includes('factura')) {
      return 'Accepți plata cash, card, transfer bancar sau factura pentru firme. Plata se face după finalizarea serviciului și confirmarea ta că totul este perfect!';
    }
    
    // Întrebări despre echipa
    if (message.includes('echipa') || message.includes('angajati') || message.includes('personal') || message.includes('cine vine')) {
      return 'Echipele noastre sunt formate din specialiști instruiți și verificați, cu experiență min. 2 ani. Toți au certificări eco și uniformă EcoClean. Primești informații despre echipă cu o zi înainte!';
    }
    
    // Întrebări despre urgente
    if (message.includes('urgent') || message.includes('acum') || message.includes('azi') || message.includes('imediat')) {
      return 'Pentru urgențe avem echipe disponibile și în weekend! Sună la 0800-ECO-CLEAN și îți găsim o soluție în maxim 2 ore. Taxa de urgență: +30 RON.';
    }
    
    // Întrebări despre COVID/dezinfectie
    if (message.includes('covid') || message.includes('dezinfectie') || message.includes('virus') || message.includes('siguranta')) {
      return 'Oferim servicii complete de dezinfecție cu produse certificate virucide! Echipele poartă echipament de protecție și respectă toate protocoalele sanitare.';
    }
    
    // Întrebări despre abonamente
    if (message.includes('abonament') || message.includes('saptamanal') || message.includes('lunar') || message.includes('regulat')) {
      return 'Abonamentele îți aduc discount: 10% pentru curățenie săptămânală, 20% pentru cea lunară! Plus servicii prioritare și echipă dedicată.';
    }
    
    // Salutări
    if (message.includes('salut') || message.includes('buna') || message.includes('hello') || message.includes('hi')) {
      return 'Bună! 👋 Sunt asistentul virtual EcoClean. Te pot ajuta cu informații despre serviciile noastre eco-friendly. Ce te interesează?';
    }
    
    // Mulțumiri
    if (message.includes('multumesc') || message.includes('mersi') || message.includes('thanks')) {
      return 'Cu plăcere! 😊 Pentru mai multe detalii sau programări, sună la 0800-ECO-CLEAN sau folosește butonul "Rezervă Acum". O zi frumoasă!';
    }
    
    // La revedere
    if (message.includes('pa') || message.includes('bye') || message.includes('revedere')) {
      return 'La revedere! 👋 Te așteptăm să transformăm casa ta într-un paradis eco! Nu uita: 0800-ECO-CLEAN pentru programări rapide.';
    }
    
    // Întrebări despre diferența față de concurență
    if (message.includes('diferit') || message.includes('concurenta') || message.includes('de ce') || message.includes('avantaj')) {
      return 'Suntem unicii 100% eco în România! Certificate EU, carbon neutral, plantăm copaci, garanție satisfacție și preturi corecte. Sănătatea ta și a planetei pe primul loc! 🌍';
    }
    
    // Pentru întrebări neînțelese
    const defaultResponses = [
      'Nu sunt sigur că înțeleg întrebarea. Poți să o reformulezi? Sau sună la +40723927689 pentru asistență directă.',
      'Pentru această întrebare specifică, te rog să contactezi echipa noastră la +40723927689. Sunt disponibili 24/7!',
      'Îmi pare rău, nu am putut să înțeleg. Te pot ajuta cu informații despre servicii, prețuri, programări sau zone de acoperire.',
      'Pentru detalii mai specifice, recomand să vorbești direct cu un consultant la +40723927689. În ce altceva te pot ajuta?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { type: 'user', message: currentMessage }]);
    setShowQuickReplies(false);
    
    // Răspuns inteligent bazat pe mesaj
    setTimeout(() => {
      const response = getBotResponse(currentMessage);
      setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
    }, 800);
    
    setCurrentMessage('');
  };

  const handleQuickReply = (message) => {
    setChatMessages(prev => [...prev, { type: 'user', message }]);
    setShowQuickReplies(false);
    
    setTimeout(() => {
      const response = getBotResponse(message);
      setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
    }, 800);
  };

  const quickReplies = [
    "Care sunt prețurile?",
    "Ce servicii oferiți?", 
    "Unde găsesc numărul de telefon?",
    "Programare urgentă",
    "Sunt produsele eco?"
  ];

  // Calculator preț
  const calculatePrice = () => {
    let basePrice = 120; // preț de bază
    
    if (priceData.serviceType === 'commercial') basePrice = 200;
    if (priceData.serviceType === 'auto') basePrice = 150;
    if (priceData.serviceType === 'special') basePrice = 300;
    
    let total = basePrice * priceData.roomCount;
    
    if (priceData.frequency === 'weekly') total *= 0.9;
    if (priceData.frequency === 'monthly') total *= 0.8;
    
    priceData.extras.forEach(extra => {
      if (extra === 'deep') total += 50;
      if (extra === 'windows') total += 30;
      if (extra === 'appliances') total += 40;
    });
    
    return Math.round(total);
  };

  // Effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const sections = document.querySelectorAll('.about-section');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          setVisibleSection(index);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 4000);

    const statInterval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % stats.length);
    }, 3000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(statInterval);
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: '1.6',
      color: '#1f2937',
      background: '#ffffff',
      overflowX: 'hidden',
      scrollBehavior: 'smooth',
      paddingTop: '60px'
    }}>
      {/* Custom Cursor */}
      <div 
        style={{
          position: 'fixed',
          width: '20px',
          height: '20px',
          background: 'linear-gradient(135deg, #10b981, #22c55e)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.7,
          transform: `translate(${mousePosition.x - 10}px, ${mousePosition.y - 10}px)`,
          transition: 'transform 0.1s ease',
          mixBlendMode: 'difference'
        }}
      />

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #22c55e)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Bell className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Video Demo Modal */}
      {isVideoPlaying && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setIsVideoPlaying(false)}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #22c55e)',
              color: 'white',
              padding: '3rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <Play className="w-16 h-16 mx-auto mb-4" />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Demo Video EcoClean
              </h3>
              <p>See how we transform your home!</p>
            </div>
            <button onClick={() => setIsVideoPlaying(false)} style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                Book now
              </h3>
              <button onClick={() => setShowBookingModal(false)} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Service
                </label>
                <select 
                  value={bookingData.service}
                  onChange={(e) => setBookingData(prev => ({ ...prev, service: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a service</option>
                  <option value="residential">Residential Cleaning</option>
                  <option value="commercial">Commercial Cleaning</option>
                  <option value="auto">Auto Detailing</option>
                  <option value="special">Special Services</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Data
                  </label>
                  <input 
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Hour
                  </label>
                  <input 
                    type="time"
                    value={bookingData.time}
                    onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Adress
                </label>
                <input 
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Strada, numărul, sector/oraș"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Phone
                  </label>
                  <input 
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0700 000 000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Email
                  </label>
                  <input 
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Comments (optional)
                </label>
                <textarea 
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalii suplimentare despre serviciul dorit..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <button onClick={handleBookingSubmit} style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Calendar className="w-5 h-5" />
                Send Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                Contact us
              </h3>
              <button onClick={() => setShowContactModal(false)} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={handleCallNow} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%'
              }}>
                <Phone className="w-5 h-5" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>Call now</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>+40 723 927 689</div>
                </div>
              </button>
              
              <button onClick={handleEmailContact} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%'
              }}>
                <Mail className="w-5 h-5" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>Trimite email</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>contact@ecoclean.ro</div>
                </div>
              </button>
              
              <button onClick={() => setShowChatBot(true)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%'
              }}>
                <MessageCircle className="w-5 h-5" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>Chat Online</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Asistent virtual 24/7</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bot */}
      {showChatBot && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #10b981, #22c55e)',
            color: 'white',
            borderRadius: '1rem 1rem 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>EcoClean Asistent</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>🟢 Online</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  setShowQuickReplies(true);
                  setChatMessages([{ type: 'bot', message: 'Bună! 👋 Sunt asistentul virtual EcoClean. Te pot ajuta cu informații despre serviciile noastre eco-friendly. Ce te interesează?' }]);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
                title="Restart chat"
              >
                🔄
              </button>
              <button onClick={() => setShowChatBot(false)} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.25rem',
                cursor: 'pointer',
                color: 'white'
              }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem',
                  borderRadius: msg.type === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  background: msg.type === 'user' ? '#10b981' : '#f3f4f6',
                  color: msg.type === 'user' ? 'white' : '#1f2937',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {msg.message}
                </div>
              </div>
            ))}
            
            {showQuickReplies && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: '0.5rem'
                }}>
                  Frequently Asked Questions:
                </div>
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '1rem',
                      color: '#1f2937',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#10b981';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Scrie mesajul tău..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button onClick={handleSendMessage} style={{
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <button
                onClick={handleCallNow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                <Phone className="w-3 h-3" />
                +40 723 927 689
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setShowChatBot(false);
                  handleBookNow();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                <Calendar className="w-3 h-3" />
                Book quickly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Calculator Modal */}
      {showPriceCalculator && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                Price Calculator
              </h3>
              <button onClick={() => setShowPriceCalculator(false)} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Type of service
              </label>
              <select 
                value={priceData.serviceType}
                onChange={(e) => setPriceData(prev => ({ ...prev, serviceType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="residential">Residential (120 RON)</option>
                <option value="commercial">Comercial (200 RON)</option>
                <option value="auto">Auto (150 RON)</option>
                <option value="special">Special (300 RON)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Number of rooms/areas: {priceData.roomCount}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={priceData.roomCount}
                onChange={(e) => setPriceData(prev => ({ ...prev, roomCount: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Frequency
              </label>
              <select 
                value={priceData.frequency}
                onChange={(e) => setPriceData(prev => ({ ...prev, frequency: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="once">Once</option>
                <option value="weekly">Weekly (-10%)</option>
                <option value="monthly">Monthly (-20%)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Additional services
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { key: 'deep', label: 'Deep Cleaning (+50 RON)', price: 50 },
                  { key: 'windows', label: 'Windows (+30 RON)', price: 30 },
                  { key: 'appliances', label: 'Home Appliances (+40 RON)', price: 40 }
                ].map(extra => (
                  <label key={extra.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={priceData.extras.includes(extra.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPriceData(prev => ({ ...prev, extras: [...prev.extras, extra.key] }));
                        } else {
                          setPriceData(prev => ({ ...prev, extras: prev.extras.filter(x => x !== extra.key) }));
                        }
                      }}
                    />
                    {extra.label}
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #22c55e)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                Preț estimat
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {calculatePrice()} RON
              </div>
            </div>
            
            <button onClick={() => {
              setShowPriceCalculator(false);
              handleBookNow();
            }} style={{
              width: '100%',
              padding: '1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Book with this price
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
        position: 'relative',
        padding: '2rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: '4rem',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          <div style={{ zIndex: 10, position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '9999px',
              marginBottom: '2rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <Leaf style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
              <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#10b981', letterSpacing: '0.05em' }}>
                100% ECO-CERTIFIED - CARBON NEUTRAL - EU APPROVED
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: '900',
              lineHeight: '0.9',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ color: '#1f2937', opacity: 0.8 }}>About</span>
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))'
              }}>EcoClean</span>
              <span style={{ color: '#6b7280', fontSize: '0.6em', fontWeight: '400', marginTop: '0.5rem' }}>
                Romania
              </span>
            </h1>

            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.7',
              color: '#6b7280',
              marginBottom: '3rem',
              maxWidth: '36rem'
            }}>
              The first cleaning platform{" "}
              <span style={{ color: '#10b981', fontWeight: '600' }}>100% eco-friendly</span>{" "}
              from Romania that{" "}
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>revolutionizing</span>{" "}
              the industry by{" "}
              <span style={{ color: '#8b5cf6', fontWeight: '600' }}>advanced technology</span>{" "}
              and{" "}
              <span style={{ color: '#10b981', fontWeight: '600' }}>total respect for the environment</span>.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 640 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: currentStat === index ? 'linear-gradient(135deg, #10b981, #22c55e)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    transition: 'all 0.3s ease',
                    transform: currentStat === index ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: currentStat === index ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : 'none',
                    color: currentStat === index ? 'white' : '#1f2937'
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', opacity: 0.8 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <Heart className="w-5 h-5" />
                <span>Our Story</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button onClick={handleWatchDemo} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                backdropFilter: 'blur(10px)'
              }}>
                <Play className="w-5 h-5" />
                <span>View Demo</span>
              </button>
              
              <button onClick={() => setShowPriceCalculator(true)} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                backdropFilter: 'blur(10px)'
              }}>
                <Calculator className="w-5 h-5" />
                <span>Price Calculator</span>
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{
              position: 'relative',
              borderRadius: '2rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=400&fit=crop" 
                alt="Echipa de curățenie eco"
                style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '2rem' }}
              />
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                color: 'white',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.875rem',
                letterSpacing: '0.05em'
              }}>
                ECO CERTIFICAT
              </div>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6b7280',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            Discover Our Story
          </span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 1000
      }}>
        <button onClick={() => setShowChatBot(true)} style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #22c55e)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MessageCircle className="w-6 h-6" />
        </button>
        
        <button onClick={handleCallNow} style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Phone className="w-6 h-6" />
        </button>
        
        <button onClick={handleSharePage} style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div style={{
        position: 'fixed',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        background: 'white',
        borderRadius: '2rem',
        padding: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <button onClick={() => handleBookNow()} title="Rezervă acum" style={{
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #10b981, #22c55e)',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Calendar className="w-5 h-5" />
        </button>
        
        <button onClick={() => setShowPriceCalculator(true)} title="Calculator preț" style={{
          padding: '0.75rem',
          background: '#f3f4f6',
          color: '#1f2937',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Calculator className="w-5 h-5" />
        </button>
        
        <button onClick={goToContact} title="Contact" style={{
          padding: '0.75rem',
          background: '#f3f4f6',
          color: '#1f2937',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Mail className="w-5 h-5" />
        </button>
        
        <button onClick={handleDownloadBrochure} title="Descarcă broșură" style={{
          padding: '0.75rem',
          background: '#f3f4f6',
          color: '#1f2937',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Simplified Story Section */}
      <section id="story" style={{
        padding: '6rem 0',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '9999px',
              color: '#10b981',
              fontWeight: '600',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem'
            }}>
              <Target className="w-4 h-4" />
              <span>Our Story</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              color: '#1f2937'
            }}>
              It all started with a{" "}
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>simple promise</span>
            </h2>

            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '48rem',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              In 2019, while cleaning the house with traditional products, my 3-year-old granddaughter had an asthma attack. 
              The doctor told us that cleaning chemicals can be triggers.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(34, 197, 94, 0.05))',
            borderLeft: '4px solid #10b981',
            padding: '2rem',
            margin: '2rem 0',
            borderRadius: '0 1rem 1rem 0',
            position: 'relative',
            textAlign: 'center'
          }}>
            <Quote style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              width: '2rem',
              height: '2rem',
              color: '#10b981',
              opacity: 0.3
            }} />
            <blockquote style={{
              fontSize: '1.5rem',
              fontStyle: 'italic',
              color: '#1f2937',
              margin: '0 0 1rem 0',
              paddingLeft: '2rem'
            }}>
              "If it's not safe enough for my family, it's not good enough for your family."
            </blockquote>
            <cite style={{
              fontSize: '1rem',
              color: '#6b7280',
              fontWeight: '500',
              paddingLeft: '2rem'
            }}>
              - Andrei Dumitrascu, Fondator EcoClean
            </cite>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <Award style={{ width: '3rem', height: '3rem', color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                First EU Certification
              </h3>
              <p style={{ color: '#6b7280' }}>
                First EU Ecolabel certification in Romania
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <Shield style={{ width: '3rem', height: '3rem', color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                Zero Chemicals
              </h3>
              <p style={{ color: '#6b7280' }}>
                0% harmful chemicals
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <TreePine style={{ width: '3rem', height: '3rem', color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                Positive Impact
              </h3>
              <p style={{ color: '#6b7280' }}>
                5,000 trees planted for customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Enhanced Functionality */}
      <section style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '9999px',
              color: '#10b981',
              fontWeight: '600',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem'
            }}>
              <Sparkles className="w-4 h-4" />
              <span>Our Services</span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              color: '#1f2937'
            }}>
              Complete solutions for{" "}
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #22c55e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>orice nevoie</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
            gap: '2rem'
          }}>
            {services.map((service, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '1rem',
                  color: '#10b981',
                  marginBottom: '1.5rem'
                }}>
                  {service.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {service.title}
                </h3>
                
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  {service.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#10b981'
                  }}>
                    de la {service.basePrice} RON
                  </span>
                  <button onClick={() => setShowPriceCalculator(true)} style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Calculate price
                  </button>
                </div>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  marginBottom: '2rem'
                }}>
                  {service.features.map((feature, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#6b7280'
                    }}>
                      <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleLearnMore(service.title)} style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <ArrowRight className="w-4 h-4" />
                    View Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #10b981, #22c55e)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '9999px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem'
          }}>
            <Heart className="w-4 h-4" />
            <span>Alătură-te Revoluției Eco</span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '1.5rem'
          }}>
            Ready to transform{" "}
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0 0.5rem',
              borderRadius: '0.5rem'
            }}>home in an eco paradise</span>?
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.9,
            maxWidth: '48rem',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
            Over 2,000 families chose health and sustainability.{" "}
            <strong>When are you joining?</strong>
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            <button onClick={() => handleBookNow()} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              borderRadius: '1rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: 'none',
              background: 'white',
              color: '#10b981',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <Calendar className="w-5 h-5" />
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button onClick={handleCallNow} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              borderRadius: '1rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'transparent',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}>
              <Phone className="w-5 h-5" />
              <span>+40 723 927 689</span>
            </button>
            
            <button onClick={goToContact} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              borderRadius: '1rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'transparent',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}>
              <Mail className="w-5 h-5" />
              <span>Contact Us</span>
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: 0.9
            }}>
              <Shield className="w-5 h-5" />
              <span>100% Satisfaction Guarantee</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: 0.9
            }}>
              <Clock className="w-5 h-5" />
              <span>Answer in 30min</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: 0.9
            }}>
              <Leaf className="w-5 h-5" />
              <span>100% Eco-Friendly</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40%, 43% {
            transform: translateX(-50%) translateY(-10px);
          }
          70% {
            transform: translateX(-50%) translateY(-5px);
          }
          90% {
            transform: translateX(-50%) translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};

export default EcoCleanEnhanced;