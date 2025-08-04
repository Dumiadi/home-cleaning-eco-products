// Products.js - Fixed cart display logic
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Filter, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Cart from './Cart';
import './Products.css';

const categories = ["All", "Personal Care", "House Cleaning", "Home & Garden"];

const ecoBadgeClasses = {
  "Biodegradable": "biodegradable",
  "Vegan": "vegan", 
  "Sustainable": "sustainable",
  "Compostable": "compostable",
  "Plastic-Free": "plastic-free",
  "Non-toxic": "non-toxic"
};

function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { cartItems, addToCart, getCartTotal, getCartItemsCount } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Debug cart state
  useEffect(() => {
    console.log('🛍️ Products - Cart State:', {
      cartItems: cartItems?.length || 0,
      showCart,
      isAuthenticated,
      hasValidCartItems: Array.isArray(cartItems) && cartItems.length > 0
    });
  }, [cartItems, showCart, isAuthenticated]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🛍️ Fetching products from API...');
      
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw products data:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Data is not an array:', typeof data);
        setProducts([]);
        setError('Invalid data format from server');
        return;
      }
      
      const transformedProducts = data.map(product => ({
        id: product.id,
        name: product.name || 'Eco Product',
        category: product.category || 'Personal Care',
        price: parseFloat(product.price) || 0,
        rating: product.rating || 4.5,
        featured_image_url: product.image || product.featured_image_url || 'https://via.placeholder.com/400x300?text=Eco+Product',
        description: product.description || 'Sustainable eco product',
        eco_badge: product.eco_badge || getBadgeForCategory(product.category),
        in_stock: product.stock > 0 || product.stock == null,
        stock: product.stock || 0
      }));
      
      setProducts(transformedProducts);
      console.log('✅ Products set successfully:', transformedProducts.length);
      
      if (transformedProducts.length === 0) {
        console.log('⚠️ No products found, using mock data');
        setProducts([{
          id: 1,
          name: 'Test Product',
          category: 'Personal Care',
          price: 25.99,
          rating: 4.5,
          featured_image_url: 'https://via.placeholder.com/400x300?text=Test+Product',
          description: 'This is a test product to verify functionality',
          eco_badge: 'Biodegradable',
          in_stock: true,
          stock: 10
        }]);
      }
      
    } catch (error) {
      console.error('❌ Complete fetch error:', error);
      setError(`Could not load products: ${error.message}`);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeForCategory = (category) => {
    const categoryBadges = {
      "Personal Care": "Biodegradable",
      "House Cleaning": "Non-toxic",
      "Home & Garden": "Sustainable"
    };
    return categoryBadges[category] || "Eco";
  };

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showToast("You need to log in to add products to cart!");
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: { pathname: '/products' },
            message: 'Log in to add products to cart'
          } 
        });
      }, 1500);
      return;
    }

    if (!product.in_stock || product.stock === 0) {
      showToast("Product is out of stock!");
      return;
    }
    
    try {
      const result = await addToCart(product);
      if (result.success) {
        showToast("Product added to cart!");
        console.log('✅ Product added successfully:', product.name);
      } else {
        showToast(result.error || "Failed to add product to cart");
        console.error('❌ Failed to add product:', result.error);
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      showToast("Error adding product to cart");
    }
  };

  const toggleFavorite = (productId) => {
    if (!isAuthenticated) {
      showToast("Log in to save favorites!");
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: { pathname: '/products' },
            message: 'Log in to save favorite products'
          } 
        });
      }, 1500);
      return;
    }

    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    const isFavorite = favorites.includes(productId);
    showToast(isFavorite ? "Removed from favorites!" : "Added to favorites!");
  };

  const toggleCart = () => {
    if (!isAuthenticated) {
      showToast("Log in to view cart!");
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: { pathname: '/products' },
            message: 'Log in to access shopping cart'
          } 
        });
      }, 1500);
      return;
    }
    
    console.log('🛒 Toggling cart modal:', !showCart);
    setShowCart(!showCart);
  };

  const closeCart = () => {
    console.log('❌ Closing cart modal');
    setShowCart(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ✅ HELPER pentru a verifica dacă cart summary-ul ar trebui afișat
  const shouldShowCartSummary = () => {
    return isAuthenticated && 
           Array.isArray(cartItems) && 
           cartItems.length > 0 && 
           getCartItemsCount() > 0;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error loading products</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchProducts}>
            🔄 Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Toast Notification */}
      {showNotification && (
        <div className={`toast-notification ${showNotification ? 'show' : ''}`}>
          <div className="toast-content">
            <span>🌿</span>
            {notificationMessage}
          </div>
        </div>
      )}

      {/* Products Section */}
      <section>
        <div className="products-wrapper">
          {/* Title */}
          <div className="products-title">
            <h2>🌿 Our Eco Products</h2>
            <p>Each product is carefully chosen to be safe, natural and sustainable</p>
            
            {/* Authentication status */}
            <div className="auth-status">
              {isAuthenticated ? (
                <span className="auth-indicator authenticated">
                  ✅ Logged in - you can order products
                </span>
              ) : (
                <span className="auth-indicator not-authenticated">
                  👤 <button 
                    onClick={() => navigate('/login')} 
                    className="login-link"
                  >
                    Log in
                  </button> to order
                </span>
              )}
            </div>
            
            {/* ✅ DEBUG INFO - doar în development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Debug: Cart items: {cartItems?.length || 0} | Should show summary: {shouldShowCartSummary() ? 'YES' : 'NO'}
              </div>
            )}
            
            <button 
              className="refresh-btn" 
              onClick={fetchProducts}
              title="Refresh products"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="filters-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search eco products..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="results-info">
            <span>Found {filteredProducts.length} products</span>
            {products.length > 0 && (
              <small className="last-updated">
                Last updated: {new Date().toLocaleTimeString('en-US')}
              </small>
            )}
          </div>

          {/* Products Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {products.length === 0 ? <span>📦</span> : <Filter />}
              </div>
              <h4>
                {products.length === 0 ? 'No products in store' : 'No products found'}
              </h4>
              <p>
                {products.length === 0 
                  ? 'The administrator needs to add products to the system.' 
                  : 'Try modifying your search criteria or selecting a different category'
                }
              </p>
              {products.length === 0 && (
                <button className="retry-btn" onClick={fetchProducts}>
                  🔄 Check again
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.featured_image_url}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Eco+Product';
                      }}
                    />
                    
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                    >
                      <Heart className={`favorite-icon ${favorites.includes(product.id) ? 'filled' : ''}`} />
                    </button>
                    
                    <div className="badge-container">
                      <span className={`eco-badge ${ecoBadgeClasses[product.eco_badge] || 'default'}`}>
                        {product.eco_badge}
                      </span>
                    </div>
                    
                    {product.stock !== undefined && (
                      <div className="stock-badge">
                        Stock: {product.stock}
                      </div>
                    )}
                    
                    {!product.in_stock && (
                      <div className="out-of-stock-overlay">
                        <span className="out-of-stock-text">
                          Temporarily Unavailable
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-content">
                    <h4 className="product-title">{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-rating">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`rating-star ${i < Math.floor(product.rating) ? 'filled' : 'empty'}`}
                          />
                        ))}
                      </div>
                      <span className="rating-text">({product.rating})</span>
                    </div>

                    <div className="product-footer">
                      <span className="product-price">${product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock}
                        className={`add-to-cart-btn ${!product.in_stock ? 'disabled' : ''}`}
                      >
                        <ShoppingCart className="cart-icon" />
                        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ FIXED Cart Summary - DOAR când toate condițiile sunt îndeplinite */}
      {shouldShowCartSummary() && (
        <div className="cart-summary visible" onClick={toggleCart}>
          <div className="cart-summary-content">
            <div className="cart-icon-container">
              <ShoppingCart className="cart-summary-icon" />
            </div>
            <div className="cart-info">
              <p>Cart: {getCartItemsCount()} items</p>
              <p className="cart-total">${getCartTotal().toFixed(2)}</p>
            </div>
            <button className="checkout-btn">
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* ✅ Cart Modal Component - SEMPRE render but conditionally display */}
      <Cart 
        isOpen={showCart && isAuthenticated} 
        onClose={closeCart} 
      />
    </div>
  );
}

export default Products;