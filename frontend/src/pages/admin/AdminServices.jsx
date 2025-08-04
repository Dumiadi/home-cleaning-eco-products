
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    duration: '',
    category: '',
    team_size: '',
    area_coverage: '',
    badge: '',
    features: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      toast.error('Acces interzis - necesare permisiuni admin');
      window.location.href = '/';
      return;
    }
    
    fetchServices();
  }, [isAuthenticated, user, token]);

  const fetchServices = async () => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Eroare la încărcarea serviciilor');
        setServices([]);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
      toast.error('Eroare de rețea la încărcarea serviciilor');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ UPLOAD IMAGINE PENTRU SERVICII
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Te rugăm să selectezi doar fișiere imagine');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imaginea trebuie să fie mai mică de 5MB');
      return;
    }

    setSelectedImageFile(file);
    
    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'cleaning_platform'); // Preset pentru servicii
      uploadData.append('cloud_name', 'dsq8qbnga');

      const res = await fetch('https://api.cloudinary.com/v1_1/dsq8qbnga/image/upload', {
        method: 'POST',
        body: uploadData,
      });
      
      const result = await res.json();
      
      if (result.secure_url) {
        setFormData(prev => ({ ...prev, image: result.secure_url }));
        toast.success('✅ Imagine încărcată cu succes!');
        console.log('📸 Service image uploaded:', result.secure_url);
      } else {
        throw new Error('Nu s-a primit URL-ul imaginii');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      toast.error('❌ Eroare la upload imagine: ' + err.message);
      setImagePreview(null);
      setSelectedImageFile(null);
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Numele serviciului este obligatoriu');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrierea este obligatorie');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Prețul trebuie să fie un număr pozitiv');
      return false;
    }

    if (!formData.category.trim()) {
      toast.error('Categoria este obligatorie');
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
      ? `http://localhost:5000/api/admin/services/${editingId}`
      : `http://localhost:5000/api/admin/services`;

    try {
      // Procesează features ca array
      let featuresArray = [];
      if (formData.features.trim()) {
        featuresArray = formData.features
          .split('\n')
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }

      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration) || null,
        category: formData.category.trim(),
        team_size: parseInt(formData.team_size) || null,
        area_coverage: formData.area_coverage.trim() || null,
        badge: formData.badge.trim() || null,
        features: JSON.stringify(featuresArray),
        image: formData.image || null
      };

      console.log('📤 Submitting service data:', serviceData);

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(editingId ? '✅ Serviciu modificat cu succes!' : '✅ Serviciu adăugat cu succes!');
        
        // Reset form
        setFormData({ 
          name: '', 
          description: '', 
          price: '', 
          duration: '',
          category: '',
          team_size: '',
          area_coverage: '',
          badge: '',
          features: '',
          image: ''
        });
        setEditingId(null);
        setImagePreview(null);
        setSelectedImageFile(null);
        
        fetchServices();
      } else {
        toast.error(result.error || 'Eroare la salvarea serviciului');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Eroare de rețea la salvarea serviciului');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    // Procesează features din JSON în text
    let featuresText = '';
    try {
      if (service.features) {
        const featuresArray = Array.isArray(service.features) 
          ? service.features 
          : JSON.parse(service.features);
        featuresText = featuresArray.join('\n');
      }
    } catch (e) {
      console.warn('Error parsing features:', e);
      featuresText = '';
    }

    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
      category: service.category || '',
      team_size: service.team_size?.toString() || '',
      area_coverage: service.area_coverage || '',
      badge: service.badge || '',
      features: featuresText,
      image: service.image || service.image_url || ''
    });
    
    // Set image preview if exists
    if (service.image || service.image_url) {
      setImagePreview(service.image || service.image_url);
    }
    
    setEditingId(service.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest serviciu?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/services/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('✅ Serviciu șters cu succes!');
        fetchServices();
      } else {
        toast.error(result.error || 'Eroare la ștergerea serviciului');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Eroare de rețea la ștergerea serviciului');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      duration: '',
      category: '',
      team_size: '',
      area_coverage: '',
      badge: '',
      features: '',
      image: ''
    });
    setEditingId(null);
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  // Categorii servicii
  const serviceCategories = [
    'Curățenie Rezidențială',
    'Curățenie Comercială', 
    'Servicii Specializate',
    'Întreținere Regulată',
    'Curățenie Post-Construcție',
    'Dezinfecție'
  ];

  // Badge-uri servicii
  const serviceBadges = [
    'Eco',
    'Premium',
    'Express',
    'Standard',
    'Deep Clean',
    'Popular'
  ];

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă serviciile...</span>
          </div>
          <p className="mt-2">Se încarcă serviciile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🧽 Administrare Servicii</h3>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchServices}
          title="Actualizează lista"
        >
          🔄 Actualizează
        </button>
      </div>

      {/* ✅ FORM COMPLET PENTRU SERVICII */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {editingId ? '✏️ Editează serviciul' : '➕ Adaugă serviciu nou'}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nume serviciu *</label>
                <input 
                  name="name" 
                  className="form-control" 
                  placeholder="ex: Curățenie generală apartament" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Preț (RON) *</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="ex: 150.00" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Durată (minute)</label>
                <input 
                  name="duration"
                  type="number"
                  className="form-control" 
                  placeholder="ex: 120" 
                  value={formData.duration} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Categorie *</label>
                <select 
                  name="category"
                  className="form-select" 
                  value={formData.category} 
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selectează categoria</option>
                  {serviceCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Mărimea echipei</label>
                <input 
                  name="team_size"
                  type="number"
                  min="1"
                  className="form-control" 
                  placeholder="ex: 2" 
                  value={formData.team_size} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Badge serviciu</label>
                <select 
                  name="badge"
                  className="form-select" 
                  value={formData.badge} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Fără badge</option>
                  {serviceBadges.map(badge => (
                    <option key={badge} value={badge}>{badge}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Zonă de acoperire</label>
                <input 
                  name="area_coverage"
                  className="form-control" 
                  placeholder="ex: Pitesti" 
                  value={formData.area_coverage} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="col-12">
                <label className="form-label">Descriere serviciu *</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  rows="4"
                  placeholder="Descrie serviciul, ce include, timpul necesar, echipamentele folosite..." 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Caracteristici serviciu</label>
                <textarea 
                  name="features" 
                  className="form-control" 
                  rows="3"
                  placeholder="O caracteristică pe linie:&#10;Echipamente profesionale&#10;Produse ecologice&#10;Asigurare inclusa" 
                  value={formData.features} 
                  onChange={handleChange} 
                  disabled={isSubmitting}
                />
                <small className="form-text text-muted">
                  Scrie o caracteristică pe fiecare linie
                </small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">📸 Imagine serviciu</label>
                <input 
                  type="file" 
                  className="form-control" 
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={imageUploading || isSubmitting}
                />
                <small className="form-text text-muted">
                  Acceptă: JPG, PNG, GIF (max 5MB)
                </small>
                
                {imageUploading && (
                  <div className="mt-2">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    <small>Se încarcă imaginea...</small>
                  </div>
                )}
              </div>

              {/* Preview imagine */}
              {imagePreview && (
                <div className="col-md-6">
                  <label className="form-label">Preview imagine</label>
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Preview serviciu" 
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
                      🗑️ Elimină imaginea
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
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {editingId ? 'Se salvează...' : 'Se adaugă...'}
                  </>
                ) : (
                  editingId ? '✅ Salvează modificările' : '➕ Adaugă serviciu'
                )}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  ❌ Anulează
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ✅ LISTA SERVICII */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">📋 Lista servicii ({services.length})</h5>
        </div>
        <div className="card-body">
          {services.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h6 className="text-muted">Nu există servicii</h6>
              <p className="text-muted">Adaugă primul serviciu folosind formularul de mai sus.</p>
            </div>
          ) : (
            <div className="row">
              {services.map(service => (
                <div key={service.id} className="col-lg-6 col-xl-4 mb-3">
                  <div className="card h-100 shadow-sm">
                    {(service.image || service.image_url) && (
                      <img 
                        src={service.image || service.image_url} 
                        className="card-img-top" 
                        alt={service.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop&q=80';
                        }}
                      />
                    )}
                    <div className="card-body">
                      <h6 className="card-title text-primary">{service.name}</h6>
                      
                      {service.category && (
                        <span className="badge bg-light text-dark mb-2">{service.category}</span>
                      )}
                      
                      {service.badge && (
                        <span className="badge bg-info mb-2 ms-1">{service.badge}</span>
                      )}
                      
                      <p className="card-text text-muted small">
                        {service.description?.length > 100 
                          ? service.description.substring(0, 100) + '...' 
                          : service.description
                        }
                      </p>
                      
                      <div className="service-details mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="text-success">
                            {service.price} {service.price_unit || 'RON'}
                          </strong>
                          {service.duration && (
                            <small className="text-muted">⏱️ {service.duration} min</small>
                          )}
                        </div>
                        
                        <div className="mt-2 d-flex flex-wrap gap-1">
                          {service.team_size && (
                            <span className="badge bg-light text-dark">👥 {service.team_size} pers</span>
                          )}
                          {service.is_popular && (
                            <span className="badge bg-warning">⭐ Popular</span>
                          )}
                          {!service.is_available && (
                            <span className="badge bg-secondary">Indisponibil</span>
                          )}
                        </div>

                        {service.area_coverage && (
                          <div className="mt-2">
                            <small className="text-muted">📍 {service.area_coverage}</small>
                          </div>
                        )}
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-primary flex-fill" 
                          onClick={() => handleEdit(service)}
                          title="Editează serviciul"
                        >
                          ✏️ Editează
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDelete(service.id)}
                          title="Șterge serviciul"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-footer text-muted text-center">
                      <small>
                        ID: {service.id} • 
                        Creat: {new Date(service.created_at).toLocaleDateString('ro-RO')}
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

export default AdminServices;