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
      <div
        className="flex flex-col flex-shrink-0 sticky top-0 h-screen bg-[var(--tw-bg-sidebar)] border-r border-[var(--tw-border-light)]"
        style={{ width: '260px', zIndex: 30 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-[11px] px-5 py-[22px] border-b border-[var(--tw-border-light)] cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4A90D9] to-[#4ECDC4] flex items-center justify-center text-[18px]">✈️</div>
          <div className="font-serif text-[20px] font-bold text-[var(--tw-text-heading)] tracking-[-0.02em]">TravelWise</div>
        </div>

        {/* Nav */}
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--tw-text-light)] px-5 pt-4 pb-1.5">Main</div>

        {/* Main Sections */}
        {MAIN_NAV.map((item) => {
          const isTripShortcutActive = TRIP_SHORTCUTS.some(shortcut => location.pathname.includes(`/${shortcut.tab}`));
          
          let isActive = false;
          if (item.prefixMatch) {
            isActive = location.pathname.startsWith(item.prefixMatch) && !isTripShortcutActive;
          } else {
            isActive = location.pathname === item.to;
          }

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
        {TRIP_SHORTCUTS.map((item) => {
          const isActive = location.pathname.includes(`/${item.tab}`);
          return (
            <div
              key={item.label}
              onClick={() => handleShortcutClick(item.tab)}
              className={`flex items-center gap-[11px] py-2.5 text-sm font-medium cursor-pointer transition-all
              ${isActive
                ? 'bg-[var(--tw-active-nav-bg)] text-[var(--tw-active-nav-color)] font-semibold border-l-[3px] border-[var(--tw-active-nav-color)] rounded-r-xl mx-0 pl-[19px] pr-4'
                : 'text-[var(--tw-text-muted)] border-l-[3px] border-transparent rounded-xl mx-2.5 px-4 hover:bg-[var(--tw-bg-subtle)]'
              }`}
            >
              <span className="text-[16px]">{item.icon}</span> {item.label}
            </div>
          );
        })}

        {/* Bottom section */}
        <div className="mt-auto relative" ref={menuContainerRef}>

          {/* ── Account popup menu ── */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '12px',
                  right: '12px',
                  zIndex: 50,
                  borderRadius: '14px',
                  background: 'var(--tw-bg-card)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* User header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--tw-border-light)',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: user?.profilePhotoUrl ? `url(${user.profilePhotoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #4A90D9, #4ECDC4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '14px', fontWeight: 700,
                    border: user?.profilePhotoUrl ? '1px solid var(--tw-border-light)' : 'none'
                  }}>
                    {!user?.profilePhotoUrl && initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 600,
                      color: 'var(--tw-text-heading)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {user?.name || 'Traveler'}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--tw-text-light)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {user?.email || ''}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px' }}>
                  {/* Account settings */}
                  <div
                    onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--tw-text-body)',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--tw-bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '7px',
                      background: 'var(--tw-bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px',
                    }}>⚙️</span>
                    Account settings
                  </div>

                  {/* Help & support */}
                  <div
                    onClick={() => { setIsMenuOpen(false); navigate('/support'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--tw-text-body)',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--tw-bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '7px',
                      background: 'var(--tw-bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px',
                    }}>❓</span>
                    Help &amp; support
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'var(--tw-border-light)', margin: '4px 0' }} />

                  {/* Log out */}
                  <div
                    onClick={() => { setIsMenuOpen(false); setIsLogoutModalOpen(true); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 500,
                      color: '#E53E3E',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '7px',
                      background: '#FFF5F5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px',
                    }}>↩</span>
                    Log out
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Upcoming trip pill ── */}
          {upcomingTrip && (
            <div
              style={{
                margin: '0 12px 8px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--tw-trip-pill-bg)',
                border: '1px solid var(--tw-trip-pill-border)',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/trips/${upcomingTrip.id}`)}
            >
              <div style={{
                fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--tw-text-light)', marginBottom: '5px',
              }}>
                Upcoming Trip
              </div>
              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: 'var(--tw-text-heading)',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                🌴 {upcomingTrip.destinationCity}, {upcomingTrip.destinationCountry}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--tw-text-muted)', marginTop: '3px',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {upcomingTrip.daysUntil != null && (
                  <>
                    <span style={{
                      background: 'var(--tw-active-nav-bg)',
                      color: 'var(--tw-active-nav-color)',
                      fontSize: '10px', fontWeight: 600,
                      padding: '1px 6px', borderRadius: '20px',
                    }}>
                      in {upcomingTrip.daysUntil} day{upcomingTrip.daysUntil !== 1 ? 's' : ''}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {upcomingTrip.tripStatus}
                </span>
              </div>
            </div>
          )}

          {/* ── User row (trigger) ── */}
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px',
              borderTop: '1px solid var(--tw-border-light)',
              cursor: 'pointer',
              transition: 'background 0.15s',
              borderRadius: '0 0 0 0',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--tw-bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: user?.profilePhotoUrl ? `url(${user.profilePhotoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #4A90D9, #4ECDC4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: 700,
              border: user?.profilePhotoUrl ? '1px solid var(--tw-border-light)' : 'none'
            }}>
              {!user?.profilePhotoUrl && initials}
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: 'var(--tw-text-heading)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name || 'Traveler'}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--tw-text-light)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email || ''}
              </div>
            </div>

            {/* Chevron */}
            <div style={{
              fontSize: '10px', color: 'var(--tw-text-light)',
              transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}>
              ▲
            </div>
          </div>
        </div>
      </div>

      {/* ── Logout confirmation Modal ── */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target.classList.contains('modal-backdrop')) {
                setIsLogoutModalOpen(false);
              }
            }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(2px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                background: 'var(--tw-bg-card)',
                borderRadius: '20px',
                padding: '32px 28px 28px',
                width: '340px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: '#FFF5F5', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
              }}>
                ↩
              </div>

              <div style={{
                fontSize: '17px', fontWeight: 700,
                color: 'var(--tw-text-heading)', marginBottom: '8px',
              }}>
                Log out of TravelWise?
              </div>

              <div style={{
                fontSize: '13px', color: 'var(--tw-text-muted)',
                lineHeight: '1.5', marginBottom: '24px',
              }}>
                You'll need to sign in again to access your trips, itineraries, and saved plans.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: '1.5px solid var(--tw-border)',
                    background: 'transparent',
                    fontSize: '13px', fontWeight: 600,
                    color: 'var(--tw-text-body)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--tw-bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setIsLogoutModalOpen(false); logout(); }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: 'none', background: '#E53E3E',
                    fontSize: '13px', fontWeight: 600,
                    color: '#fff', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#C53030'}
                  onMouseLeave={e => e.currentTarget.style.background = '#E53E3E'}
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
