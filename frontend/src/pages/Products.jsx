// import React, { useEffect, useState, useContext } from 'react';
// import AOS from 'aos';
// import 'aos/dist/aos.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Products.css';
// import { CartContext } from '../context/CartContext';

// const PRODUCTS = [
//   {
//     id: 1,
//     category: 'Baie',
//     name: 'Detergent Eco pentru Baie',
//     description: 'Curăță eficient gresia, faianța și obiectele sanitare fără chimicale.',
//     price: '35',
//     image: 'https://images.unsplash.com/photo-1610632389475-1c4649b52b2f?auto=format&fit=crop&w=600&q=60'
//   },
//   {
//     id: 2,
//     category: 'Baie',
//     name: 'Spray Anti-calcar Eco',
//     description: 'Îndepărtează calcarul folosind ingrediente naturale.',
//     price: '30',
//     image: 'https://images.unsplash.com/photo-1600294037681-9b90ae308d06?auto=format&fit=crop&w=600&q=60'
//   },
//   {
//     id: 3,
//     category: 'Bucătărie',
//     name: 'Degresant Eco pentru Bucătărie',
//     description: 'Îndepărtează grăsimea de pe suprafețe fără mirosuri toxice.',
//     price: '40',
//     image: 'https://images.unsplash.com/photo-1621514850465-d1237d62d7b9?auto=format&fit=crop&w=600&q=60'
//   },
//   {
//     id: 4,
//     category: 'Bucătărie',
//     name: 'Detergent Eco pentru Vase',
//     description: 'Spală vasele eficient, fără a afecta pielea sau mediul.',
//     price: '25',
//     image: 'https://images.unsplash.com/photo-1565632494600-4aa45758c675?auto=format&fit=crop&w=600&q=60'
//   },
//   {
//     id: 5,
//     category: 'Universal',
//     name: 'Detergent Multi-Suprafețe Eco',
//     description: 'Curăță eficient orice suprafață din casă cu formule naturale.',
//     price: '30',
//     image: 'https://images.unsplash.com/photo-1612831455547-4040d3ba9392?auto=format&fit=crop&w=600&q=60'
//   },
//   {
//     id: 6,
//     category: 'Universal',
//     name: 'Lavete Microfibră Eco',
//     description: 'Set de lavete reutilizabile, ultra-absorbante și eco-friendly.',
//     price: '40',
//     image: 'https://www.pexels.com/ro-ro/fotografie/persoana-om-mana-murdar-4239035/'
//   },
//   {
//     id: 7,
//     category: 'Seturi',
//     name: 'Pachet Curățenie Baie Eco',
//     description: 'Set complet pentru întreținerea băii cu soluții naturale.',
//     price: '75',
//     image: 'https://images.pexels.com/photos/4239112/pexels-photo-4239112.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4239112.jpg&fm=jpg'
//   },
//   {
//     id: 8,
//     category: 'Seturi',
//     name: 'Pachet Curățenie Bucătărie Eco',
//     description: 'Degresant, detergent vase și lavete, toate eco-friendly.',
//     price: '85',
//     image: 'https://images.pexels.com/photos/4239112/pexels-photo-4239112.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4239112.jpg&fm=jpg'

//   }
// ];

// function Products() {
//   const { addToCart } = useContext(CartContext);
//   const [selectedCategory, setSelectedCategory] = useState('Toate');
//   const [showAlert, setShowAlert] = useState(false);

//   useEffect(() => {
//     AOS.init({ duration: 800 });
//   }, []);

//   const categories = ['Toate', 'Baie', 'Bucătărie', 'Universal', 'Seturi'];

//   const filtered = selectedCategory === 'Toate'
//     ? PRODUCTS
//     : PRODUCTS.filter(p => p.category === selectedCategory);

//   const handleAdd = (product) => {
//     addToCart(product);
//     setShowAlert(true);
//     setTimeout(() => setShowAlert(false), 2000);
//   };

//   return (
//     <div className="products-page py-5">
//       <div className="container">
//         <h2 className="text-center mb-4">Catalog Produse Eco</h2>

//         {showAlert && (
//           <div className="alert alert-success text-center">Produs adăugat în coș!</div>
//         )}

//         <div className="text-center mb-5">
//           {categories.map(cat => (
//             <button
//               key={cat}
//               className={`btn m-2 ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
//               onClick={() => setSelectedCategory(cat)}>
//               {cat === 'Universal' ? 'Produse Universale' : cat}
//             </button>
//           ))}
//         </div>

//         <div className="row">
//           {filtered.map(product => (
//             <div key={product.id} className="col-md-6 col-lg-3 mb-4" data-aos="fade-up">
//               <div className="card h-100 shadow-sm">
//                 <img src={product.image} className="card-img-top" alt={product.name} />
//                 <div className="card-body d-flex flex-column">
//                   <h5 className="card-title">{product.name}</h5>
//                   <p className="card-text flex-grow-1">{product.description}</p>
//                   <div className="d-flex justify-content-between align-items-center mt-3">
//                     <span className="fw-bold">{product.price} RON</span>
//                     <button className="btn btn-success" onClick={() => handleAdd(product)}>
//                       Adaugă în Coș
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Products;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Eye, Badge } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../../services/productsAPI';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showQuickView = true }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    id,
    slug,
    name,
    price,
    compare_at_price,
    featured_image_url,
    average_rating,
    review_count,
    stock_quantity,
    eco_certified,
    featured,
    brand,
    category
  } = product;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: productsAPI.addToCart,
    onSuccess: () => {
      toast.success('Product added to cart!');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: productsAPI.addToWishlist,
    onSuccess: () => {
      setIsInWishlist(true);
      toast.success('Added to wishlist!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: productsAPI.removeFromWishlist,
    onSuccess: () => {
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
    }
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCartMutation.mutate({ productId: id, quantity: 1 });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(id);
    } else {
      addToWishlistMutation.mutate(id);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const discountPercentage = compare_at_price 
    ? Math.round(((compare_at_price - price) / compare_at_price) * 100)
    : 0;

  const isOutOfStock = stock_quantity === 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${slug || id}`}>
          <img
            src={featured_image_url || '/api/placeholder/300/300'}
            alt={name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {featured && (
            <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              -{discountPercentage}%
            </span>
          )}
          {eco_certified && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Badge className="w-3 h-3 mr-1" />
              Eco
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          {showQuickView && (
            <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-gray-900 hover:text-white backdrop-blur-sm transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand and Category */}
        {(brand || category) && (
          <div className="flex items-center justify-between mb-2">
            {brand && (
              <span className="text-xs text-gray-500 font-medium">{brand.name}</span>
            )}
            {category && (
              <span className="text-xs text-gray-400">{category.name}</span>
            )}
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${slug || id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {review_count > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(average_rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {average_rating.toFixed(1)} ({review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {compare_at_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addToCartMutation.isPending}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {addToCartMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </div>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;