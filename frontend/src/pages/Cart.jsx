// Cart.js - Enhanced version with improvements
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import './Cart.css';

function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    getCartItemsCount,
    isLoading: cartLoading
  } = useCart();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  // ✅ Debug logging
  useEffect(() => {
    console.log('🛒 Cart Modal State:', {
      isOpen,
      isAuthenticated,
      cartItems: cartItems?.length || 0,
      cartLoading,
      isLoading
    });
  }, [isOpen, isAuthenticated, cartItems, cartLoading, isLoading]);

  // ✅ Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(productId);
    try {
      const result = await updateQuantity(productId, newQuantity);
      if (result.success) {
        console.log('✅ Quantity updated successfully');
        toast.success('Quantity updated!', { 
          position: 'top-right',
          autoClose: 1000 
        });
      } else {
        console.error('❌ Failed to update quantity:', result.error);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      toast.error('Error updating quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (!window.confirm(`Remove "${productName}" from cart?`)) return;
    
    setUpdatingItem(productId);
    try {
      const result = await removeFromCart(productId);
      if (result.success) {
        console.log('✅ Product removed successfully');
        toast.success('Product removed from cart', {
          position: 'top-right',
          autoClose: 2000
        });
      } else {
        console.error('❌ Failed to remove product:', result.error);
        toast.error('Failed to remove product');
      }
    } catch (error) {
      console.error('❌ Error removing product:', error);
      toast.error('Error removing product');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to empty your entire cart?')) return;
    
    setIsUpdating(true);
    try {
      const result = await clearCart();
      if (result.success) {
        console.log('✅ Cart cleared successfully');
        toast.success('Cart cleared successfully!', {
          position: 'top-right',
          autoClose: 2000
        });
      } else {
        console.error('❌ Failed to clear cart:', result.error);
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      toast.error('Error clearing cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      console.warn('⚠️ Cannot checkout: Cart is empty');
      toast.warning('Your cart is empty!');
      return;
    }
    
    if (!isAuthenticated) {
      toast.info('Please log in to continue with checkout');
      onClose();
      navigate('/login', { 
        state: { 
          from: { pathname: '/checkout' },
          message: 'Please log in to continue with your order'
        }
      });
      return;
    }
    
    console.log('🚀 Proceeding to checkout');
    onClose(); // Close cart modal
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    console.log('❌ Closing cart modal');
    onClose();
  };

  // ✅ Calculate totals
  const subtotal = getCartTotal();
  const itemCount = getCartItemsCount();
  const shippingThreshold = 100;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 15;
  const total = subtotal + shippingCost;
  const freeShippingRemaining = Math.max(0, shippingThreshold - subtotal);

  // ✅ Don't render if not open
  if (!isOpen) {
    return null;
  }

  // ✅ Loading state
  if (isLoading || cartLoading) {
    return (
      <div className="cart-modal-overlay">
        <div className="cart-modal">
          <div className="cart-header">
            <h3>🛒 Your Shopping Cart</h3>
            <button className="cart-close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
          <div className="cart-content">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-modal-overlay" onClick={handleClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* ✅ HEADER */}
        <div className="cart-header">
          <div className="cart-header-info">
            <h3>
              <ShoppingBag size={24} />
              Your Shopping Cart
            </h3>
            {itemCount > 0 && (
              <span className="cart-item-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button className="cart-close-btn" onClick={handleClose} title="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* ✅ CONTENT */}
        <div className="cart-content">
          {!cartItems || cartItems.length === 0 ? (
            // ✅ EMPTY CART STATE
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={64} />
              </div>
              <h4>Your cart is empty</h4>
              <p>Discover our range of eco-friendly cleaning products and start building a more sustainable home!</p>
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                <span>Browse Products</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            // ✅ CART WITH ITEMS
            <>
              {/* Free Shipping Progress */}
              {freeShippingRemaining > 0 && (
                <div className="shipping-progress">
                  <div className="shipping-progress-bar">
                    <div 
                      className="shipping-progress-fill"
                      style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="shipping-message">
                    🚚 Add <strong>${freeShippingRemaining.toFixed(2)}</strong> more for <strong>FREE shipping!</strong>
                  </p>
                </div>
              )}

              {subtotal >= shippingThreshold && (
                <div className="free-shipping-achieved">
                  🎉 <strong>Congratulations!</strong> You qualify for FREE shipping!
                </div>
              )}

              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={item.id || index} className={`cart-item ${updatingItem === item.id ? 'updating' : ''}`}>
                    
                    {/* Product Image */}
                    <div className="cart-item-image-container">
                      <img 
                        src={item.featured_image_url || item.image || 'https://via.placeholder.com/80x80?text=📦'} 
                        alt={item.name}
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=📦';
                        }}
                      />
                      {item.eco_badge && (
                        <div className="eco-badge-overlay">
                          🌿
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="cart-item-details">
                      <h6 className="cart-item-name">{item.name}</h6>
                      <div className="cart-item-price-section">
                        <span className="cart-item-price">${parseFloat(item.price).toFixed(2)}</span>
                        {item.quantity > 1 && (
                          <span className="cart-item-total">
                            Total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.eco_badge && (
                        <span className={`cart-item-badge ${item.eco_badge.toLowerCase().replace(/\s+/g, '-')}`}>
                          🌿 {item.eco_badge}
                        </span>
                      )}
                    </div>
                    
                    {/* Controls */}
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn decrease"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updatingItem === item.id || item.quantity <= 1}
                          title="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn increase"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updatingItem === item.id}
                          title="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        disabled={updatingItem === item.id}
                        title="Remove from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Updating Overlay */}
                    {updatingItem === item.id && (
                      <div className="updating-overlay">
                        <div className="mini-spinner"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ✅ FOOTER */}
              <div className="cart-footer">
                <div className="cart-total-section">
                  <div className="total-line">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="total-line shipping">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="total-line final">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="cart-actions">
                  <div className="cart-actions-secondary">
                    <button 
                      className="continue-shopping-link"
                      onClick={handleContinueShopping}
                    >
                      ← Continue Shopping
                    </button>
                    
                    <button 
                      className="clear-cart-btn"
                      onClick={handleClearCart}
                      disabled={isUpdating}
                      title="Clear entire cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <button 
                    className="checkout-final-btn"
                    onClick={handleCheckout}
                    disabled={isUpdating || !cartItems || cartItems.length === 0}
                  >
                    {isUpdating ? (
                      <>
                        <div className="button-spinner"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <span>Proceed to Checkout</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
                
                {/* ✅ TRUST BADGES */}
                <div className="trust-badges">
                  <div className="badges-grid">
                    <div className="badge-item">
                      <div className="badge-icon">🌿</div>
                      <div className="badge-text">100% Eco-Friendly</div>
                    </div>
                    <div className="badge-item">
                      <div className="badge-icon">🚚</div>
                      <div className="badge-text">Fast Delivery</div>
                    </div>
                    <div className="badge-item">
                      <div className="badge-icon">🔒</div>
                      <div className="badge-text">Secure Payment</div>
                    </div>
                    <div className="badge-item">
                      <div className="badge-icon">↩️</div>
                      <div className="badge-text">Easy Returns</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;