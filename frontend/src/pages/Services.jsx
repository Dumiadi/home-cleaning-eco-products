import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Services.css';

const servicesData = [
  {
    id: 1,
    name: 'Curățenie Generală',
    description: 'Curățenie completă pentru apartamente sau case: aspirare, șters praf, spălat geamuri.',
    price: '200 RON'
  },
  {
    id: 2,
    name: 'Curățenie după Constructor',
    description: 'Îndepărtarea prafului de șantier, spălare intensă a podelelor, igienizare completă.',
    price: '350 RON'
  },
  {
    id: 3,
    name: 'Curățenie Birouri',
    description: 'Curățenie profesională pentru spații de birouri, programabilă după orar.',
    price: '150 RON'
  },
  {
    id: 4,
    name: 'Curățenie Rapidă',
    description: 'Serviciu rapid pentru întreținere zilnică sau săptămânală a locuinței.',
    price: '120 RON'
  },
  {
    id: 5,
    name: 'Curățenie După Petreceri',
    description: 'Curățenie completă după evenimente sau petreceri, inclusiv spălare veselă și podele.',
    price: '250 RON'
  },
  {
    id: 6,
    name: 'Curățenie Frigorifică',
    description: 'Curățare profesională pentru frigidere, congelatoare și camere frigorifice.',
    price: '180 RON'
  }
];

function Services() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);

    const handleStorageChange = () => {
      const isDarkNow = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDarkNow);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleBooking = () => {
    navigate('/booking');
  };

  return (
    <div className={`services-page py-5 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="container">
        <h2 className="text-center mb-5">Serviciile Noastre</h2>
        <div className="row">
          {servicesData.map(service => (
            <div 
              key={service.id} 
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
            >
              <div className={`card service-card h-100 shadow-sm ${darkMode ? 'bg-secondary text-light' : 'bg-white text-dark'}`}>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{service.name}</h5>
                  <p className="card-text flex-grow-1">{service.description}</p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="fw-bold">{service.price}</span>
                    <button className="btn btn-warning" onClick={handleBooking}>Programează</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;
