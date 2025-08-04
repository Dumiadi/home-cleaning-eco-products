import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // ✅ IMPORT AUTHCONTEXT
import './UserProfile.css';

function UserProfile() {
  // ✅ FOLOSEȘTE AUTHCONTEXT ÎN LOC DE localStorage DIRECT
  const { user, updateUser, token } = useAuth();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '', 
    avatar: '' 
  });
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ POPULEAZĂ FORM CU DATELE DIN AUTHCONTEXT
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirm: '',
        avatar: user.avatar || ''
      });
      setPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('⚠️ Format invalid (acceptat: JPG, PNG, WEBP)');
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error('⚠️ Fișierul este prea mare (maxim 5MB)');
      return false;
    }
    
    return true;
  };

  const uploadToCloudinary = async (file) => {
    if (!validateFile(file)) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'cleaning_platform'); // ✅ CORESPUNDE CU CE E ÎN CLOUDINARY
    
    setPreview(URL.createObjectURL(file));
    setIsLoading(true);

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dsq8qbnga/image/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, avatar: data.secure_url }));
          setPreview(data.secure_url);
        toast.success('✅ Avatar încărcat!');
      } else {
        throw new Error('No secure_url in response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('❌ Eroare la upload avatar');
      setPreview(user?.avatar || null); // Reset to original
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadToCloudinary(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadToCloudinary(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // ✅ VALIDĂRI
    if (!formData.name.trim()) {
      return toast.error('Numele este obligatoriu');
    }

    if (!formData.email.trim()) {
      return toast.error('Email-ul este obligatoriu');
    }

    if (formData.password && formData.password !== formData.confirm) {
      return toast.error('Parolele nu coincid!');
    }

    if (formData.password && formData.password.length < 6) {
      return toast.error('Parola trebuie să aibă cel puțin 6 caractere');
    }

    setIsLoading(true);
    
    try {
      // ✅ FOLOSEȘTE TOKEN DIN AUTHCONTEXT
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          ...(formData.password && { password: formData.password }),
          avatar: formData.avatar
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('✅ Profil actualizat cu succes!');
        
        // ✅ ACTUALIZEAZĂ AUTHCONTEXT CU NOILE DATE
        updateUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          avatar: formData.avatar
        });
        
        setEditMode(false);
        setFormData(prev => ({ ...prev, password: '', confirm: '' }));
      } else {
        toast.error(data.message || 'Eroare la actualizarea profilului');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Eroare de rețea la actualizarea profilului');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOADING STATE DACĂ NU AVEM USER
  if (!user) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 user-profile">
      <h3 className="mb-4">👤 Profilul Meu</h3>
      
      <div className="card shadow-sm">
        <div className="card-body">
          
          {/* ✅ AVATAR UPLOAD SECTION */}
          <div
            className={`avatar-dropzone ${dragOver ? 'drag-over' : ''} ${isLoading ? 'uploading' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            {isLoading ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Se încarcă...</span>
                </div>
                <p className="mt-2">Se încarcă avatarul...</p>
              </div>
            ) : preview ? (
              <img src={preview} alt="Avatar" className="avatar-preview" />
            ) : (
              <p>🔽 Trage o imagine aici sau fă click</p>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
              disabled={isLoading}
            />
          </div>

          {/* ✅ FORM SECTION */}
          {editMode ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label">Nume *</label>
                <input 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input 
                  name="email" 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Parolă nouă (opțional)</label>
                <input 
                  name="password" 
                  type="password" 
                  className="form-control" 
                  value={formData.password} 
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Lasă gol dacă nu vrei să o schimbi"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Confirmă parola</label>
                <input 
                  name="confirm" 
                  type="password" 
                  className="form-control" 
                  value={formData.confirm} 
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Se salvează...
                    </>
                  ) : (
                    <>💾 Salvează</>
                  )}
                </button>
                <button 
                  className="btn btn-secondary" 
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData(prev => ({ ...prev, password: '', confirm: '' }));
                  }}
                  disabled={isLoading}
                >
                  Anulează
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nume:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.role && (
                    <p><strong>Rol:</strong> 
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} ms-2`}>
                        {user.role === 'admin' ? 'Administrator' : 'Utilizator'}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <button 
                className="btn btn-primary mt-3" 
                onClick={() => setEditMode(true)}
              >
                ✏️ Modifică profilul
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;