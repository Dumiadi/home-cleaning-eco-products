import React, { useEffect, useState } from 'react';

function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/orders')
      .then(res => res.json())
      .then(data => {
        const productCount = {};

        data.forEach(order => {
          order.items.forEach(item => {
            if (productCount[item.name]) {
              productCount[item.name] += item.quantity;
            } else {
              productCount[item.name] = item.quantity;
            }
          });
        });

        const sortedProducts = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1])
          .map(([name, quantity]) => ({ name, quantity }));

        setTopProducts(sortedProducts);
      })
      .catch(err => console.error('Eroare la aducere produse:', err));
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Top Produse Vândute</h2>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <ul className="list-group shadow">
            {topProducts.map((product, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                {product.name}
                <span className="badge bg-success rounded-pill">{product.quantity} buc</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TopProducts;
