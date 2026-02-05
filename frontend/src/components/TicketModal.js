import React, { useState } from 'react';
import axios from 'axios';

// Configure axios for backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const TicketModal = ({ event, onClose }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !consent) {
      alert('Please provide your email and consent to continue.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/ticket-click', {
        email,
        consent,
        eventId: event._id
      });
      
      // Redirect to original event URL
      window.open(event.originalUrl, '_blank');
      onClose();
    } catch (error) {
      console.error('Error saving ticket click:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Get Tickets for {event.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <label htmlFor="consent">
              I consent to receive event updates and newsletters
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Processing...' : 'Continue to Tickets'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;