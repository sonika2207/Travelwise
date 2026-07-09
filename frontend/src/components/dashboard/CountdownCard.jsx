import React, { useState, useEffect } from 'react';

const pad = (n) => String(n).padStart(2, '0');

const CountdownCard = ({ trip }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!trip) return;

    const tick = () => {
      const now = new Date();
      const target = new Date(trip.startDate + 'T00:00:00');
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [trip]);

  if (!trip) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-5 rounded-[20px] mb-7 px-7 py-6"
      style={{
        background: 'var(--tw-countdown-bg)',
        border: '1.5px solid var(--tw-countdown-border)',
      }}
    >
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tw-stat-timer-color)] mb-1">Next trip</div>
        <div className="font-serif text-[22px] font-bold text-[var(--tw-text-heading)]">
          🌴 {trip.destinationCity}, {trip.destinationCountry}
        </div>
        <div className="text-[13px] text-[var(--tw-text-muted)] mt-0.5">
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          {trip.tripDuration ? ` · ${trip.tripDuration} days` : ''}
        </div>
      </div>

      <div className="flex gap-4">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.mins, label: 'Mins' },
          { value: timeLeft.secs, label: 'Secs' },
        ].map((unit) => (
          <div
            key={unit.label}
            className="text-center bg-[var(--tw-countdown-unit-bg)] border border-[var(--tw-countdown-border)] rounded-xl px-4 py-3 min-w-[64px]"
          >
            <div className="font-serif text-[28px] font-extrabold text-[var(--tw-text-heading)] leading-none">
              {pad(unit.value)}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--tw-text-muted)] mt-1">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownCard;
