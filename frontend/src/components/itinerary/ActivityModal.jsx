import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityModal = ({ isOpen, onClose, onSave, editingActivity }) => {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'Sightseeing',
    notes: ''
  });

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        title: editingActivity.title || '',
        startTime: editingActivity.startTime?.substring(0, 5) || '',
        endTime: editingActivity.endTime?.substring(0, 5) || '',
        location: editingActivity.location || '',
        category: editingActivity.category || 'Sightseeing',
        notes: editingActivity.notes || ''
      });
    } else {
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        location: '',
        category: 'Sightseeing',
        notes: ''
      });
    }
  }, [editingActivity, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add seconds for backend LocalTime requirement
    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--tw-bg-card)] rounded-[var(--tw-r-xl)] shadow-lg w-full max-w-lg overflow-hidden border border-[var(--tw-border-light)]"
        >
          <div className="flex items-center justify-between p-5 border-b border-[var(--tw-border-light)]">
            <h3 className="font-serif text-xl font-bold text-[var(--tw-text-heading)]">
              {editingActivity ? 'Edit Activity' : 'Add Activity'}
            </h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--tw-bg-subtle)] text-[var(--tw-text-muted)] text-xl leading-none">&times;</button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="input-label">Title</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="input px-4" 
                placeholder="e.g. Visit Eiffel Tower" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="input-label">Start Time</label>
                <input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange} 
                  className="input px-4" 
                  required 
                />
              </div>
              <div>
                <label className="input-label">End Time</label>
                <input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange} 
                  className="input px-4" 
                  required 
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="input-label">Location</label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                className="input px-4" 
                placeholder="Address or place name" 
                required 
              />
            </div>

            <div className="mb-4">
              <label className="input-label">Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="input px-4 appearance-none" 
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food / Restaurant</option>
                <option value="Travel">Travel / Transit</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="input-label">Notes (Optional)</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                className="input px-4 py-3 min-h-[80px] resize-y" 
                placeholder="Booking info, tips, etc." 
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn btn-secondary px-6">Cancel</button>
              <button type="submit" className="btn btn-primary px-6">Save</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityModal;
