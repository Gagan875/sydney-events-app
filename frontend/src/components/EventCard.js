import React, { useState } from 'react';
import TicketModal from './TicketModal';

const EventCard = ({ event }) => {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGetTickets = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="event-card">
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="event-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="event-content">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-date">{formatDate(event.dateTime)}</p>
          {event.venueName && (
            <p className="event-venue">{event.venueName}</p>
          )}
          {event.description && (
            <p className="event-description">
              {event.description.length > 150 
                ? `${event.description.substring(0, 150)}...` 
                : event.description
              }
            </p>
          )}
          <p className="event-source">Source: {event.sourceName}</p>
          <button 
            onClick={handleGetTickets}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            GET TICKETS
          </button>
        </div>
      </div>
      
      {showModal && (
        <TicketModal 
          event={event}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default EventCard;