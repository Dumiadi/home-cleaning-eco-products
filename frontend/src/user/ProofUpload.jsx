// ProofUpload.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function ProofUpload({ bookingId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('proof', file);

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/proof`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Dovada a fost încărcată!');
        onUploaded(data.path);
      } else {
        toast.error(data.message || 'Eroare la upload');
      }
    } catch (err) {
      toast.error('Eroare la rețea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <label className="form-label">Încarcă dovada serviciului:</label>
      <input
        type="file"
        className="form-control"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        className="btn btn-outline-success btn-sm mt-2"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Se încarcă...' : '📤 Încarcă'}
      </button>
    </div>
  );
}

export default ProofUpload;
