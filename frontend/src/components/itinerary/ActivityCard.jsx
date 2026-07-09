import React from 'react';

const ActivityCard = ({ activity, onEdit, onDelete }) => {
  const getIconAndColors = (category) => {
    switch (category?.toLowerCase()) {
      case 'travel':
      case 'flight':
        return { icon: '✈️', bg: 'var(--tw-sky-light)', color: 'var(--tw-sky)' };
      case 'accommodation':
      case 'hotel':
        return { icon: '🏨', bg: 'var(--tw-sand)', color: 'var(--tw-sand-dark)' };
      case 'food':
      case 'restaurant':
        return { icon: '🍽️', bg: 'var(--tw-peach-light)', color: 'var(--tw-peach)' };
      case 'sightseeing':
        return { icon: '📸', bg: 'var(--tw-teal-light)', color: 'var(--tw-teal)' };
      default:
        return { icon: '📍', bg: 'var(--tw-bg-subtle)', color: 'var(--tw-text-muted)' };
    }
  };

  const { icon, bg, color } = getIconAndColors(activity.category);

  // Format times
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // timeStr is usually "HH:mm:ss"
    return timeStr.substring(0, 5); 
  };

  // Calculate duration
  const getDuration = () => {
    if (!activity.startTime || !activity.endTime) return '';
    const [h1, m1] = activity.startTime.split(':');
    const [h2, m2] = activity.endTime.split(':');
    const d1 = new Date(2000, 0, 1, h1, m1);
    let d2 = new Date(2000, 0, 1, h2, m2);
    if (d2 < d1) d2.setDate(d2.getDate() + 1);
    const diffMs = d2 - d1;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  return (
    <div className="activity-item">
      <div className="activity-dot"></div>
      <div className="activity-card">
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="activity-time">{formatTime(activity.startTime)}</div>
          <div className="activity-name">{activity.title}</div>
          <div className="activity-meta">
            <span>{getDuration()}</span>
            <span>&middot;</span>
            <span>{activity.category}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="btn-icon" onClick={() => onEdit(activity)}>&#9998;</div>
          <div className="btn-icon" onClick={() => onDelete(activity.id)}>&#128465;&#65039;</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
