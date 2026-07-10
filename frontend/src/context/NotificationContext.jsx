import React, { createContext, useContext, useState, useEffect } from 'react';
import { tripApi } from '../api/tripApi';

const NotificationContext = createContext(null);

const buildNotifications = (trips) => {
  return [];
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
