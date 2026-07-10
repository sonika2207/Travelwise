import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TripHero = ({ trip, onDelete, activityCount, packingProgress }) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const getYear = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const formattedStart = formatDate(trip.startDate);
  const formattedEnd = formatDate(trip.endDate);
  const year = getYear(trip.startDate);

  // Background style handling
  const heroStyle = trip.coverPhotoUrl
    ? {
      backgroundImage: `url(http://localhost:8080${trip.coverPhotoUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
    : {}; // default gradient is in CSS class

  return (
    <div className="trip-hero" style={heroStyle}>
      <div className="trip-hero-overlay"></div>
      <div className="trip-hero-content">
        <div className="trip-hero-topbar">
          <div className="trip-hero-back" onClick={() => navigate(-1)}>
            &larr; My Trips
          </div>
          <div className="trip-hero-actions">
            <div className="trip-hero-action-btn" onClick={() => navigate(`/trips/${trip.id}/edit`)}>&#9998; Edit</div>
            {!confirmDelete ? (
              <div className="trip-hero-action-btn" onClick={() => setConfirmDelete(true)}>
                &#128465;&#65039; Delete
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-white/20">
                <span className="text-xs font-semibold text-white">Delete trip?</span>
                <button onClick={onDelete} className="bg-red-500 hover:bg-red-600 px-3 py-1 text-xs rounded-full transition-colors font-bold text-white">Yes</button>
                <button onClick={() => setConfirmDelete(false)} className="bg-white/30 hover:bg-white/40 px-3 py-1 text-xs rounded-full transition-colors font-bold text-white">No</button>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="trip-hero-title">
            &#127796; {trip.tripName || trip.destinationCity}
          </div>
          <div className="trip-hero-meta">
            <span>
              {formattedStart} &ndash; {formattedEnd}, {year}
            </span>
            <span>&middot;</span>
            <span>{trip.tripDuration || 0} days</span>
            <span>&middot;</span>
            <span>{trip.tripStatus || 'Planning'}</span>
          </div>
          <div className="trip-hero-chips">
            {trip.budget && (
              <div className="trip-hero-chip">
                💰 Budget: {trip.destinationCurrency} {trip.budget?.toLocaleString()}
              </div>
            )}
            {packingProgress.total > 0 && (
              <div className="trip-hero-chip">&#127958;&#65039; {Math.round((packingProgress.packed / packingProgress.total) * 100)}% packed</div>
            )}
            <div className="trip-hero-chip">&#128203; {activityCount} {activityCount === 1 ? 'activity' : 'activities'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHero;
