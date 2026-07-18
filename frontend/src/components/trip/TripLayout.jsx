import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tripApi } from '../../api/tripApi';
import { dayApi } from '../../api/dayApi';
import { activityApi } from '../../api/activityApi';
import { packingApi } from '../../api/packingApi';
import Topbar from '../dashboard/Topbar';
import TripHero from './TripHero';
import TripTabs from './TripTabs';

const TripLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch } = useOutletContext();
  
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
  const fetchStats = useCallback(async () => {
    if (!id) return;
    try {
      const days = await dayApi.getDaysForTrip(id);
      const activityCounts = await Promise.all(
        days.map(day => activityApi.getActivitiesByDay(day.id).then(a => a.length).catch(() => 0))
      );
      setActivityCount(activityCounts.reduce((sum, c) => sum + c, 0));
    } catch (_) {}
    
    try {
      const progress = await packingApi.getProgress(id);
      setPackingProgress({ packed: progress.checkedItems ?? 0, total: progress.totalItems ?? 0 });
    } catch (_) {}
  }, [id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async () => {
    try {
      await tripApi.deleteTrip(id);
      toast.success('Trip deleted successfully');
      if (refetch) {
        await refetch();
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete trip');
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
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[var(--tw-text-muted)] text-lg">Loading trip details...</div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <>
      <Topbar title={trip.tripName || trip.destinationCity} />

      <div className="flex-1 overflow-y-auto">
        <TripHero trip={trip} onDelete={handleDelete} activityCount={activityCount} packingProgress={packingProgress} />
        <TripTabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="p-8">
          <Outlet context={{ trip, setTrip, activityCount, packingProgress, refreshStats: fetchStats }} />
        </div>
      </div>
    </>
  );
};

export default TripLayout;
