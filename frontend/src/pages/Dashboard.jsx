import React, { useState, useMemo } from 'react';
import Topbar from '../components/dashboard/Topbar';
import DashboardHero from '../components/dashboard/DashboardHero';
import DashboardStats from '../components/dashboard/DashboardStats';
import CountdownCard from '../components/dashboard/CountdownCard';
import FilterTabs from '../components/dashboard/FilterTabs';
import TripGrid from '../components/dashboard/TripGrid';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import { useTrips } from '../hooks/useTrips';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const context = useOutletContext();
  const upcomingTrip = context?.upcomingTrip;
  const { trips, loading, refetch } = useTrips();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <>
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
              <DashboardHero
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <DashboardStats trips={trips} />

              {upcomingTrip && <CountdownCard trip={upcomingTrip} />}

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
                <TripGrid trips={filteredTrips} onRefresh={refetch} />
              )}
            </motion.div>
          )}
      </div>
    </>
  );
};

export default Dashboard;
