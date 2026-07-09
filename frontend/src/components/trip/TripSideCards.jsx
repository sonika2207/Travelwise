import React from 'react';
import { useOutletContext } from 'react-router-dom';

const TripSideCards = ({ trip }) => {
  const { packingProgress } = useOutletContext();
  const packPercent = packingProgress.total > 0
    ? Math.round((packingProgress.packed / packingProgress.total) * 100)
    : null;

  return (
    <div>
      <div className="side-card">
        <div className="side-card-title">Trip checklist</div>
        <div className="checklist-row">
          <div className="check-dot done">&#10003;</div>
          Flights booked
        </div>
        <div className="checklist-row">
          <div className="check-dot done">&#10003;</div>
          Accommodation confirmed
        </div>
        <div className="checklist-row">
          <div className="check-dot pending"></div>
          Travel insurance
        </div>
        <div className="checklist-row">
          <div className="check-dot pending"></div>
          Currency exchanged
        </div>
      </div>
      
      <div className="side-card">
        <div className="side-card-title">Quick stats</div>
        {trip.budget && (
          <div className="checklist-row">
            <span>&#128176;</span>&nbsp;
            {trip.destinationCurrency} {(trip.budget * 0.42).toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining
          </div>
        )}
        {packPercent !== null && (
          <div className="checklist-row">
            <span>&#127958;&#65039;</span>&nbsp;{packingProgress.packed} of {packingProgress.total} packed ({packPercent}%)
          </div>
        )}
        {packPercent === null && (
          <div className="checklist-row" style={{ color: 'var(--tw-text-muted)' }}>
            <span>&#127958;&#65039;</span>&nbsp;No packing list yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TripSideCards;
