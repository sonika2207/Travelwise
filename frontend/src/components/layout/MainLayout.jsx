import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import { useTrips } from '../../hooks/useTrips';

const MainLayout = () => {
  const { trips } = useTrips();

  // Find nearest upcoming trip for Sidebar pill
  const upcomingTrip = useMemo(() => {
    if (!trips) return null;
    const today = new Date();
    const upcoming = trips
      .filter((t) => {
        const status = t.tripStatus?.toUpperCase();
        return status === 'UPCOMING' || status === 'PLANNING';
      })
      .filter((t) => t.startDate && new Date(t.startDate + 'T00:00:00') > today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (upcoming.length === 0) return null;

    const nearest = upcoming[0];
    const diffMs = new Date(nearest.startDate + 'T00:00:00') - today;
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...nearest, daysUntil };
  }, [trips]);

  return (
    <div className="flex min-h-screen bg-[var(--tw-bg-app)] text-[var(--tw-text-body)] transition-colors duration-300">
      <Sidebar upcomingTrip={upcomingTrip} />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet context={{ upcomingTrip }} />
      </div>
    </div>
  );
};

export default MainLayout;
