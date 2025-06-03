import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/admin/products')
      .then(res => res.json())
      .then(setProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'cleaning_platform'); // ←  presetul din Cloudinary
    data.append('cloud_name', 'dsq8qbnga');  // ←  cloud_name-ul 

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/cloud_name_tau/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      setFormData({ ...formData, image: result.secure_url });
      toast.success('✅ Imagine încărcată cu succes!');
    } catch (err) {
      toast.error('❌ Eroare la upload imagine.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/admin/products/${editingId}`
      : `http://localhost:5000/api/admin/products`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    toast.success(editingId ? 'Produs modificat!' : 'Produs adăugat!');
    setFormData({ name: '', description: '', price: '', category: '', image: '' });
    setEditingId(null);
    fetchProducts();
  };

  const handleEdit = (prod) => {
    setFormData(prod);
    setEditingId(prod.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ștergi acest produs?')) return;
    await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
    toast.info('Produs șters!');
    fetchProducts();
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">🛍️ Administrare Produse</h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <input name="name" className="form-control" placeholder="Nume" value={formData.name} onChange={handleChange} required />
          <input name="description" className="form-control" placeholder="Descriere" value={formData.description} onChange={handleChange} required />
          <input name="price" className="form-control" placeholder="Preț (RON)" value={formData.price} onChange={handleChange} required />
          <input name="category" className="form-control" placeholder="Categorie" value={formData.category} onChange={handleChange} />
          <input type="file" className="form-control" onChange={handleImageUpload} />
          {imageUploading && <p>Se încarcă imaginea...</p>}
          {formData.image && <img src={formData.image} alt="Preview" className="img-fluid mt-2" style={{ maxHeight: '100px' }} />}
        </div>
        <button className="btn btn-success mt-3">
          {editingId ? '✅ Salvează modificările' : '➕ Adaugă produs'}
        </button>
      </form>

      <ul className="list-group">
        {products.map(prod => (
          <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{prod.name}</strong> – {prod.price} RON
              {prod.image && <img src={prod.image} alt="produs" style={{ height: '40px', marginLeft: '10px' }} />}
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(prod)}>✏️</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(prod.id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProducts;
