// Fixed Checkout.js - Remove admin references
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import StepIndicator from '../components/StepIndicator';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please log in to continue with checkout');
      navigate('/login', { 
        state: { 
          from: { pathname: '/checkout' },
          message: 'Please log in to complete your order'
        }
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.info('Your cart is empty. Add some products first!');
      navigate('/products');
      return;
    }
  }, [isAuthenticated, cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateOrderTotals = () => {
    const subtotal = getCartTotal();
    const shipping = subtotal >= 100 ? 0 : 15;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const totals = calculateOrderTotals();
      
      const orderData = {
        id: Date.now(),
        orderId: `ECO-${Date.now()}`,
        user: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: cartItems,
        summary: {
          items: cartItems,
          itemCount: cartItems.length,
          subtotal: parseFloat(totals.subtotal),
          discountedSubtotal: parseFloat(totals.subtotal),
          discount: null,
          shipping: parseFloat(totals.shipping),
          tax: parseFloat(totals.tax),
          total: parseFloat(totals.total),
          freeShippingEligible: parseFloat(totals.shipping) === 0,
          freeShippingRemaining: Math.max(0, 100 - parseFloat(totals.subtotal)),
          isEmpty: false
        },
        total: parseFloat(totals.total),
        subtotal: parseFloat(totals.subtotal),
        shipping: parseFloat(totals.shipping),
        tax: parseFloat(totals.tax),
        discount: null,
        paymentInfo: null,
        date: new Date().toISOString(),
        status: 'pending',
        timestamp: Date.now()
      };

      console.log('🛒 Submitting order:', orderData);

      const response = await fetch('http://localhost:5000/api/orders/new-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Order placed successfully:', result);
        
        // Prepare data for confirmation page
        const orderDetailsForConfirmation = {
          orderId: result.orderId || result.trackingNumber,
          trackingNumber: result.trackingNumber,
          total: parseFloat(totals.total),
          user: orderData.user,
          items: cartItems,
          status: 'pending',
          placedAt: new Date().toISOString()
        };
        
        // Clear cart
        await clearCart();
        
        // Store order data for confirmation page
        localStorage.setItem('lastOrder', JSON.stringify(orderDetailsForConfirmation));
        
        // Success feedback
        toast.success('🎉 Order placed successfully! Check your email for confirmation.');
        
        // Redirect to CUSTOMER confirmation page
        navigate('/confirmare', { 
          state: { orderData: orderDetailsForConfirmation }
        });
        
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
      
    } catch (error) {
      console.error('❌ Order submission error:', error);
      toast.error(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateOrderTotals();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page py-5">
        <div className="container">
          <div className="text-center">
            <h3>Your cart is empty</h3>
            <p>Add some products to continue with checkout</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page py-5">
      <div className="container">
        
        <StepIndicator activeStep={2} />
        
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">🛒 Finalize Order</h3>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmitOrder}>
                  
                  {/* Personal Information */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">📝 Personal Information</h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="fullName" className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="0700 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">📍 Delivery Address</h5>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Full Address *</label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Street, number, city, postal code..."
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">📦 Order Summary</h5>
                    
                    <div className="order-items mb-3">
                      {cartItems.map((item, index) => (
                        <div key={item.id || index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.featured_image_url || item.image} 
                              alt={item.name}
                              className="me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                          </div>
                          <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-totals">
                      <div className="d-flex justify-content-between py-2">
                        <span>Subtotal:</span>
                        <span>${totals.subtotal}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2">
                        <span>Shipping:</span>
                        <span className={parseFloat(totals.shipping) === 0 ? 'text-success fw-bold' : ''}>
                          {parseFloat(totals.shipping) === 0 ? 'FREE' : `$${totals.shipping}`}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-2">
                        <span>Tax (10%):</span>
                        <span>${totals.tax}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between py-2">
                        <strong>Total:</strong>
                        <strong className="text-success">${totals.total}</strong>
                      </div>
                    </div>
                  </div>

                  {/* ✅ CUSTOMER-FOCUSED INFO BOX (NO ADMIN REFERENCE) */}
                  <div className="info-box mb-4 p-3" style={{ background: '#e8f5e8', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                    <h6 className="text-success mb-2">📋 What happens next?</h6>
                    <ul className="list-unstyled mb-0">
                      <li>✅ You'll receive an email confirmation within minutes</li>
                      <li>✅ We'll contact you within 24 hours to confirm your order</li>
                      <li>✅ Your products will be prepared and shipped</li>
                      <li>✅ You can track your order status via email updates</li>
                      <li>✅ Delivery takes 2-5 business days</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/products')}
                      disabled={isSubmitting}
                    >
                      ← Back to Products
                    </button>
                    
                    <button 
                      type="submit"
                      className="btn btn-success"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          🛒 Place Order
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;