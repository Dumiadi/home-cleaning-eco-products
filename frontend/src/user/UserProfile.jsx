import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import './UserProfile.css';

function UserProfile() {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', avatar: '' });
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({ name: data.name, email: data.email, password: '', confirm: '', avatar: data.avatar || '' });
        setPreview(data.avatar || null);
      })
      .catch(() => toast.error('Eroare la încărcarea profilului'));
  }, [token]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  const uploadToCloudinary = async (file) => {
    if (!validateFile(file)) {
      return toast.error('⚠️ Format invalid (acceptat: JPG, PNG, WEBP)');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload'); // înlocuiește dacă ai preset diferit
    setPreview(URL.createObjectURL(file));

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dsq8qbnga/image/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setForm(prev => ({ ...prev, avatar: data.secure_url }));
      toast.success('✅ Avatar încărcat!');
    } catch (err) {
      toast.error('Eroare la upload!');
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

    if (form.password && form.password !== form.confirm) {
      return toast.warning('Parolele nu coincid!');
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('✅ Profil actualizat!');
        setUser({ ...user, ...form });
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), user: { ...user, ...form } }));
        setEditMode(false);
      } else {
        toast.error(data.message || 'Eroare la actualizare');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  return (
    <div className="container py-4 user-profile">
      <h3 className="mb-4">👤 Profilul Meu</h3>
      {user && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div
              className={`avatar-dropzone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
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
              />
            </div>

            {editMode ? (
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label>Nume</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label>Parolă nouă (opțional)</label>
                  <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label>Confirmă parola</label>
                  <input name="confirm" type="password" className="form-control" value={form.confirm} onChange={handleChange} />
                </div>
                <button className="btn btn-success me-2" type="submit">💾 Salvează</button>
                <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Anulează</button>
              </form>
            ) : (
              <>
                <p><strong>Nume:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button className="btn btn-primary me-2" onClick={() => setEditMode(true)}>✏️ Modifică</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;






// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import './UserProfile.css';

// function UserProfile() {
//   const token = JSON.parse(localStorage.getItem('user'))?.token;
//   const [user, setUser] = useState(null);
//   const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', avatar: '' });
//   const [editMode, setEditMode] = useState(false);
//   const [preview, setPreview] = useState(null);
//   const [loadingUpload, setLoadingUpload] = useState(false);

//   useEffect(() => {
//     fetch('http://localhost:5000/api/users/profile', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         setUser(data);
//         setForm({
//           name: data.name,
//           email: data.email,
//           password: '',
//           confirm: '',
//           avatar: data.avatar || ''
//         });
//         setPreview(data.avatar || null);
//       })
//       .catch(() => toast.error('Eroare la încărcarea profilului'));
//   }, [token]);

//   const handleChange = (e) => {
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('image', file);

//     setLoadingUpload(true);
//     try {
//       const res = await fetch('http://localhost:5000/api/upload', {
//         method: 'POST',
//         body: formData
//       });

//       const data = await res.json();
//       setForm(prev => ({ ...prev, avatar: data.imageUrl }));
//       setPreview(data.imageUrl);
//       toast.success('Poză actualizată!');
//     } catch {
//       toast.error('Eroare la upload poză');
//     } finally {
//       setLoadingUpload(false);
//     }
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     if (form.password && form.password !== form.confirm) {
//       return toast.warning('Parolele nu coincid!');
//     }

//     try {
//       const res = await fetch('http://localhost:5000/api/users/update', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(form)
//       });

//       const data = await res.json();
//       if (res.ok) {
//         toast.success('✅ Profil actualizat!');
//         setUser(data.user || { ...user, ...form });
//         localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), user: data.user || form }));
//         setEditMode(false);
//       } else {
//         toast.error(data.message || 'Eroare la actualizare');
//       }
//     } catch {
//       toast.error('Eroare de rețea');
//     }
//   };

//   return (
//     <div className="container py-4 user-profile">
//       <h3 className="mb-4">👤 Profilul Meu</h3>
//       {user && (
//         <div className="card shadow-sm">
//           <div className="card-body">
//             <div className="text-center mb-4">
//               {preview ? (
//                 <img src={preview} alt="avatar" className="avatar-preview" />
//               ) : (
//                 <div className="avatar-placeholder">Fără poză</div>
//               )}
//               {editMode && (
//                 <div className="mt-2">
//                   <input type="file" accept="image/*" onChange={handleImageUpload} />
//                   {loadingUpload && <p>⏳ Se încarcă poza...</p>}
//                 </div>
//               )}
//             </div>

//             {editMode ? (
//               <form onSubmit={handleUpdate}>
//                 <div className="mb-3">
//                   <label>Nume</label>
//                   <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
//                 </div>
//                 <div className="mb-3">
//                   <label>Email</label>
//                   <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
//                 </div>
//                 <div className="mb-3">
//                   <label>Parolă nouă (opțional)</label>
//                   <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} />
//                 </div>
//                 <div className="mb-3">
//                   <label>Confirmă parola</label>
//                   <input name="confirm" type="password" className="form-control" value={form.confirm} onChange={handleChange} />
//                 </div>
//                 <button className="btn btn-success me-2" type="submit">💾 Salvează</button>
//                 <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Anulează</button>
//               </form>
//             ) : (
//               <>
//                 <p><strong>Nume:</strong> {user.name}</p>
//                 <p><strong>Email:</strong> {user.email}</p>
//                 <button className="btn btn-primary me-2" onClick={() => setEditMode(true)}>✏️ Modifică</button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserProfile;


























// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import './UserProfile.css';

// function UserProfile() {
//   const [user, setUser] = useState(null);
//   const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
//   const [avatar, setAvatar] = useState(null);
//   const token = JSON.parse(localStorage.getItem('user'))?.token;

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const res = await fetch('http://localhost:5000/api/users/profile', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       setUser(data);
//       setForm({ name: data.name, email: data.email, password: '', confirm: '' });
//     };
//     fetchProfile();
//   }, [token]);

//   const handleChange = (e) =>
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (form.password && form.password !== form.confirm) {
//       return toast.warning('Parolele nu coincid');
//     }

//     try {
//       const res = await fetch('http://localhost:5000/api/users/update', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message);
//       toast.success('✅ Profil actualizat');
//     } catch {
//       toast.error('Eroare de rețea');
//     }
//   };

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const res = await fetch('http://localhost:5000/api/upload', {
//         method: 'POST',
//         body: formData
//       });
//       const data = await res.json();

//       if (data.imageUrl) {
//         // Trimite URL-ul spre backend pentru salvare
//         await fetch('http://localhost:5000/api/users/update-avatar', {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ avatar: data.imageUrl })
//         });

//         setUser(prev => ({ ...prev, avatar: data.imageUrl }));
//         toast.success('📸 Poză de profil actualizată!');
//       }
//     } catch {
//       toast.error('Eroare la upload');
//     }
//   };

//   return (
//     <div className="container py-4">
//       <h3 className="mb-4">👤 Profilul Meu</h3>
//       {user && (
//         <div className="card p-4 shadow-sm user-profile-card">
//           <div className="text-center mb-3">
//             <img
//               src={user.avatar || 'https://via.placeholder.com/120'}
//               alt="avatar"
//               className="rounded-circle"
//               width="120"
//               height="120"
//             />
//             <div className="mt-2">
//               <input type="file" onChange={handleUpload} className="form-control" />
//             </div>
//           </div>

//           <form onSubmit={handleUpdate}>
//             <div className="mb-3">
//               <label className="form-label">Nume</label>
//               <input name="name" value={form.name} onChange={handleChange} className="form-control" />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input name="email" value={form.email} onChange={handleChange} className="form-control" type="email" />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Parolă nouă</label>
//               <input name="password" value={form.password} onChange={handleChange} className="form-control" type="password" />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Confirmă parola</label>
//               <input name="confirm" value={form.confirm} onChange={handleChange} className="form-control" type="password" />
//             </div>
//             <button className="btn btn-primary">Salvează modificările</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserProfile;
