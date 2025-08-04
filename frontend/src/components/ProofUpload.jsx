import React, { useState } from 'react';
import { toast } from 'react-toastify';

function ProofUpload({ bookingId, onUploaded }) {
  const [file, setFile] = useState(null);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return toast.warning('Selectează un fișier');

    const formData = new FormData();
    formData.append('proof', file); // ⚠️ nume important: "proof"

    try {
      const res = await fetch(`http://localhost:5000/api/users/upload-proof/${bookingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Imagine încărcată cu succes!');
        onUploaded && onUploaded(data.imagePath);
        setFile(null);
      } else {
        toast.error(data.message || 'Eroare la upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Eroare rețea');
    }
  };

  return (
    <div className="mt-3">
      <label className="form-label">Încarcă dovadă serviciu (poză):</label>
      <input type="file" accept="image/*" className="form-control mb-2" onChange={handleChange} />
      <button className="btn btn-success btn-sm" onClick={handleUpload}>📤 Încarcă</button>
    </div>
  );
}

export default ProofUpload;
