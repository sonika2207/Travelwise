import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Mark all as read when opening
  useEffect(() => {
    if (isOpen) {
      markAllAsRead();
    }
  }, [isOpen, markAllAsRead]);

  // Handle click outside and Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the bell button itself (handled by Topbar)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('#notif-bell-btn')) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notif) => {
    if (notif.tripId && notif.tab) {
      navigate(`/trips/${notif.tripId}/${notif.tab}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[50px] right-0 w-[360px] max-h-[480px] bg-[var(--tw-bg-card)] rounded-[var(--tw-r-lg)] shadow-[var(--tw-shadow-lg)] border border-[var(--tw-border-light)] flex flex-col z-50 overflow-hidden"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--tw-border-light)] bg-white z-10">
            <h3 className="m-0 font-serif text-lg font-bold text-[var(--tw-text-heading)]">Notifications</h3>
          </div>

          <div className="overflow-y-auto flex-1 p-2 bg-[var(--tw-bg-app)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-[200px]">
                <div className="text-4xl mb-3 opacity-80">🎉</div>
                <div className="font-serif text-lg font-bold text-[var(--tw-text-heading)] mb-1">You're all caught up</div>
                <div className="text-sm text-[var(--tw-text-muted)]">No new notifications right now.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="relative flex items-start gap-3 p-3 bg-white rounded-[var(--tw-r-md)] border border-[var(--tw-border-light)] cursor-pointer hover:border-[var(--tw-border)] hover:shadow-sm transition-all"
                  >
                    {notif.unread && (
                      <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[var(--color-coral)]"></div>
                    )}

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[18px] ${notif.colorClass}`}>
                      {notif.icon}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className="m-0 text-[13px] text-[var(--tw-text-body)] leading-tight mb-1.5">{notif.message}</p>
                      <span className="text-[11px] font-medium text-[var(--tw-text-light)]">{notif.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
