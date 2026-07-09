import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardHero = ({ searchQuery, onSearchChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';

  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  return (
    <div
      className="relative overflow-hidden rounded-[28px] mb-6"
      style={{
        background: 'var(--tw-hero-gradient)',
        padding: '36px 40px',
        minHeight: '180px',
      }}
    >
      {/* Plane watermark */}
      <div
        className="absolute select-none pointer-events-none"
        style={{
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%) rotate(20deg)',
          fontSize: '120px',
          opacity: 0.14,
        }}
      >
        ✈️
      </div>

      <div className="font-serif text-[30px] font-bold text-white mb-1" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
        {greeting}, {firstName} {greetingEmoji}
      </div>
      <div className="text-[15px] text-white/85 mb-5">Where to next?</div>

      {/* Hero search */}
      <div
        className="flex items-center gap-2.5 max-w-[480px] relative z-10"
        style={{
          background: 'var(--tw-hero-search-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--tw-hero-search-border)',
          borderRadius: '16px',
          padding: '12px 18px',
          color: '#fff',
        }}
      >
        <span className="text-sm opacity-85">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search destinations, trips..."
          className="bg-transparent border-none outline-none text-sm text-white w-full font-[inherit] placeholder:text-white/70"
        />
      </div>
    </div>
  );
};

export default DashboardHero;
