import React from 'react';
import { useOutletContext } from 'react-router-dom';

const TripSummary = ({ trip }) => {
  const { activityCount } = useOutletContext();
  // Predefined icons based on trip types
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Beach':
        return <span className="badge" style={{ background: 'var(--tw-sky-light)', color: 'var(--tw-sky)', border: '1px solid var(--tw-sky-mid)' }}>🏖️ Beach</span>;
      case 'Romantic':
        return <span className="badge" style={{ background: 'var(--tw-lavender-light)', color: '#5E35B1', border: '1px solid rgba(201,184,255,.4)' }}>💋 Romantic</span>;
      case 'Food':
        return <span className="badge" style={{ background: 'var(--tw-peach-light)', color: 'var(--tw-peach)', border: '1px solid rgba(255,170,133,.4)' }}>🍽️ Food</span>;
      case 'Adventure':
        return <span className="badge" style={{ background: 'var(--tw-sage-light)', color: '#2E7D32', border: '1px solid var(--tw-sage)' }}>⛰️ Adventure</span>;
      case 'Cultural':
        return <span className="badge" style={{ background: 'var(--tw-sunset-light)', color: '#D84315', border: '1px solid var(--tw-sunset)' }}>🏛️ Cultural</span>;
      case 'Business':
        return <span className="badge" style={{ background: '#ECEFF1', color: '#37474F', border: '1px solid #CFD8DC' }}>💼 Business</span>;
      case 'Family':
        return <span className="badge" style={{ background: '#FFF8E1', color: '#F57F17', border: '1px solid #FFE082' }}>👨‍👩‍👧 Family</span>;
      default:
        return <span className="badge" style={{ background: '#F5F5F5', color: '#616161', border: '1px solid #E0E0E0' }}>🎭 {type || 'Other'}</span>;
    }
  };

  return (
    <div>
      <div className="overview-summary-card">
        <div className="overview-summary-title">Trip summary</div>
        <div className="overview-desc">
          {trip.description || "No description provided for this trip."}
        </div>
        <div className="overview-mini-stats">
          <div className="mini-stat">
            <div className="mini-stat-value">{trip.tripDuration || 0}</div>
            <div className="mini-stat-label">Days</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">{activityCount}</div>
            <div className="mini-stat-label">Activities</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">1</div>
            <div className="mini-stat-label">{trip.destinationCity || 'City'}</div>
          </div>
        </div>
      </div>

      <div className="overview-summary-card">
        <div className="overview-summary-title">Trip type</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {getTypeBadge(trip.tripType)}
        </div>
      </div>
    </div>
  );
};

export default TripSummary;
