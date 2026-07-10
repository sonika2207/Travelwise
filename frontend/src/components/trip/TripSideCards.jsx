import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { expenseApi } from '../../api/expenseApi';

const DEFAULT_CHECKLIST = [
  { id: 'flights', label: 'Flights booked', done: false },
  { id: 'acc', label: 'Accommodation confirmed', done: false },
  { id: 'ins', label: 'Travel insurance', done: false },
  { id: 'curr', label: 'Currency exchanged', done: false }
];

const TripSideCards = ({ trip }) => {
  const { packingProgress } = useOutletContext();
  const [spent, setSpent] = useState(0);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  // Load checklist from localStorage and spent from API
  useEffect(() => {
    if (!trip?.id) return;
    
    // Budget
    expenseApi.getExpenseSummary(trip.id)
      .then(res => setSpent(res.totalAmount || 0))
      .catch(() => {});

    // Checklist
    const saved = localStorage.getItem(`travelwise_checklist_${trip.id}`);
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
      } catch (e) {}
    } else {
      setChecklist(DEFAULT_CHECKLIST);
    }
  }, [trip?.id]);

  const toggleChecklist = (id) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    localStorage.setItem(`travelwise_checklist_${trip.id}`, JSON.stringify(updated));
  };

  const packPercent = packingProgress.total > 0
    ? Math.round((packingProgress.packed / packingProgress.total) * 100)
    : null;
    
  const remainingBudget = (trip?.budget || 0) - spent;

  return (
    <div>
      <div className="side-card">
        <div className="side-card-title">Trip checklist</div>
        {checklist.map(item => (
          <div 
            key={item.id} 
            className="checklist-row cursor-pointer select-none hover:bg-gray-50 transition-colors p-1 -mx-1 rounded"
            onClick={() => toggleChecklist(item.id)}
          >
            <div className={`check-dot ${item.done ? 'done' : 'pending'}`}>
              {item.done ? '✓' : ''}
            </div>
            <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="side-card">
        <div className="side-card-title">Quick stats</div>
        {trip.budget && (
          <div className="checklist-row">
            <span>&#128176;</span>&nbsp;
            {trip.destinationCurrency} {remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining
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
