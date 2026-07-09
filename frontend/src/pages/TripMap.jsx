import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { dayApi } from '../api/dayApi';
import { activityApi } from '../api/activityApi';
import DaySelector from '../components/itinerary/DaySelector';

const getCategoryColor = (category) => {
  const c = (category || '').toLowerCase();
  if (c.includes('travel') || c.includes('transport') || c.includes('flight')) return { hex: 'var(--color-sky)', badgeClass: 'badge-sky' };
  if (c.includes('food') || c.includes('restaurant') || c.includes('dining')) return { hex: 'var(--color-peach)', badgeClass: 'badge-peach' };
  if (c.includes('hotel') || c.includes('accommodation') || c.includes('lodging')) return { hex: 'var(--color-sand)', badgeClass: 'badge-sand' };
  if (c.includes('sightseeing') || c.includes('attraction')) return { hex: 'var(--color-teal)', badgeClass: 'badge-teal' };
  if (c.includes('activity') || c.includes('tour')) return { hex: 'var(--color-sage)', badgeClass: 'badge-sage' };
  if (c.includes('shopping')) return { hex: 'var(--color-lavender)', badgeClass: 'badge-lavender' };
  return { hex: 'var(--color-text-muted)', badgeClass: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]' };
};

const createCustomIcon = (colorHex, index) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="map-marker" style="background:${colorHex}; position:relative; top:0; left:0; transform: rotate(-45deg) translate(-50%, -50%); margin-left: 17px; margin-top: 17px;">
        <div class="map-marker-inner text-white font-bold">${index + 1}</div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

// Component to recenter map when markers change
const MapUpdater = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);
  return null;
};

const CustomZoomControl = () => {
  const map = useMap();
  return (
    <div className="map-controls cursor-pointer" style={{ zIndex: 400 }}>
      <div className="map-control-btn hover:bg-[var(--color-bg-input)] transition-colors" onClick={() => map.zoomIn()}>&#43;</div>
      <div className="map-control-btn hover:bg-[var(--color-bg-input)] transition-colors" onClick={() => map.zoomOut()}>&minus;</div>
    </div>
  );
};

const TripMap = () => {
  const { trip } = useOutletContext();
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Days
  useEffect(() => {
    const loadDays = async () => {
      try {
        const data = await dayApi.getDaysForTrip(trip.id);
        setDays(data);
        if (data.length > 0) {
          setSelectedDayId(data[0].id);
        }
      } catch (error) {
        toast.error('Failed to load map days.');
      } finally {
        setLoading(false);
      }
    };
    if (trip?.id) loadDays();
  }, [trip]);

  // Load Activities for selected day
  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedDayId) return;
      try {
        const data = await activityApi.getActivitiesByDay(selectedDayId);
        // Sort by start time
        const sorted = data.sort((a, b) => {
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.localeCompare(b.startTime);
        });
        setActivities(sorted);
      } catch (error) {
        toast.error('Failed to load activities for map.');
      }
    };
    loadActivities();
  }, [selectedDayId]);

  // Filter activities that have coordinates
  const markers = activities.filter((a) => a.latitude != null && a.longitude != null);
  
  const defaultPosition = [20, 0];
  const centre = markers.length ? [markers[0].latitude, markers[0].longitude] : defaultPosition;
  
  const selectedDay = days.find(d => d.id === selectedDayId);
  const selectedDayIndex = days.findIndex(d => d.id === selectedDayId) + 1;

  if (loading) {
    return <div className="text-[var(--tw-text-muted)] text-center p-8">Loading map data...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-2"
    >
      {days.length > 0 ? (
        <div className="mb-[16px]">
          <DaySelector 
            days={days} 
            selectedDayId={selectedDayId} 
            onSelectDay={setSelectedDayId} 
          />
        </div>
      ) : (
        <div className="text-[var(--tw-text-muted)] mb-4">No itinerary days found for this trip.</div>
      )}

      <div className="map-wrapper mb-0 rounded-b-none border-b-0">
        <MapContainer
          center={centre}
          zoom={5}
          style={{ height: '100%', width: '100%', background: 'transparent' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater markers={markers} />
          <CustomZoomControl />
          
          {markers.map((m, index) => {
            const { hex } = getCategoryColor(m.category);
            return (
              <Marker
                key={m.id}
                position={[m.latitude, m.longitude]}
                icon={createCustomIcon(hex, index)}
              >
                <Popup>
                  <strong>{m.title || 'Untitled'}</strong><br />
                  {m.location && <span>{m.location}<br /></span>}
                  {m.notes && <em className="text-sm text-gray-500">{m.notes}</em>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {selectedDay && (
        <div className="map-activity-drawer">
          <div className="p-[12px_18px] font-semibold text-text-heading border-b border-border-light">
            Activities on Day {selectedDayIndex} ({activities.length})
          </div>
          
          {activities.length === 0 && (
            <div className="p-[16px_18px] text-sm text-text-muted">
              No activities planned for this day yet.
            </div>
          )}

          {activities.map((act, index) => {
            const { hex, badgeClass } = getCategoryColor(act.category);
            // Recompute index specifically for markers to keep numbers synced with map pins if we wanted, 
            // but for color dot it's just visual.
            return (
              <div key={act.id} className="map-activity-item">
                <div className="map-activity-marker-dot" style={{ background: hex }}></div>
                <div className="map-activity-time">{act.startTime?.substring(0,5) || 'Time TBA'}</div>
                <div className="map-activity-name flex-1">{act.title}</div>
                {act.category && (
                  <div className="ml-auto">
                    <span className={`badge ${badgeClass}`}>
                      {act.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default TripMap;
