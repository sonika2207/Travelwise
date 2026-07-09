import React, { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import FilterTabs from '../components/dashboard/FilterTabs';
import TripGrid from '../components/dashboard/TripGrid';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import { useTrips } from '../hooks/useTrips';
import { motion } from 'framer-motion';

const MyTrips = () => {
  const { trips, loading } = useTrips();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Find nearest upcoming trip for Sidebar pill
  const upcomingTrip = useMemo(() => {
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

  // Filter trips by tab
  const tabFilteredTrips = useMemo(() => {
    if (activeTab === 'All') return trips;
    return trips.filter(
      (t) => t.tripStatus?.toUpperCase() === activeTab.toUpperCase()
    );
  }, [trips, activeTab]);

  // Filter trips by search query (city or country)
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredTrips;
    const q = searchQuery.toLowerCase();
    return tabFilteredTrips.filter(
      (t) =>
        t.destinationCity?.toLowerCase().includes(q) ||
        t.destinationCountry?.toLowerCase().includes(q)
    );
  }, [tabFilteredTrips, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[var(--tw-bg-app)] text-[var(--tw-text-body)] transition-colors duration-300">
      <Sidebar upcomingTrip={upcomingTrip} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="p-8 flex-1">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 font-serif text-3xl font-bold text-[var(--tw-text-heading)]">My Trips</div>
              <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {filteredTrips.length === 0 && !loading ? (
                trips.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="text-center py-16 text-[#718096]">
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="text-sm font-medium">No trips match your search</div>
                  </div>
                )
              ) : (
                <TripGrid trips={filteredTrips} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
