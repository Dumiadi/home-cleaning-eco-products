import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '',
    stock: '0', // ✅ Default value as string
    eco_badge: '',
    image: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { token, user, isAuthenticated } = useAuth();

  // ✅ Check authentication and role
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      toast.error('Access denied - admin permissions required');
      window.location.href = '/';
      return;
    }
    
    fetchProducts();
  }, [isAuthenticated, user, token]);

  const fetchProducts = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      console.log('🛍️ Fetching products...');
      
      const response = await fetch('http://localhost:5000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📦 Products response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Raw products data received:', data);
        
        if (Array.isArray(data)) {
          // ✅ Process products to ensure stock is properly handled
          const processedProducts = data.map(product => ({
            ...product,
            stock: product.stock !== null && product.stock !== undefined ? parseInt(product.stock) : 0,
            price: parseFloat(product.price) || 0
          }));
          
          console.log('📦 Processed products:', processedProducts);
          setProducts(processedProducts);
        } else {
          console.warn('⚠️ Products data is not an array:', data);
          setProducts([]);
          toast.warning('Product data format is not as expected');
        }
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error loading products');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Fetch products error:', error);
      toast.error('Network error loading products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Special handling for stock to ensure it's always a valid number
    if (name === 'stock') {
      const stockValue = value === '' ? '0' : value;
      setFormData(prev => ({
        ...prev,
        [name]: stockValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ✅ IMAGE UPLOAD WITH CLOUDINARY
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select only image files');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setSelectedImageFile(file);
    
    // ✅ Local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageUploading(true);

    try {
      console.log('📸 Starting Cloudinary upload...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'cleaning_platform');

      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dsq8qbnga/image/upload';

      const res = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.secure_url) {
        setFormData(prev => ({ ...prev, image: result.secure_url }));
        toast.success('✅ Image uploaded successfully!');
      } else {
        throw new Error('Cloudinary did not return image URL');
      }
      
    } catch (cloudinaryErr) {
      console.error('❌ Cloudinary upload error:', cloudinaryErr);
      toast.warning(`⚠️ Cloudinary failed. Trying local upload...`);
      
      // ✅ FALLBACK to local upload
      try {
        const localFormData = new FormData();
        localFormData.append('image', file);
        
        const localRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: localFormData
        });
        
        if (localRes.ok) {
          const localResult = await localRes.json();
          
          if (localResult.imageUrl) {
            const fullImageUrl = localResult.imageUrl.startsWith('http') 
              ? localResult.imageUrl 
              : `http://localhost:5000${localResult.imageUrl}`;
              
            setFormData(prev => ({ ...prev, image: fullImageUrl }));
            toast.success('✅ Image uploaded locally!');
          } else {
            throw new Error('Local upload did not return imageUrl');
          }
        } else {
          throw new Error(`Local upload failed: ${localRes.status}`);
        }
        
      } catch (localErr) {
        console.error('❌ Local upload also failed:', localErr);
        toast.error('❌ Both upload methods failed. Use direct URL or try again.');
      }
      
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUrlInput = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl && imageUrl.trim()) {
      setFormData(prev => ({ ...prev, image: imageUrl.trim() }));
      setImagePreview(imageUrl.trim());
      toast.success('✅ Image URL added!');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Price must be a positive number');
      return false;
    }

    if (!formData.category.trim()) {
      toast.error('Category is required');
      return false;
    }

    // ✅ Validate stock
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Stock must be a number greater than or equal to 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/admin/products/${editingId}`
      : 'http://localhost:5000/api/admin/products';

    try {
      // ✅ Ensure stock is properly converted to integer
      const stockValue = parseInt(formData.stock);
      const finalStock = isNaN(stockValue) ? 0 : stockValue;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        stock: finalStock, // ✅ Always send as integer
        eco_badge: formData.eco_badge.trim() || null,
        image: formData.image || null
      };

      console.log('📤 Submitting product data:', productData);

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(editingId ? '✅ Product updated successfully!' : '✅ Product added successfully!');
        
        // Reset form
        setFormData({ 
          name: '', 
          description: '', 
          price: '', 
          category: '',
          stock: '0', // ✅ Reset to default
          eco_badge: '',
          image: '' 
        });
        setEditingId(null);
        setImagePreview(null);
        setSelectedImageFile(null);
        
        fetchProducts(); // Reload list
      } else {
        toast.error(result.error || 'Error saving product');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error('Network error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (prod) => {
    console.log('✏️ Editing product:', prod);
    
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      category: prod.category || '',
      stock: (prod.stock !== null && prod.stock !== undefined ? prod.stock : 0).toString(), // ✅ Ensure stock is string for input
      eco_badge: prod.eco_badge || '',
      image: prod.image || prod.featured_image_url || ''
    });
    
    // Set image preview if exists
    if (prod.image || prod.featured_image_url) {
      setImagePreview(prod.image || prod.featured_image_url);
    }
    
    setEditingId(prod.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('✅ Product deleted successfully!');
        fetchProducts();
      } else {
        toast.error(result.error || 'Error deleting product');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Network error deleting product');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: '',
      stock: '0', // ✅ Reset to default
      eco_badge: '',
      image: '' 
    });
    setEditingId(null);
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  // Available categories
  const categories = [
    'Personal Care',
    'House Cleaning', 
    'Home & Garden',
    'Supplements',
    'Natural Cosmetics'
  ];

  // Available eco badges
  const ecoBadges = [
    'Biodegradable',
    'Vegan',
    'Sustainable',
    'Compostable',
    'Plastic-Free',
    'Non-toxic',
    'Organic'
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading products...</span>
          </div>
          <p className="mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🛍️ Product Management</h3>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchProducts}
          title="Refresh list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ✅ COMPLETE IMPROVED FORM */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Product Name *</label>
                <input 
                  name="name" 
                  className="form-control" 
                  placeholder="e.g. Universal Eco Detergent" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Price (RON) *</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="e.g. 25.99" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Stock *</label>
                <input 
                  name="stock" 
                  type="number" 
                  min="0"
                  className="form-control" 
                  placeholder="e.g. 50" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  disabled={isSubmitting}
                />
                <small className="form-text text-muted">
                  Available quantity in inventory
                </small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Category *</label>
                <select 
                  name="category" 
                  className="form-select" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Eco Badge</label>
                <select 
                  name="eco_badge" 
                  className="form-select" 
                  value={formData.eco_badge} 
                  onChange={handleChange} 
                  disabled={isSubmitting}
                >
                  <option value="">No Badge</option>
                  {ecoBadges.map(badge => (
                    <option key={badge} value={badge}>{badge}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-12">
                <label className="form-label">Product Description *</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  rows="3"
                  placeholder="Describe the product, benefits, usage..." 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">📸 Product Image</label>
                <input 
                  type="file" 
                  className="form-control" 
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={imageUploading || isSubmitting}
                />
                <small className="form-text text-muted">
                  Accepts: JPG, PNG, GIF (max 5MB)
                </small>
                
                {imageUploading && (
                  <div className="mt-2">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    <small>Uploading image...</small>
                  </div>
                )}
                
                <button 
                  type="button"
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={handleImageUrlInput}
                  disabled={imageUploading || isSubmitting}
                >
                  🔗 Use URL Instead
                </button>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="col-md-6">
                  <label className="form-label">Image Preview</label>
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="img-fluid border rounded" 
                      style={{ maxHeight: '150px', objectFit: 'cover' }} 
                    />
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                        setSelectedImageFile(null);
                      }}
                    >
                      🗑️ Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="d-flex gap-2 mt-4">
              <button 
                className="btn btn-success" 
                type="submit"
                disabled={isSubmitting || imageUploading}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {editingId ? 'Saving...' : 'Adding...'}
                  </>
                ) : (
                  editingId ? '✅ Save Changes' : '➕ Add Product'
                )}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ✅ IMPROVED PRODUCT LIST */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">📋 Product List ({Array.isArray(products) ? products.length : 0})</h5>
        </div>
        <div className="card-body">
          {!Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h6 className="text-muted">No products available</h6>
              <p className="text-muted">Add the first product using the form above.</p>
            </div>
          ) : (
            <div className="row">
              {products.map(prod => (
                <div key={prod.id} className="col-lg-6 col-xl-4 mb-3">
                  <div className="card h-100 shadow-sm">
                    {(prod.image || prod.featured_image_url) && (
                      <img 
                        src={prod.image || prod.featured_image_url} 
                        className="card-img-top" 
                        alt={prod.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Eco+Product';
                        }}
                      />
                    )}
                    <div className="card-body">
                      <h6 className="card-title text-primary">{prod.name}</h6>
                      
                      {prod.category && (
                        <span className="badge bg-light text-dark mb-2">{prod.category}</span>
                      )}
                      
                      {prod.eco_badge && (
                        <span className="badge bg-success mb-2 ms-1">{prod.eco_badge}</span>
                      )}
                      
                      <p className="card-text text-muted small">
                        {prod.description?.length > 100 
                          ? prod.description.substring(0, 100) + '...' 
                          : prod.description
                        }
                      </p>
                      
                      <div className="product-details mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="text-success">{prod.price} RON</strong>
                          <span className={`badge ${prod.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                            Stock: {prod.stock !== null && prod.stock !== undefined ? prod.stock : 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-primary flex-fill" 
                          onClick={() => handleEdit(prod)}
                          title="Edit product"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDelete(prod.id)}
                          title="Delete product"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-footer text-muted text-center">
                      <small>
                        ID: {prod.id} • 
                        Created: {new Date(prod.created_at).toLocaleDateString('en-US')}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;