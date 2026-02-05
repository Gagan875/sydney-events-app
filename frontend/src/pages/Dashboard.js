import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Configure axios for backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    city: 'Sydney'
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const [eventsResponse, statsResponse] = await Promise.all([
        api.get(`/api/dashboard/events?${params}`),
        api.get('/api/dashboard/stats')
      ]);

      setEvents(eventsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportEvent = async (eventId, importNotes = '') => {
    try {
      const response = await api.put(
        `/api/dashboard/events/${eventId}/import`,
        { importNotes }
      );

      setEvents(prev => prev.map(event => 
        event._id === eventId ? response.data : event
      ));

      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent(response.data);
      }
    } catch (error) {
      console.error('Error importing event:', error);
      alert('Failed to import event. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="loading">Please log in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Event Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents || 0}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalClicks || 0}</div>
          <div className="stat-label">Ticket Clicks</div>
        </div>
        {stats.statusCounts && stats.statusCounts.map(stat => (
          <div key={stat._id} className="stat-card">
            <div className="stat-number">{stat.count}</div>
            <div className="stat-label">{stat._id.charAt(0).toUpperCase() + stat._id.slice(1)} Events</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="updated">Updated</option>
              <option value="inactive">Inactive</option>
              <option value="imported">Imported</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <div className="dashboard-content">
          {/* Events Table */}
          <div className="events-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr 
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{event.title}</td>
                    <td>{formatDate(event.dateTime)}</td>
                    <td>{event.venueName || 'N/A'}</td>
                    <td>
                      <span className={getStatusBadgeClass(event.status)}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      {event.status !== 'imported' && (
                        <button
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            const notes = prompt('Import notes (optional):');
                            if (notes !== null) {
                              handleImportEvent(event._id, notes);
                            }
                          }}
                        >
                          Import
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Event Preview */}
          <div className="event-preview">
            <h3 className="preview-title">Event Preview</h3>
            {selectedEvent ? (
              <div>
                <h4>{selectedEvent.title}</h4>
                <p><strong>Date:</strong> {formatDate(selectedEvent.dateTime)}</p>
                <p><strong>Venue:</strong> {selectedEvent.venueName || 'N/A'}</p>
                <p><strong>City:</strong> {selectedEvent.city}</p>
                <p><strong>Source:</strong> {selectedEvent.sourceName}</p>
                <p><strong>Status:</strong> 
                  <span className={getStatusBadgeClass(selectedEvent.status)}>
                    {selectedEvent.status}
                  </span>
                </p>
                {selectedEvent.description && (
                  <div>
                    <strong>Description:</strong>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
                {selectedEvent.importedBy && (
                  <div>
                    <p><strong>Imported by:</strong> {selectedEvent.importedBy.name}</p>
                    <p><strong>Imported at:</strong> {formatDate(selectedEvent.importedAt)}</p>
                    {selectedEvent.importNotes && (
                      <p><strong>Notes:</strong> {selectedEvent.importNotes}</p>
                    )}
                  </div>
                )}
                <a 
                  href={selectedEvent.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}
                >
                  View Original
                </a>
              </div>
            ) : (
              <p>Select an event to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;