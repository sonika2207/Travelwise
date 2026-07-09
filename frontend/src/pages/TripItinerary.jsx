import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { dayApi } from '../api/dayApi';
import { activityApi } from '../api/activityApi';
import DaySelector from '../components/itinerary/DaySelector';
import ActivityTimeline from '../components/itinerary/ActivityTimeline';
import ActivityModal from '../components/itinerary/ActivityModal';

const TripItinerary = () => {
  const { trip } = useOutletContext();
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [activities, setActivities] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const loadDays = async () => {
      try {
        setLoadingDays(true);
        const data = await dayApi.getDaysForTrip(trip.id);
        setDays(data);
        if (data.length > 0) {
          setSelectedDayId(data[0].id);
        }
      } catch (error) {
        toast.error('Failed to load itinerary days.');
      } finally {
        setLoadingDays(false);
      }
    };
    if (trip?.id) {
      loadDays();
    }
  }, [trip]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedDayId) return;
      try {
        setLoadingActivities(true);
        const data = await activityApi.getActivitiesByDay(selectedDayId);
        // Ensure sorted by start time
        const sorted = data.sort((a, b) => {
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.localeCompare(b.startTime);
        });
        setActivities(sorted);
      } catch (error) {
        toast.error('Failed to load activities.');
      } finally {
        setLoadingActivities(false);
      }
    };
    loadActivities();
  }, [selectedDayId]);

  const handleAdd = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Delete this activity?')) {
      try {
        await activityApi.deleteActivity(activityId);
        toast.success('Activity deleted');
        setActivities(prev => prev.filter(a => a.id !== activityId));
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

  const handleSaveActivity = async (payload) => {
    try {
      let saved;
      if (editingActivity) {
        saved = await activityApi.updateActivity(editingActivity.id, payload);
        toast.success('Activity updated');
        setActivities(prev => prev.map(a => a.id === saved.id ? saved : a));
      } else {
        saved = await activityApi.createActivity(selectedDayId, payload);
        toast.success('Activity created');
        setActivities(prev => [...prev, saved]);
      }
      // Re-sort just in case time changed
      setActivities(prev => [...prev].sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      }));
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save activity');
    }
  };

  if (loadingDays) {
    return <div className="p-8 text-[var(--tw-text-muted)] text-center">Loading itinerary...</div>;
  }

  if (days.length === 0) {
    return <div className="p-8 text-[var(--tw-text-muted)] text-center">No days found for this trip.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DaySelector 
        days={days} 
        selectedDayId={selectedDayId} 
        onSelectDay={setSelectedDayId} 
      />

      {loadingActivities ? (
        <div className="text-[var(--tw-text-muted)] p-4 text-center">Loading activities...</div>
      ) : (
        <ActivityTimeline 
          activities={activities}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        editingActivity={editingActivity}
      />
    </motion.div>
  );
};

export default TripItinerary;
