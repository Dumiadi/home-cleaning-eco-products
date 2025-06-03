import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accordion from 'react-bootstrap/Accordion';
import './FaqSection.css';

function FaqSection() {
  return (
    <section className="faq-section py-5">
      <div className="container">
        <h2 className="text-center mb-5">Frequently Asked Questions</h2>
        <Accordion defaultActiveKey="0" flush>
          <Accordion.Item eventKey="0">
            <Accordion.Header>How much does a general cleaning service cost?</Accordion.Header>
            <Accordion.Body>
              Prices start from 200 RON and vary depending on the size and complexity of the space.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>Are your products 100% natural?</Accordion.Header>
            <Accordion.Body>
              Absolutely! We only use eco-friendly products that are free of harsh chemicals — safe for both the environment and your health.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>Do you offer post-construction cleaning?</Accordion.Header>
            <Accordion.Body>
              Yes! It’s one of our most requested services, including deep sanitization and dust removal after renovations.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3">
            <Accordion.Header>Can I book online?</Accordion.Header>
            <Accordion.Body>
              Of course! You can easily schedule a cleaning appointment through the <strong>Booking</strong> page of our platform.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </section>
  );
}

export default FaqSection;
