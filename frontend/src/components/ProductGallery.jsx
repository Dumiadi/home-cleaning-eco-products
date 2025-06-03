import React, { useEffect, useState } from 'react';
import './ProductGallery.css';

function ProductGallery() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/products')
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 6))); // primele 6 produse
  }, []);

  return (
    <section className="py-5 gallery-section">
      <div className="container">
        <h2 className="text-center mb-4">🌿 Produse Eco Recomandate</h2>
        <div className="row">
          {products.map(prod => (
            <div key={prod.id} className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={prod.image.replace('/upload/', '/upload/w_400,h_300,c_fill/')}
                  className="card-img-top"
                  alt={prod.name}
                />
                <div className="card-body text-center">
                  <h6 className="card-title mb-1">{prod.name}</h6>
                  <p className="text-muted small mb-1">{prod.category}</p>
                  <strong>{prod.price} RON</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-3">
          <a href="/galerie" className="btn btn-outline-success">Vezi toate produsele →</a>
        </div>
      </div>
    </section>
  );
}

export default ProductGallery;
