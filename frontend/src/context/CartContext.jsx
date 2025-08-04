import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';

export const CartContext = createContext();

// ✅ Cart reducer for complex state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOAD_CART':
      return { ...state, items: action.payload, isLoading: false };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload };
    
    case 'SET_SHIPPING_INFO':
      return { ...state, shippingInfo: action.payload };
    
    default:
      return state;
  }
};

// ✅ Initial state
const initialState = {
  items: [],
  isLoading: false,
  error: null,
  discount: null,
  shippingInfo: null,
  appliedCoupons: [],
  wishlist: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [orderHistory, setOrderHistory] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('ecoCart');
      const savedWishlist = localStorage.getItem('ecoWishlist');
      const savedForLaterItems = localStorage.getItem('ecoSavedForLater');
      const savedOrderHistory = localStorage.getItem('ecoOrderHistory');

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
          console.log('✅ Cart loaded from localStorage:', parsedCart.length, 'items');
        }
      }

      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
        }
      }

      if (savedForLaterItems) {
        const parsedSavedForLater = JSON.parse(savedForLaterItems);
        if (Array.isArray(parsedSavedForLater)) {
          setSavedForLater(parsedSavedForLater);
        }
      }

      if (savedOrderHistory) {
        const parsedOrderHistory = JSON.parse(savedOrderHistory);
        if (Array.isArray(parsedOrderHistory)) {
          setOrderHistory(parsedOrderHistory);
        }
      }
    } catch (error) {
      console.error('❌ Error loading data from localStorage:', error);
    }
  }, []);

  // ✅ Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('ecoCart', JSON.stringify(state.items));
      console.log('💾 Cart saved to localStorage:', state.items.length, 'items');
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // ✅ Save order history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoOrderHistory', JSON.stringify(orderHistory));
    } catch (error) {
      console.error('❌ Error saving order history:', error);
    }
  }, [orderHistory]);

  // ✅ Save wishlist and saved for later to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoSavedForLater', JSON.stringify(savedForLater));
    } catch (error) {
      console.error('❌ Error saving saved for later:', error);
    }
  }, [savedForLater]);

  // ✅ Add product to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Validate product
      if (!product || !product.id) {
        throw new Error('Invalid product data');
      }

      // Check stock availability
      if (product.stock !== undefined && product.stock < quantity) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      // Check if adding more would exceed stock
      const currentQuantity = getProductQuantity(product.id);
      if (product.stock !== undefined && (currentQuantity + quantity) > product.stock) {
        throw new Error(`Cannot add ${quantity} more items. Stock limit: ${product.stock}`);
      }

      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { ...product, quantity }
      });

      console.log('✅ Product added to cart:', product.name, 'Qty:', quantity);
      return { success: true, message: 'Product added to cart' };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Update product quantity
  const updateQuantity = async (productId, newQuantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (newQuantity <= 0) {
        return await removeFromCart(productId);
      }

      // Find product to check stock
      const product = state.items.find(item => item.id === productId);
      if (product && product.stock !== undefined && newQuantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      dispatch({ 
        type: 'UPDATE_QUANTITY', 
        payload: { id: productId, quantity: newQuantity }
      });

      console.log('✅ Quantity updated for product ID:', productId, 'to:', newQuantity);
      return { success: true, message: 'Quantity updated' };
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      dispatch({ type: 'REMOVE_ITEM', payload: productId });

      console.log('✅ Product removed from cart, ID:', productId);
      return { success: true, message: 'Product removed from cart' };
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      dispatch({ type: 'CLEAR_CART' });
      
      console.log('✅ Cart cleared');
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Save item for later
  const saveForLater = async (productId) => {
    try {
      const product = state.items.find(item => item.id === productId);
      if (!product) throw new Error('Product not found in cart');

      // Add to saved for later
      setSavedForLater(prev => {
        const exists = prev.find(item => item.id === productId);
        if (exists) return prev;
        return [...prev, product];
      });

      // Remove from cart
      await removeFromCart(productId);

      return { success: true, message: 'Item saved for later' };
    } catch (error) {
      console.error('❌ Error saving for later:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Move from saved for later back to cart
  const moveToCart = async (productId) => {
    try {
      const product = savedForLater.find(item => item.id === productId);
      if (!product) throw new Error('Product not found in saved items');

      // Add to cart
      const result = await addToCart(product, product.quantity);
      if (result.success) {
        // Remove from saved for later
        setSavedForLater(prev => prev.filter(item => item.id !== productId));
      }

      return result;
    } catch (error) {
      console.error('❌ Error moving to cart:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Apply discount/coupon
  const applyCoupon = async (couponCode) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call to validate coupon
      const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: getCartTotal() })
      });

      if (response.ok) {
        const couponData = await response.json();
        dispatch({ type: 'SET_DISCOUNT', payload: couponData });
        return { success: true, discount: couponData };
      } else {
        throw new Error('Invalid coupon code');
      }
    } catch (error) {
      console.error('❌ Coupon error:', error);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Remove discount
  const removeDiscount = () => {
    dispatch({ type: 'SET_DISCOUNT', payload: null });
  };

  // ✅ Calculate cart total
  const getCartTotal = () => {
    const subtotal = state.items.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return acc + (price * quantity);
    }, 0);

    return subtotal;
  };

  // ✅ Calculate subtotal with discounts
  const getSubtotal = () => {
    const total = getCartTotal();
    if (state.discount) {
      if (state.discount.type === 'percentage') {
        return total * (1 - state.discount.value / 100);
      } else if (state.discount.type === 'fixed') {
        return Math.max(0, total - state.discount.value);
      }
    }
    return total;
  };

  // ✅ Calculate shipping cost
  const getShippingCost = () => {
    const subtotal = getSubtotal();
    const freeShippingThreshold = 100;
    
    if (subtotal >= freeShippingThreshold) return 0;
    if (subtotal === 0) return 0;
    
    // Different shipping rates based on location/weight
    return 15; // Default shipping cost
  };

  // ✅ Calculate tax
  const getTax = () => {
    const subtotal = getSubtotal();
    const taxRate = 0.1; // 10% tax rate
    return subtotal * taxRate;
  };

  // ✅ Get final total including shipping and tax
  const getFinalTotal = () => {
    return getSubtotal() + getShippingCost() + getTax();
  };

  // ✅ Get total number of items in cart
  const getCartItemsCount = () => {
    return state.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  };

  // ✅ Get comprehensive cart summary
  const getCartSummary = () => {
    const subtotal = getCartTotal();
    const discountedSubtotal = getSubtotal();
    const shipping = getShippingCost();
    const tax = getTax();
    const total = getFinalTotal();
    const itemCount = getCartItemsCount();
    const discount = state.discount;

    return {
      items: state.items,
      itemCount,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountedSubtotal: parseFloat(discountedSubtotal.toFixed(2)),
      discount: discount ? {
        ...discount,
        amount: parseFloat((subtotal - discountedSubtotal).toFixed(2))
      } : null,
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      freeShippingEligible: subtotal >= 100,
      freeShippingRemaining: subtotal < 100 ? parseFloat((100 - subtotal).toFixed(2)) : 0,
      isEmpty: itemCount === 0
    };
  };

  // ✅ Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // ✅ Get quantity of specific product in cart
  const getProductQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // ✅ Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.id === productId);
  };

  // ✅ Validate cart before checkout
  const validateCart = () => {
    const errors = [];
    const warnings = [];
    
    if (state.items.length === 0) {
      errors.push('Cart is empty');
    }
    
    state.items.forEach(item => {
      if (!item.price || item.price <= 0) {
        errors.push(`Invalid price for ${item.name}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.name}`);
      }
      if (item.stock !== undefined && item.quantity > item.stock) {
        errors.push(`${item.name}: Requested quantity (${item.quantity}) exceeds stock (${item.stock})`);
      }
      if (item.stock !== undefined && item.stock <= 5) {
        warnings.push(`${item.name}: Low stock (${item.stock} remaining)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasWarnings: warnings.length > 0
    };
  };

  // ✅ Send confirmation email
  const sendConfirmationEmail = async (order) => {
    try {
      console.log('📧 Sending confirmation email...');
      
      const response = await fetch('http://localhost:5000/api/orders/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: order.user.name,
          address: order.user.address,
          phone: order.user.phone,
          items: order.items,
          total: order.total,
          email: order.user.email,
          orderId: order.orderId,
          summary: order.summary
        })
      });

      if (response.ok) {
        console.log('✅ Confirmation email sent successfully!');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('⚠️ Error sending confirmation email:', errorData);
        return { success: false, error: errorData.message || 'Failed to send email' };
      }
    } catch (error) {
      console.error('❌ Email error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Place order
  const placeOrder = async (userData, paymentInfo = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Validate cart
      const validation = validateCart();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Validate user data
      const requiredFields = ['name', 'email', 'address', 'phone'];
      for (const field of requiredFields) {
        if (!userData[field] || !userData[field].trim()) {
          throw new Error(`${field} is required`);
        }
      }

      const cartSummary = getCartSummary();
      
      const newOrder = {
        id: Date.now(),
        orderId: `ECO-${Date.now()}`,
        user: {
          name: userData.name.trim(),
          email: userData.email.trim().toLowerCase(),
          address: userData.address.trim(),
          phone: userData.phone.trim()
        },
        items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          eco_badge: item.eco_badge,
          image: item.featured_image_url || item.image,
          total: parseFloat(item.price) * parseInt(item.quantity)
        })),
        summary: cartSummary,
        total: cartSummary.total,
        subtotal: cartSummary.subtotal,
        shipping: cartSummary.shipping,
        tax: cartSummary.tax,
        discount: cartSummary.discount,
        paymentInfo: paymentInfo ? {
          method: paymentInfo.method,
          status: paymentInfo.status || 'pending'
        } : null,
        date: new Date().toISOString(),
        status: 'pending',
        timestamp: Date.now()
      };

      console.log('📦 Sending order to server...', {
        orderId: newOrder.orderId,
        items: newOrder.items.length,
        total: newOrder.total
      });

      // ✅ Save order to database
      const response = await fetch('http://localhost:5000/api/orders/new-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrder)
      });

      console.log('📡 Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Order saved successfully:', responseData.message);
      
      // ✅ Add to order history
      setOrderHistory(prev => [newOrder, ...prev]);

      // ✅ Try to send confirmation email (optional)
      try {
        const emailResult = await sendConfirmationEmail(newOrder);
        if (emailResult.success) {
          console.log('📧 Confirmation email sent');
        } else {
          console.warn('⚠️ Email sending failed, but order was saved');
        }
      } catch (emailError) {
        console.warn('⚠️ Email could not be sent, but order was saved:', emailError.message);
      }
      
      // ✅ Clear cart after successful order
      await clearCart();
      
      return {
        success: true,
        data: responseData,
        order: newOrder,
        orderId: newOrder.orderId,
        message: 'Order placed successfully!'
      };
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to place order. Please try again.'
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ Get order by ID
  const getOrder = (orderId) => {
    return orderHistory.find(order => order.orderId === orderId);
  };

  // ✅ Cancel order
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setOrderHistory(prev => 
          prev.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        return { success: true };
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Get recently viewed products
  const addToRecentlyViewed = (product) => {
    try {
      const recentItems = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recentItems.filter(item => item.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Error saving recently viewed:', error);
    }
  };

  const getRecentlyViewed = () => {
    try {
      return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    } catch (error) {
      console.error('❌ Error loading recently viewed:', error);
      return [];
    }
  };

  // ✅ Context value with all functions
  const contextValue = {
    // State
    cartItems: state.items,
    isLoading: state.isLoading,
    error: state.error,
    discount: state.discount,
    orderHistory,
    savedForLater,
    
    // Core cart actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    // Save for later
    saveForLater,
    moveToCart,
    
    // Discounts
    applyCoupon,
    removeDiscount,
    
    // Calculations
    getCartTotal,
    getSubtotal,
    getShippingCost,
    getTax,
    getFinalTotal,
    getCartItemsCount,
    getCartSummary,
    
    // Utilities
    isInCart,
    getProductQuantity,
    getCartItem,
    validateCart,
    
    // Orders
    placeOrder,
    getOrder,
    cancelOrder,
    sendConfirmationEmail,
    
    // Recently viewed
    addToRecentlyViewed,
    getRecentlyViewed,
    
    // Error handling
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// ✅ Custom hooks
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useCartSummary = () => {
  const { getCartSummary } = useCart();
  return getCartSummary();
};

export const useCartValidation = () => {
  const { validateCart } = useCart();
  return validateCart();
};

export const useOrderHistory = () => {
  const { orderHistory, getOrder, cancelOrder } = useCart();
  return { orderHistory, getOrder, cancelOrder };
};