import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import AOS from 'aos';
import 'aos/dist/aos.css';

import TestimonialSlider from '../components/TestimonialSlider';
import FaqSection from '../components/FaqSection';

function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('darkMode');
    setDarkMode(mode === 'true');
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className={`home-page ${darkMode ? 'dark' : 'light'}`}>
   
      <section className="hero-section text-center d-flex align-items-center justify-content-center">
        <div className="container">
          <h1 className="hero-title mb-3">Curățenie Eco pentru Casa Ta</h1>
          <p className="hero-subtitle">Servicii profesionale și produse prietenoase cu mediul.</p>
          <Link to="/booking" className="btn btn-book mt-4">Rezervă Acum</Link>

          <div className="scroll-indicator mt-5">
            <span></span>
          </div>
        </div>
      </section>

      
      <section className="benefits-section py-5">
        <div className="container text-center">
          <h2 className="mb-5" data-aos="fade-up">De ce să alegi Curățenie Eco?</h2>
          <div className="row">
            <div className="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="100">
              <div className="benefit-card p-4 shadow-sm rounded">
                <h5>🌿 Produse Eco</h5>
                <p>Folosim doar soluții naturale și prietenoase cu sănătatea ta.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="200">
              <div className="benefit-card p-4 shadow-sm rounded">
                <h5>💼 Echipe Profesioniste</h5>
                <p>Tehnicieni instruiți și servicii de înaltă calitate garantată.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="300">
              <div className="benefit-card p-4 shadow-sm rounded">
                <h5>⏱️ Programare Rapidă</h5>
                <p>Rezervă online în mai puțin de 1 minut, fără apeluri.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    
      <TestimonialSlider />
      <FaqSection />
    </div>
  );
}

export default Home;
