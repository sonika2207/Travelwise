import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-[72px] mb-4 select-none">🗺️</div>
      <div className="font-serif text-2xl font-bold text-[var(--tw-text-heading)] mb-2">No trips yet</div>
      <div className="text-[var(--tw-text-muted)] text-sm mb-8 max-w-[320px]">
        Your next adventure is just a click away. Start planning your first trip!
      </div>
      <button
        onClick={() => navigate('/trips/new')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer border-none transition-all"
        style={{
          background: '#4A90D9',
          boxShadow: '0 2px 12px rgba(74,144,217,0.28)',
        }}
      >
        + Create your first trip
      </button>
    </div>
  );
};

export default EmptyState;
