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

      // Auto-fetch cover photos for trips missing one (fire-and-forget, then reload)
      const missingPhotos = data.filter(t => !t.coverPhotoUrl);
      if (missingPhotos.length > 0) {
        await Promise.allSettled(missingPhotos.map(t => tripApi.fetchCoverPhoto(t.id)));
        // Reload trips so cards show the newly fetched photos
        const updated = await tripApi.getAllTrips();
        setTrips(updated);
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
