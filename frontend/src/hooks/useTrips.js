import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { tripApi } from '../api/tripApi';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripApi.getAllTrips();
      setTrips(data);

      // Auto-fetch cover photos for trips missing one (background, no loading flash)
      const missingPhotos = data.filter(t => !t.coverPhotoUrl);
      if (missingPhotos.length > 0) {
        // Finish showing content first, then silently refresh photos in background
        setLoading(false);
        const results = await Promise.allSettled(
          missingPhotos.map(t => tripApi.fetchCoverPhoto(t.id))
        );
        // Only re-fetch if at least one photo was actually saved
        const anySucceeded = results.some(
          r => r.status === 'fulfilled' && r.value?.coverPhotoUrl
        );
        if (anySucceeded) {
          const updated = await tripApi.getAllTrips();
          setTrips(updated);
        }
        return; // loading already set to false above
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load trips. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, error, refetch: fetchTrips };
};
