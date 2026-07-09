// mapApi.js – fetch map data (locations) for a trip
// This utility aggregates days and activities to provide coordinates for the map view.

import { dayApi } from './dayApi';
import { activityApi } from './activityApi';

/**
 * Fetch all activities for a given trip and return an array of marker objects.
 * Each marker contains latitude, longitude, title, location, and day information.
 *
 * @param {number|string} tripId - The ID of the trip.
 * @returns {Promise<Array>} - Resolves to an array of marker objects.
 */
export const getTripMapData = async (tripId) => {
  // Get all days for the trip first
  const days = await dayApi.getDaysForTrip(tripId);
  // For each day, fetch its activities (which contain lat/lng if provided)
  const activitiesPromises = days.map((day) =>
    activityApi.getActivitiesByDay(day.id).then((acts) =>
      acts.map((act) => ({
        dayId: day.id,
        dayTitle: day.title,
        id: act.id,
        title: act.title,
        location: act.location,
        latitude: act.latitude,
        longitude: act.longitude,
        notes: act.notes,
      }))
    )
  );

  const activitiesNested = await Promise.all(activitiesPromises);
  // Flatten the nested array into a single list of activities
  const allActivities = activitiesNested.flat();

  // Filter out entries without valid coordinates
  const markers = allActivities.filter(
    (a) => a.latitude != null && a.longitude != null
  );
  return markers;
};
