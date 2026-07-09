import React, { createContext, useContext, useState, useEffect } from 'react';
import { tripApi } from '../api/tripApi';

const NotificationContext = createContext(null);

const buildNotifications = (trips) => {
  if (!trips || trips.length === 0) return [];

  const today = new Date();

  // Find the nearest upcoming/planning trip to pin notifications to
  const upcomingTrips = trips
    .filter((t) => {
      const status = t.tripStatus?.toUpperCase();
      return status === 'UPCOMING' || status === 'PLANNING';
    })
    .filter((t) => t.startDate && new Date(t.startDate + 'T00:00:00') > today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const primaryTrip = upcomingTrips[0] || trips[0];
  if (!primaryTrip) return [];

  const destination = `${primaryTrip.destinationCity || 'your trip'}`;
  const diffMs = primaryTrip.startDate
    ? new Date(primaryTrip.startDate + 'T00:00:00') - today
    : null;
  const daysUntil = diffMs != null ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : null;

  const notifications = [
    {
      id: 'weather-1',
      type: 'weather',
      message: `Rain expected on Day 3 of your ${destination} trip`,
      timestamp: '2h ago',
      unread: true,
      tripId: primaryTrip.id,
      colorClass: 'text-[#00796B] bg-[var(--tw-teal-light,#EDFAFA)] border border-[rgba(78,205,196,0.4)]',
      icon: '🌤️',
      tab: 'weather',
    },
    {
      id: 'budget-1',
      type: 'budget',
      message: `You've used 90% of your ${destination} budget`,
      timestamp: 'Yesterday',
      unread: true,
      tripId: primaryTrip.id,
      colorClass: 'text-[#D9693B] bg-[#FFF2F2] border border-[#FF8B8B]',
      icon: '💸',
      tab: 'budget',
    },
    {
      id: 'packing-1',
      type: 'packing',
      message: daysUntil != null
        ? `12 items still unpacked, trip starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
        : '12 items still unpacked for your upcoming trip',
      timestamp: '2 days ago',
      unread: false,
      tripId: primaryTrip.id,
      colorClass: 'text-[#2E7D32] bg-[#F0FBF1] border border-[rgba(107,203,119,0.4)]',
      icon: '🎒',
      tab: 'packing',
    },
    {
      id: 'reminder-1',
      type: 'reminder',
      message: daysUntil != null
        ? `Your trip to ${destination} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
        : `Your trip to ${destination} is coming up`,
      timestamp: '3 days ago',
      unread: false,
      tripId: primaryTrip.id,
      colorClass: 'text-[#D9693B] bg-[#FFF3EE] border border-[#FFAA85]',
      icon: '✈️',
      tab: '',
    },
  ];

  return notifications;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [ready, setReady] = useState(false);

  // Load real trips and build contextual notifications
  useEffect(() => {
    const load = async () => {
      try {
        const trips = await tripApi.getAllTrips();
        const built = buildNotifications(trips);
        setNotifications(built);

        // Simulate one "live" itinerary notification arriving after 5 seconds
        // Use the same primaryTrip logic as buildNotifications (nearest upcoming, not just trips[0])
        const today = new Date();
        const upcomingTrips = trips
          .filter((t) => {
            const status = t.tripStatus?.toUpperCase();
            return status === 'UPCOMING' || status === 'PLANNING';
          })
          .filter((t) => t.startDate && new Date(t.startDate + 'T00:00:00') > today)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const primaryTrip = upcomingTrips[0] || trips[0];
        if (primaryTrip) {
          setTimeout(() => {
            setNotifications((prev) => [
              {
                id: `itinerary-live-${Date.now()}`,
                type: 'itinerary',
                message: 'Two activities overlap on Day 2',
                timestamp: 'Just now',
                unread: true,
                tripId: primaryTrip.id,
                colorClass: 'text-[#7A5000] bg-[#FEF9E7] border border-[#FDD835]',
                icon: '⚠️',
                tab: 'itinerary',
              },
              ...prev,
            ]);
          }, 5000);
        }
      } catch {
        // If trips fail to load, show no notifications silently
        setNotifications([]);
      } finally {
        setReady(true);
      }
    };

    load();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearAll, ready }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
