import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const MAIN_NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/trips', icon: '✈️', label: 'My Trips', prefixMatch: '/trips' },
];

const TRIP_SHORTCUTS = [
  { tab: 'itinerary', icon: '📅', label: 'Itinerary' },
  { tab: 'weather', icon: '🌤️', label: 'Weather' },
  { tab: 'packing', icon: '🏖️', label: 'Packing' },
  { tab: 'budget', icon: '💵', label: 'Budget' },
  { tab: 'map', icon: '🗺️', label: 'Map' },
];

const Sidebar = ({ upcomingTrip }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuContainerRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const tripMatch = location.pathname.match(/^\/trips\/(\d+)/);
  const routeTripId = tripMatch ? tripMatch[1] : null;
  const activeTripId = routeTripId || upcomingTrip?.id;

  const handleShortcutClick = (tab) => {
    if (activeTripId) {
      navigate(`/trips/${activeTripId}/${tab}`);
    } else {
      toast.info('Please select or create a trip first.');
      navigate('/trips');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsLogoutModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.div
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-shrink-0 sticky top-0 h-screen bg-[var(--tw-bg-sidebar)] border-r border-[var(--tw-border-light)]"
        style={{ width: '260px', zIndex: 30 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-[11px] px-5 py-[22px] border-b border-[var(--tw-border-light)] cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4A90D9] to-[#4ECDC4] flex items-center justify-center text-[18px]">✈️</div>
          <div className="font-serif text-[20px] font-bold text-[var(--tw-text-heading)] tracking-[-0.02em]">Wanderly</div>
        </div>

        {/* Nav */}
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--tw-text-light)] px-5 pt-4 pb-1.5">Main</div>
        
        {/* Main Sections */}
        {MAIN_NAV.map((item) => {
          const isActive = item.prefixMatch 
            ? location.pathname.startsWith(item.prefixMatch)
            : location.pathname === item.to;
            
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`flex items-center gap-[11px] py-2.5 text-sm font-medium cursor-pointer no-underline transition-all
              ${isActive
                ? 'bg-[var(--tw-active-nav-bg)] text-[var(--tw-active-nav-color)] font-semibold border-l-[3px] border-[var(--tw-active-nav-color)] rounded-r-xl mx-0 pl-[19px] pr-4'
                : 'text-[var(--tw-text-muted)] border-l-[3px] border-transparent rounded-xl mx-2.5 px-4 hover:bg-[var(--tw-bg-subtle)]'
              }`}
            >
              <span className="text-[16px]">{item.icon}</span> {item.label}
            </div>
          );
        })}

        {/* Trip Shortcuts */}
        {TRIP_SHORTCUTS.map((item) => (
          <div
            key={item.label}
            onClick={() => handleShortcutClick(item.tab)}
            className="flex items-center gap-[11px] py-2.5 text-sm font-medium cursor-pointer transition-all text-[var(--tw-text-muted)] border-l-[3px] border-transparent rounded-xl mx-2.5 px-4 hover:bg-[var(--tw-bg-subtle)]"
          >
            <span className="text-[16px]">{item.icon}</span> {item.label}
          </div>
        ))}

        <div className="mt-auto relative" ref={menuContainerRef}>
          {/* Account Settings dropdown panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="account-menu"
              >
                <div className="account-menu-header">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#4ECDC4] flex items-center justify-center text-white text-[13px] font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="account-menu-name truncate">{user?.name || 'Traveler'}</div>
                    <div className="account-menu-email truncate">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="account-menu-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="menu-icon">⚙️</span> Account settings
                </div>
                <div className="account-menu-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="menu-icon">❓</span> Help &amp; support
                </div>
                <div className="account-menu-divider"></div>
                <div
                  className="account-menu-item danger"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                >
                  <span className="menu-icon">🚪</span> Log out
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming trip pill */}
          {upcomingTrip && (
            <div
              className="mx-3 mb-0 p-3.5 rounded-2xl cursor-pointer"
              style={{
                background: 'var(--tw-trip-pill-bg)',
                border: `1px solid var(--tw-trip-pill-border)`,
              }}
              onClick={() => navigate(`/trips/${upcomingTrip.id}`)}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--tw-text-muted)] mb-1">Upcoming trip</div>
              <div className="text-sm font-semibold text-[var(--tw-text-heading)]">
                🌴 {upcomingTrip.destinationCity}, {upcomingTrip.destinationCountry}
              </div>
              <div className="text-[11px] text-[var(--tw-text-muted)] mt-0.5">
                {upcomingTrip.daysUntil != null ? `in ${upcomingTrip.daysUntil} days` : ''} · {upcomingTrip.tripStatus}
              </div>
            </div>
          )}

          {/* User row */}
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sidebar-user flex items-center gap-[11px] px-4 py-3.5 border-t border-[var(--tw-border-light)] mt-3"
          >
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-[#4A90D9] to-[#4ECDC4] flex items-center justify-center text-white text-[13px] font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[var(--tw-text-heading)] truncate">{user?.name || 'Traveler'}</div>
              <div className="text-[11px] text-[var(--tw-text-light)] truncate">{user?.email || ''}</div>
            </div>
            <div className="sidebar-user-chevron">
              {isMenuOpen ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logout confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target.classList.contains('modal-backdrop')) {
                setIsLogoutModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="logout-modal"
            >
              <div className="logout-modal-icon">🚪</div>
              <div className="logout-modal-title">Log out of Wanderly?</div>
              <div className="logout-modal-sub">
                You'll need to sign in again to access your trips, itineraries, and saved plans.
              </div>
              <div className="logout-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger-solid"
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    logout();
                  }}
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
