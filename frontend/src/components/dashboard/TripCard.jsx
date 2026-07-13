import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { tripApi } from '../../api/tripApi';

// Map status strings to badge styles (using theme variables)
const STATUS_BADGE = {
  PLANNING: { bg: 'var(--tw-badge-planning-bg)', color: 'var(--tw-badge-planning-color)', border: '1px solid var(--tw-badge-planning-border)', label: 'Planning' },
  UPCOMING: { bg: 'var(--tw-badge-upcoming-bg)', color: 'var(--tw-badge-upcoming-color)', border: '1px solid var(--tw-badge-upcoming-border)', label: 'Upcoming' },
  ONGOING: { bg: 'var(--tw-badge-ongoing-bg)', color: 'var(--tw-badge-ongoing-color)', border: '1px solid var(--tw-badge-ongoing-border)', label: 'Ongoing' },
  COMPLETED: { bg: 'var(--tw-badge-completed-bg)', color: 'var(--tw-badge-completed-color)', border: '1px solid var(--tw-badge-completed-border)', label: 'Completed' },
};

// Fallback gradients when no cover photo
const COVER_GRADIENTS = [
  'linear-gradient(135deg,#4A90D9,#6BCB77)',
  'linear-gradient(135deg,#C9B8FF,#FF8B8B)',
  'linear-gradient(135deg,#F9C74F,#FFAA85)',
  'linear-gradient(135deg,#4ECDC4,#4A90D9)',
  'linear-gradient(135deg,#6BCB77,#4ECDC4)',
  'linear-gradient(135deg,#FFAA85,#C9B8FF)',
];

const formatDateRange = (start, end) => {
  if (!start) return '';
  const s = new Date(start + 'T00:00:00');
  const e = end ? new Date(end + 'T00:00:00') : null;
  const opts = { month: 'short', day: 'numeric' };
  return e
    ? `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
    : s.toLocaleDateString('en-US', opts);
};

const TripCard = ({ trip, index, onNavigate, onRefresh }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const statusKey = trip.tripStatus?.toUpperCase() || 'PLANNING';
  const badge = STATUS_BADGE[statusKey] || STATUS_BADGE.PLANNING;
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/trips/${trip.id}/edit`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    setConfirmDelete(false);
    try {
      await tripApi.deleteTrip(trip.id);
      toast.success('Trip deleted successfully');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <motion.div
      onClick={onNavigate}
      whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-card-hover)' }}
      className="bg-[var(--tw-bg-card)] rounded-[20px] overflow-hidden border border-[var(--tw-border-light)] transition-colors duration-300 cursor-pointer"
      style={{ boxShadow: 'var(--tw-shadow-card)' }}
    >
      {/* Cover */}
      <div className="h-[150px] relative overflow-hidden flex items-end" style={!trip.coverPhotoUrl ? { background: gradient } : {}}>
        {trip.coverPhotoUrl && (
          <img
            src={trip.coverPhotoUrl}
            alt={trip.destinationCity}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.60) 0%, transparent 55%)' }}
        />
        <div className="relative z-10 px-4 pb-3.5 w-full">
          <div
            className="font-serif text-[18px] font-bold text-white"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
          >
            {trip.destinationCity}, {trip.destinationCountry}
          </div>
          <div className="text-xs text-white/80 mt-0.5">{trip.destinationCountry}</div>
        </div>
      </div>

      {/* Body */}
      <div className="px-[18px] py-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--tw-text-muted)] mb-3.5">
          <span>📅</span>
          {formatDateRange(trip.startDate, trip.endDate)}
          {trip.tripDuration ? ` · ${trip.tripDuration} days` : ''}
        </div>

        {/* Progress bar placeholder (no packingPercentage in API — show duration info instead) */}
        <div className="flex justify-between text-xs text-[var(--tw-text-muted)] mb-1.5">
          <span>Trip duration</span>
          <span className="font-semibold" style={{ color: 'var(--color-sage)' }}>{trip.tripDuration ?? '—'} days</span>
        </div>
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--tw-progress-track)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: statusKey === 'COMPLETED' ? '100%' : statusKey === 'ONGOING' ? '50%' : '20%',
              background: statusKey === 'COMPLETED'
                ? 'linear-gradient(90deg,#6BCB77,#52D68A)'
                : 'linear-gradient(90deg,#4A90D9,#4ECDC4)',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-[18px] py-3 border-t border-[var(--tw-card-footer-border)] bg-[var(--tw-card-footer-bg)]"
      >
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-[0.05em] uppercase"
          style={{ background: badge.bg, color: badge.color, border: badge.border }}
        >
          {badge.label}
        </span>
        <div className="flex gap-1.5">
          <div 
            onClick={handleEdit}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--tw-text-muted)] border border-[var(--tw-btn-icon-border)] cursor-pointer text-sm hover:bg-[var(--tw-btn-icon-hover)] bg-[var(--tw-btn-icon-bg)] transition-colors"
          >
            ✏
          </div>
          <div className="relative">
            <div 
              onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); setConfirmDelete(false); }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--tw-text-muted)] border border-[var(--tw-btn-icon-border)] cursor-pointer text-sm hover:bg-[var(--tw-btn-icon-hover)] bg-[var(--tw-btn-icon-bg)] transition-colors"
            >
              ⋮
            </div>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-2 w-36 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-20"
                >
                  {!confirmDelete ? (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                      className="px-4 py-2.5 text-[13px] font-semibold text-[#E53E3E] cursor-pointer hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <span>🗑</span> Delete Trip
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50" onClick={e => e.stopPropagation()}>
                      <p className="text-[11px] font-bold text-[#E53E3E] mb-2 text-center">Are you sure?</p>
                      <div className="flex gap-2">
                        <button onClick={handleDelete} className="flex-1 bg-[#E53E3E] text-white rounded-[6px] text-[11px] py-1.5 font-semibold hover:bg-red-600 transition-colors">Yes</button>
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-[6px] text-[11px] py-1.5 font-semibold hover:bg-gray-100 transition-colors">No</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;
