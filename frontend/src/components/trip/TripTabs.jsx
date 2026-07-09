import React from 'react';

const TripTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Overview', icon: '📋' },
    { id: 'Itinerary', icon: '📅' },
    { id: 'Weather', icon: '⛅' },
    { id: 'Packing', icon: '🎒' },
    { id: 'Budget', icon: '💸' },
    { id: 'Map', icon: '🗺️' },
  ];

  return (
    <div className="trip-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`trip-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon} {tab.id}
        </div>
      ))}
    </div>
  );
};

export default TripTabs;
