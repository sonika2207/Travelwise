import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripCard from './TripCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const TripGrid = ({ trips }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
    >
      {trips.map((trip, i) => (
        <motion.div key={trip.id} variants={item}>
        <TripCard
          key={trip.id}
          trip={trip}
          index={i}
          onNavigate={() => navigate(`/trips/${trip.id}`)}
        />
        </motion.div>
      ))}

      {/* Create new trip card */}
      <motion.div
        variants={item}
        onClick={() => navigate('/trips/new')}
        className="flex flex-col items-center justify-center gap-3 rounded-[20px] cursor-pointer transition-colors duration-200 min-h-[270px] text-[var(--tw-text-muted)] border-2 border-dashed border-[var(--tw-border)] hover:bg-[var(--tw-bg-subtle)]"
      >
        <div className="w-14 h-14 rounded-full bg-[var(--tw-bg-subtle)] flex items-center justify-center text-2xl border border-[var(--tw-border)]">+</div>
        <div className="text-[15px] font-semibold text-[var(--tw-text-heading)]">Create new trip</div>
        <div className="text-xs opacity-70">Start planning your next adventure</div>
      </motion.div>
    </motion.div>
  );
};

export default TripGrid;
