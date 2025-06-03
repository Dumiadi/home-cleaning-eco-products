import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel } from 'react-bootstrap';
import './TestimonialSlider.css';

const testimonials = [
  {
    id: 1,
    name: 'Andreea M.',
    feedback: 'Servicii de curățenie impecabile! Produsele eco sunt fantastice. Recomand cu drag!',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    name: 'Cristian D.',
    feedback: 'Foarte mulțumit! Rapiditate, seriozitate și produse care miros super natural.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    name: 'Elena P.',
    feedback: 'Am apelat pentru o curățenie generală. Totul a fost strălucitor și fără chimicale puternice!',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];

function TestimonialSlider() {
  return (
    <section className="testimonials-section py-5">
      <div className="container">
        <h2 className="text-center mb-5">Ce spun clienții noștri</h2>
        <Carousel indicators={false} interval={4000}>
          {testimonials.map(testimonial => (
            <Carousel.Item key={testimonial.id}>
              <div className="d-flex flex-column align-items-center">
                <img 
                  className="rounded-circle shadow mb-4"
                  src={testimonial.image}
                  alt={testimonial.name}
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
                <h5>{testimonial.name}</h5>
                <p className="text-muted text-center px-3" style={{ maxWidth: '600px' }}>
                  "{testimonial.feedback}"
                </p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export default TestimonialSlider;
