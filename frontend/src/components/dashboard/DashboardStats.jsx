import React, { useMemo } from 'react';

const STAT_CONFIGS = [
  {
    key: 'total',
    label: 'Total trips',
    icon: '✈️',
    iconBg: 'var(--tw-stat-plane-bg)',
    iconColor: 'var(--tw-stat-plane-color)',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    icon: '📍',
    iconBg: 'var(--tw-stat-pin-bg)',
    iconColor: 'var(--tw-stat-pin-color)',
  },
  {
    key: 'ongoing',
    label: 'Ongoing',
    icon: '🏕️',
    iconBg: 'var(--tw-stat-tent-bg)',
    iconColor: 'var(--tw-stat-tent-color)',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '⏳',
    iconBg: 'var(--tw-stat-timer-bg)',
    iconColor: 'var(--tw-stat-timer-color)',
  },
];

const DashboardStats = ({ trips }) => {
  const stats = useMemo(() => {
    const total = trips.length;
    const upcoming = trips.filter((t) => t.tripStatus?.toUpperCase() === 'UPCOMING').length;
    const ongoing = trips.filter((t) => t.tripStatus?.toUpperCase() === 'ONGOING').length;
    const completed = trips.filter((t) => t.tripStatus?.toUpperCase() === 'COMPLETED').length;
    return { total, upcoming, ongoing, completed };
  }, [trips]);

  return (
    <div className="grid grid-cols-4 gap-3.5 mb-6 max-lg:grid-cols-2">
      {STAT_CONFIGS.map((cfg) => (
        <div
          key={cfg.key}
          className="flex items-center gap-3.5 bg-[var(--tw-bg-card)] rounded-2xl p-5 border border-[var(--tw-border-light)]"
          style={{ boxShadow: 'var(--tw-shadow-stat)' }}
        >
          <div
            className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
            style={{ background: cfg.iconBg, color: cfg.iconColor }}
          >
            {cfg.icon}
          </div>
          <div>
            <div className="text-[26px] font-bold text-[var(--tw-text-heading)] leading-none">{stats[cfg.key]}</div>
            <div className="text-xs text-[var(--tw-text-muted)] mt-0.5 font-medium">{cfg.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
