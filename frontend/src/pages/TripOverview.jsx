import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripSummary from '../components/trip/TripSummary';
import TripSideCards from '../components/trip/TripSideCards';

const TripOverview = () => {
  const { trip } = useOutletContext();

  if (!trip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overview-grid"
    >
      <TripSummary trip={trip} />
      <TripSideCards trip={trip} />
    </motion.div>
  );
};

export default TripOverview;
