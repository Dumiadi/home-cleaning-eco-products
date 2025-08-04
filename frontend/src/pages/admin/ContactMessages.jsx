import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Phone, 
  Clock, 
  User, 
  MessageCircle, 
  CheckCircle,
  AlertTriangle,
  Reply,
  Eye,
  Building,
  Calendar,
  Flag,
  Send,
  X,
  RefreshCw,
  Search,
  Filter,
  Download,
  MoreVertical,
  Star,
  Globe,
  Smartphone
} from 'lucide-react';

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyModal, setReplyModal] = useState({ isOpen: false, message: null });
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const { token, user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterAndSearchMessages();
  }, [messages, filter, searchTerm, sortBy, sortOrder]);

  const fetchMessages = async () => {
    if (!token) {
      console.error('❌ No token available for fetching messages');
      return;
    }
    
    setIsLoading(true);
    console.log('📧 Fetching contact messages from:', 'http://localhost:5000/api/contact/admin');
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    
    try {
      const response = await fetch('http://localhost:5000/api/contact/admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages received:', data.length, 'messages');
        console.log('📧 Sample message:', data[0]);
        setMessages(data);
        toast.success(`Loaded ${data.length} contact messages`);
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', response.status, errorText);
        
        if (response.status === 401) {
          toast.error('Unauthorized: Please check your admin permissions');
        } else if (response.status === 403) {
          toast.error('Forbidden: Admin access required');
        } else {
          toast.error(`Error loading messages: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('💥 Network error fetching messages:', error);
      toast.error('Network error loading messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchMessages = () => {
    let filtered = [...messages];
    
    // Apply filter
    switch (filter) {
      case 'new':
        filtered = filtered.filter(m => m.status === 'new');
        break;
      case 'read':
        filtered = filtered.filter(m => m.status === 'read');
        break;
      case 'replied':
        filtered = filtered.filter(m => m.status === 'replied');
        break;
      case 'urgent':
        filtered = filtered.filter(m => m.urgency === 'urgent' || m.urgency === 'high');
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.subject.toLowerCase().includes(search) ||
        m.message.toLowerCase().includes(search) ||
        (m.company && m.company.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    setFilteredMessages(filtered);
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contact/admin/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === id ? { ...m, status: 'read', read_at: new Date().toISOString(), read_by: user.id } : m
        ));
        toast.success('Message marked as read');
      } else {
        toast.error('Error updating message status');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error updating message status');
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply content is required');
      return;
    }

    setIsReplying(true);
    try {
      const response = await fetch(`http://localhost:5000/api/contact/admin/${replyModal.message.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reply: replyContent,
          ccAdmin: true
        })
      });

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === replyModal.message.id ? { 
            ...m, 
            status: 'replied',
            replied_at: new Date().toISOString(),
            replied_by: user.id,
            reply_content: replyContent
          } : m
        ));
        setReplyModal({ isOpen: false, message: null });
        setReplyContent('');
        toast.success('Reply sent successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error sending reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Network error sending reply');
    } finally {
      setIsReplying(false);
    }
  };

  const testContactAPI = async () => {
    console.log('🧪 Testing contact API...');
    toast.info('Testing contact API...');
    
    try {
      // Test 1: Check if contact API endpoint exists
      const testResponse = await fetch('http://localhost:5000/api/contact/admin', {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🧪 HEAD request status:', testResponse.status);
      
      // Test 2: Try to send a test message (only in development)
      if (process.env.NODE_ENV === 'development') {
        const testMessage = {
          name: 'Test User (Admin)',
          email: 'admin-test@example.com',
          subject: 'Test Message from Admin Panel',
          message: 'This is a test message to verify the contact system is working correctly. Sent from the admin panel.',
          urgency: 'normal',
          preferredContact: 'email',
          service: 'General Cleaning',
          company: 'Admin Test'
        };
        
        const sendResponse = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testMessage)
        });
        
        console.log('🧪 Test message send status:', sendResponse.status);
        
        if (sendResponse.ok) {
          console.log('✅ Test message sent successfully');
          toast.success('Test message sent successfully! Refreshing...');
          setTimeout(() => fetchMessages(), 1000); // Refresh messages after 1 second
        } else {
          const errorData = await sendResponse.json();
          toast.error(`Test failed: ${errorData.error || 'Unknown error'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ API test failed:', error);
      toast.error('API test failed');
    }
  };

  const exportToCSV = () => {
    const csvData = filteredMessages.map(msg => ({
      ID: msg.id,
      Name: msg.name,
      Email: msg.email,
      Phone: msg.phone || '',
      Company: msg.company || '',
      Service: msg.service || '',
      Subject: msg.subject,
      Message: msg.message.replace(/\n/g, ' '),
      Status: msg.status,
      Urgency: msg.urgency,
      'Preferred Contact': msg.preferred_contact,
      'Created At': new Date(msg.created_at).toLocaleString(),
      'Read At': msg.read_at ? new Date(msg.read_at).toLocaleString() : '',
      'Replied At': msg.replied_at ? new Date(msg.replied_at).toLocaleString() : ''
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Messages exported to CSV');
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-yellow-100 text-yellow-800', 
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.new;
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-green-100 text-green-800'
    };
    return badges[urgency] || badges.normal;
  };

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'urgent') return '🚨';
    if (urgency === 'high') return '⚠️';
    if (urgency === 'normal') return '📝';
    return '💡';
  };

  const getContactIcon = (method) => {
    switch (method) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'email': 
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStats = () => {
    return {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      urgent: messages.filter(m => m.urgency === 'urgent' || m.urgency === 'high').length
    };
  };

  const stats = getMessageStats();

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading messages...</span>
          </div>
          <p className="mt-2">Loading contact messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">📧 Contact Messages</h3>
          <p className="text-muted mb-0">Manage customer inquiries and support requests</p>
        </div>
        <div className="d-flex gap-2">
          {process.env.NODE_ENV === 'development' && (
            <button 
              className="btn btn-outline-warning btn-sm"
              onClick={testContactAPI}
              title="Test contact API"
            >
              🧪 Test API
            </button>
          )}
          <button 
            className="btn btn-outline-success btn-sm"
            onClick={exportToCSV}
            disabled={filteredMessages.length === 0}
            title="Export to CSV"
          >
            <Download className="w-4 h-4 me-1" />
            Export
          </button>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={fetchMessages}
            title="Refresh messages"
          >
            <RefreshCw className="w-4 h-4 me-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">Total</h6>
              <h4 className="text-primary">{stats.total}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">New</h6>
              <h4 className="text-warning">{stats.new}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">Read</h6>
              <h4 className="text-info">{stats.read}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">Replied</h6>
              <h4 className="text-success">{stats.replied}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">Urgent</h6>
              <h4 className="text-danger">{stats.urgent}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center border-0 bg-light">
            <div className="card-body">
              <h6 className="text-muted">Filtered</h6>
              <h4 className="text-secondary">{filteredMessages.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search messages by name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="urgency">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="btn-group w-100">
            <button
              className={`btn btn-sm ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('desc')}
            >
              Newest First
            </button>
            <button
              className={`btn btn-sm ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('asc')}
            >
              Oldest First
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4">
        <ul className="nav nav-pills nav-fill">
          {[
            { key: 'all', label: 'All Messages', count: stats.total, color: 'primary' },
            { key: 'new', label: 'New', count: stats.new, color: 'warning' },
            { key: 'urgent', label: 'Urgent', count: stats.urgent, color: 'danger' },
            { key: 'replied', label: 'Replied', count: stats.replied, color: 'success' }
          ].map(tab => (
            <li key={tab.key} className="nav-item">
              <button
                className={`nav-link ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                <span className={`badge bg-${tab.color} me-2`}>{tab.count}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="text-muted mb-3">
              <Mail size={48} className="opacity-50" />
            </div>
            <h6 className="text-muted">No messages found</h6>
            <p className="text-muted">
              {filter === 'all' 
                ? searchTerm 
                  ? `No messages match "${searchTerm}"`
                  : 'No contact messages have been received yet.' 
                : `No ${filter} messages found.`
              }
            </p>
            {searchTerm && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredMessages.map(message => (
            <div key={message.id} className="col-lg-6 col-xl-4 mb-4">
              <div className={`card h-100 shadow-sm border-0 ${message.status === 'new' ? 'border-start border-warning border-3' : ''}`}>
                <div className="card-header bg-transparent d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">Message #{message.id}</h6>
                    <small className="text-muted">
                      <Calendar className="w-4 h-4 inline me-1" />
                      {formatDate(message.created_at)}
                    </small>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <span className={`badge ${getStatusBadge(message.status)} small`}>
                      {message.status.toUpperCase()}
                    </span>
                    <span className={`badge ${getUrgencyBadge(message.urgency)} small`}>
                      {getUrgencyIcon(message.urgency)} {message.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <h6 className="card-title text-primary mb-3" title={message.subject}>
                    {message.subject.length > 50 ? message.subject.substring(0, 50) + '...' : message.subject}
                  </h6>
                  
                  <div className="contact-details mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <User className="w-4 h-4 me-2 text-muted" />
                      <strong className="me-2">{message.name}</strong>
                      {message.company && (
                        <span className="badge bg-light text-dark small">
                          <Building className="w-3 h-3 me-1" />
                          {message.company}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <Mail className="w-4 h-4 me-2 text-muted" />
                      <a href={`mailto:${message.email}`} className="text-decoration-none small">
                        {message.email}
                      </a>
                    </div>
                    
                    {message.phone && (
                      <div className="d-flex align-items-center mb-2">
                        <Phone className="w-4 h-4 me-2 text-muted" />
                        <a href={`tel:${message.phone}`} className="text-decoration-none small">
                          {message.phone}
                        </a>
                      </div>
                    )}
                    
                    {message.service && (
                      <div className="d-flex align-items-center mb-2">
                        <CheckCircle className="w-4 h-4 me-2 text-muted" />
                        <span className="small">{message.service}</span>
                      </div>
                    )}
                    
                    <div className="d-flex align-items-center mb-2">
                      {getContactIcon(message.preferred_contact)}
                      <span className="small ms-2">
                        Prefers: {message.preferred_contact || 'email'}
                      </span>
                    </div>
                  </div>

                  <div className="message-preview mb-3">
                    <strong className="small">Message:</strong>
                    <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {message.message.length > 120 
                        ? message.message.substring(0, 120) + '...' 
                        : message.message
                      }
                    </p>
                  </div>

                  {message.reply_content && (
                    <div className="reply-preview mb-3">
                      <div className="alert alert-success alert-sm p-2">
                        <strong className="small">✅ Replied:</strong>
                        <p className="mb-0 small text-success">
                          {message.reply_content.length > 80 
                            ? message.reply_content.substring(0, 80) + '...' 
                            : message.reply_content
                          }
                        </p>
                        <small className="text-muted">
                          {formatDate(message.replied_at)}
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => setSelectedMessage(message)}
                      title="View full message"
                    >
                      <Eye className="w-4 h-4 me-1" />
                      View
                    </button>
                    
                    {message.status === 'new' && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => markAsRead(message.id)}
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setReplyModal({ isOpen: true, message })}
                      title="Reply to message"
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedMessage(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Message #{selectedMessage.id} - {selectedMessage.subject}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedMessage(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Name:</strong></td>
                          <td>{selectedMessage.name}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>
                            <a href={`mailto:${selectedMessage.email}`}>
                              {selectedMessage.email}
                            </a>
                          </td>
                        </tr>
                        {selectedMessage.phone && (
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>
                              <a href={`tel:${selectedMessage.phone}`}>
                                {selectedMessage.phone}
                              </a>
                            </td>
                          </tr>
                        )}
                        {selectedMessage.company && (
                          <tr>
                            <td><strong>Company:</strong></td>
                            <td>{selectedMessage.company}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Request Details</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Service:</strong></td>
                          <td>{selectedMessage.service || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td><strong>Priority:</strong></td>
                          <td>
                            <span className={`badge ${getUrgencyBadge(selectedMessage.urgency)}`}>
                              {getUrgencyIcon(selectedMessage.urgency)} {selectedMessage.urgency}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Contact Method:</strong></td>
                          <td>
                            <span className="d-flex align-items-center">
                              {getContactIcon(selectedMessage.preferred_contact)}
                              <span className="ms-2">{selectedMessage.preferred_contact}</span>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Status:</strong></td>
                          <td>
                            <span className={`badge ${getStatusBadge(selectedMessage.status)}`}>
                              {selectedMessage.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Received:</strong></td>
                          <td>{formatDate(selectedMessage.created_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <h6>Message Content</h6>
                <div className="border rounded p-3 bg-light">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.reply_content && (
                  <div className="mt-4">
                    <h6>Admin Reply</h6>
                    <div className="border rounded p-3 bg-success bg-opacity-10">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedMessage.reply_content}
                      </p>
                      <small className="text-muted">
                        Replied on: {formatDate(selectedMessage.replied_at)}
                      </small>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
                {selectedMessage.status === 'new' && (
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={() => {
                      markAsRead(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 me-1" />
                    Mark as Read
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => {
                    setReplyModal({ isOpen: true, message: selectedMessage });
                    setSelectedMessage(null);
                  }}
                >
                  <Reply className="w-4 h-4 me-1" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal.isOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Reply to {replyModal.message.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setReplyModal({ isOpen: false, message: null })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Original Message:</strong>
                  <div className="border rounded p-2 bg-light mt-2">
                    <small><strong>Subject:</strong> {replyModal.message.subject}</small>
                    <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                      {replyModal.message.message.length > 200 
                        ? replyModal.message.message.substring(0, 200) + '...'
                        : replyModal.message.message
                      }
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Your Reply *</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Dear ${replyModal.message.name},\n\nThank you for contacting Eco Cleaning Services...\n\nBest regards,\nCustomer Service Team`}
                    disabled={isReplying}
                  />
                </div>

                <div className="alert alert-info">
                  <small>
                    <strong>Note:</strong> This reply will be sent to {replyModal.message.email} 
                    and a copy will be sent to your admin email.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setReplyModal({ isOpen: false, message: null });
                    setReplyContent('');
                  }}
                  disabled={isReplying}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={sendReply}
                  disabled={isReplying || !replyContent.trim()}
                >
                  {isReplying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 me-1" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactMessages;