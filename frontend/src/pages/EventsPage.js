import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

// Configure axios for backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    city: 'Sydney'
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/events?${params}`);
      setEvents(response.data.events);
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="filters">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Search Events</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, venue, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">City</label>
            <select
              className="form-input"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Brisbane">Brisbane</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error">{error}</div>
      )}

      <div className="events-grid">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="loading">No events found matching your criteria.</div>
      )}
    </div>
  );
};

export default EventsPage;