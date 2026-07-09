import React from 'react';
import ActivityCard from './ActivityCard';

const ActivityTimeline = ({ activities, onEdit, onDelete, onAdd }) => {
  // Frontend overlap detection (assuming activities are sorted by startTime)
  const checkOverlap = (curr, prev) => {
    if (!curr || !prev) return false;
    const [h1, m1] = curr.startTime.split(':');
    const dCurrStart = new Date(2000, 0, 1, h1, m1);
    
    const [h2, m2] = prev.endTime.split(':');
    let dPrevEnd = new Date(2000, 0, 1, h2, m2);
    
    // If end time is before start time, it likely crossed midnight
    const [ph1, pm1] = prev.startTime.split(':');
    const dPrevStart = new Date(2000, 0, 1, ph1, pm1);
    if (dPrevEnd < dPrevStart) {
      dPrevEnd.setDate(dPrevEnd.getDate() + 1);
    }

    return dCurrStart < dPrevEnd;
  };

  return (
    <div className="itinerary-timeline">
      {activities.map((activity, index) => {
        const isOverlapping = index > 0 && checkOverlap(activity, activities[index - 1]);
        
        return (
          <React.Fragment key={activity.id}>
            {isOverlapping && (
              <div className="overlap-warning">
                &#9888;&#65039; Overlap warning: this activity conflicts with the previous one
              </div>
            )}
            <ActivityCard 
              activity={activity} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </React.Fragment>
        );
      })}
      
      <div className="add-activity-btn" onClick={onAdd}>
        &#43; Add activity
      </div>
    </div>
  );
};

export default ActivityTimeline;
