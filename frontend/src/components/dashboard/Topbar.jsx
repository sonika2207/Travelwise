import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const Topbar = ({ searchQuery = '', onSearchChange = () => { }, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <div
      className="flex items-center justify-between px-8 bg-[var(--tw-bg-card)] border-b border-[var(--tw-border-light)] sticky top-0 z-20"
      style={{ height: '68px' }}
    >
      <div className="text-[20px] font-bold text-[var(--tw-text-heading)] tracking-[-0.01em]">{title}</div>

      <div className="flex items-center gap-3 relative">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[var(--tw-bg-subtle)] border-[1.5px] border-[var(--tw-border)] rounded-xl px-3.5 py-2" style={{ width: '280px' }}>
          <span className="text-[var(--tw-text-light)] text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search destinations, trips..."
            className="bg-transparent border-none outline-none text-sm text-[var(--tw-text-muted)] w-full font-[inherit] placeholder:text-[var(--tw-text-light)]"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative w-[52px] h-[28px] rounded-full border-none cursor-pointer transition-colors duration-300"
          style={{ background: 'var(--tw-toggle-bg)' }}
        >
          <div
            className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-transform duration-300 ease-in-out"
            style={{
              background: 'var(--tw-toggle-thumb)',
              left: isDark ? '27px' : '3px'
            }}
          />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <div
            id="notif-bell-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`w-[38px] h-[38px] rounded-lg border border-[var(--tw-border)] flex items-center justify-center text-[18px] cursor-pointer transition-colors ${isNotifOpen ? 'bg-white shadow-sm border-[var(--tw-border-light)]' : 'bg-[var(--tw-bg-subtle)] text-[var(--tw-text-muted)]'}`}
          >
            🔔
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF8B8B] border-2 flex items-center justify-center text-[9px] text-white font-bold"
                style={{ borderColor: 'var(--tw-bg-card)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* New Trip button */}
        <button
          onClick={() => navigate('/trips/new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none transition-all"
          style={{
            background: '#4A90D9',
            boxShadow: '0 2px 12px rgba(74,144,217,0.28)',
          }}
        >
          + New Trip
        </button>
      </div>
    </div>
  );
};

export default Topbar;
