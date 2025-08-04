import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SupportMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { token } = useAuth();

  // Preia mesajele de suport
  const fetchSupportMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/support/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(data);
        setLoading(false);
      } else {
        toast.error('Eroare la preluarea mesajelor');
        setLoading(false);
      }
    } catch (error) {
      console.error('Eroare preluare mesaje:', error);
      toast.error('Eroare de rețea');
      setLoading(false);
    }
  };

  // Răspunde la mesaj
  const handleReplyMessage = async (messageId, replyText) => {
    try {
      const response = await fetch(`http://localhost:5000/api/support/reply/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          reply: replyText,
          messageId 
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Răspuns trimis cu succes!');
        fetchSupportMessages(); // Reîncarcă mesajele
        setSelectedMessage(null);
      } else {
        toast.error(data.message || 'Eroare la trimiterea răspunsului');
      }
    } catch (error) {
      console.error('Eroare trimitere răspuns:', error);
      toast.error('Eroare de rețea');
    }
  };

  useEffect(() => {
    fetchSupportMessages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Lista Mesaje */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>📨 Mesaje Suport</h5>
            </div>
            <div className="list-group list-group-flush">
              {messages.map(message => (
                <button 
                  key={message.id}
                  className={`list-group-item list-group-item-action ${selectedMessage?.id === message.id ? 'active' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{message.subject}</h6>
                    <small>{new Date(message.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p className="mb-1 text-truncate">{message.message}</p>
                  <small>{message.name}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalii Mesaj */}
        <div className="col-md-8">
          {selectedMessage ? (
            <div className="card">
              <div className="card-header">
                <h5>📝 Detalii Mesaj</h5>
              </div>
              <div className="card-body">
                <h6>📌 Subiect: {selectedMessage.subject}</h6>
                <p>👤 De la: {selectedMessage.name} ({selectedMessage.email})</p>
                <p>📅 Primit la: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                
                <div className="border-top pt-3 mt-3">
                  <h6>💬 Mesaj:</h6>
                  <p>{selectedMessage.message}</p>
                </div>

                {/* Formular Răspuns */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const replyText = e.target.replyText.value;
                  handleReplyMessage(selectedMessage.id, replyText);
                }}>
                  <div className="mb-3">
                    <label className="form-label">Răspuns:</label>
                    <textarea 
                      name="replyText" 
                      className="form-control" 
                      rows="4" 
                      placeholder="Scrie răspunsul tău..."
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    🚀 Trimite Răspuns
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              Selectează un mesaj pentru a vedea detaliile
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportMessages;