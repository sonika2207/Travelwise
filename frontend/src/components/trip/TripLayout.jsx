import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tripApi } from '../../api/tripApi';
import { dayApi } from '../../api/dayApi';
import { activityApi } from '../../api/activityApi';
import { packingApi } from '../../api/packingApi';
import Sidebar from '../dashboard/Sidebar';
import Topbar from '../dashboard/Topbar';
import TripHero from './TripHero';
import TripTabs from './TripTabs';
import { useTrips } from '../../hooks/useTrips';

const TripLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { trips } = useTrips();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityCount, setActivityCount] = useState(0);
  const [packingProgress, setPackingProgress] = useState({ packed: 0, total: 0 });

  // Determine active tab from URL
  const pathParts = location.pathname.split('/');
  let activeTab = 'Overview';
  if (pathParts.length > 3) {
    // e.g. /trips/1/itinerary
    const tabPart = pathParts[3];
    activeTab = tabPart.charAt(0).toUpperCase() + tabPart.slice(1);
  }

  const upcomingTrip = useMemo(() => {
    const today = new Date();
    const upcoming = trips
      .filter((t) => t.tripStatus?.toUpperCase() === 'UPCOMING' || t.tripStatus?.toUpperCase() === 'PLANNING')
      .filter((t) => t.startDate && new Date(t.startDate + 'T00:00:00') > today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    if (upcoming.length === 0) return null;
    const nearest = upcoming[0];
    const diffMs = new Date(nearest.startDate + 'T00:00:00') - today;
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...nearest, daysUntil };
  }, [trips]);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const data = await tripApi.getTripById(id);
        setTrip(data);
      } catch (error) {
        toast.error('Failed to load trip details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchTripDetails();
    }
  }, [id, navigate]);

  // Fetch real activity count and packing progress in the background
  useEffect(() => {
    if (!id) return;
    const fetchStats = async () => {
      try {
        const days = await dayApi.getDaysForTrip(id);
        const activityCounts = await Promise.all(
          days.map(day => activityApi.getActivitiesByDay(day.id).then(a => a.length).catch(() => 0))
        );
        setActivityCount(activityCounts.reduce((sum, c) => sum + c, 0));
      } catch (_) {}
      try {
        const progress = await packingApi.getProgress(id);
        setPackingProgress({ packed: progress.packed ?? 0, total: progress.total ?? 0 });
      } catch (_) {}
    };
    fetchStats();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await tripApi.deleteTrip(id);
        toast.success('Trip deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'Overview') {
      navigate(`/trips/${id}`);
    } else {
      navigate(`/trips/${id}/${tabId.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--tw-bg-app)] text-[var(--tw-text-body)]">
        <Sidebar upcomingTrip={upcomingTrip} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-[var(--tw-text-muted)] text-lg">Loading trip details...</div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="flex min-h-screen bg-[var(--tw-bg-app)] text-[var(--tw-text-body)] transition-colors duration-300">
      <Sidebar upcomingTrip={upcomingTrip} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={trip.tripName || trip.destinationCity} />

        <div className="flex-1 overflow-y-auto">
          <TripHero trip={trip} onDelete={handleDelete} activityCount={activityCount} packingProgress={packingProgress} />
          <TripTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          <div className="p-8">
            <Outlet context={{ trip, setTrip, activityCount, packingProgress }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripLayout;
