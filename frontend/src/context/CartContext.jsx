import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const sendConfirmationEmail = (order) => {
    fetch('http://localhost:5000/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: order.user.name,
        address: order.user.address,
        phone: order.user.phone,
        items: order.items,
        total: order.total,
        email: order.user.email // emailul introdus de client
      })
    })
    .then(response => {
      if (response.ok) {
        console.log('Email de confirmare trimis cu succes!');
      } else {
        console.error('Eroare la trimitere email.');
      }
    })
    .catch(error => console.error('Eroare:', error));
  };

  const placeOrder = (userData) => {
    const newOrder = {
      id: Date.now(),
      user: userData,
      items: cartItems,
      total: cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0),
      date: new Date().toLocaleString()
    };

    // Salvăm comanda în backend
    fetch('http://localhost:5000/new-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); // "Comandă salvată cu succes!"
      
      sendConfirmationEmail(newOrder); // TRIMITE EMAIL după salvare
      clearCart(); // Golește coșul după comandă
    })
    .catch(error => console.error('Eroare la salvarea comenzii:', error));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, placeOrder }}>
      {children}
    </CartContext.Provider>
  );
};
