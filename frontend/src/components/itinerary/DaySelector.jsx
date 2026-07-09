import React from 'react';

const DaySelector = ({ days, selectedDayId, onSelectDay }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="day-selector overflow-x-auto pb-1 mb-6 flex gap-2">
      {days.map((day) => (
        <div
          key={day.id}
          className={`day-pill ${selectedDayId === day.id ? 'active' : ''}`}
          onClick={() => onSelectDay(day.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="day-pill-num">Day {day.dayNumber}</div>
          <div className="day-pill-date">{formatDate(day.tripDate)}</div>
        </div>
      ))}
    </div>
  );
};

export default DaySelector;
