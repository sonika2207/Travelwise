import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { motion } from 'framer-motion';

import Topbar from '../components/dashboard/Topbar';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { trips, refetch } = useOutletContext();
  
  const [formData, setFormData] = useState({
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
    tripType: 'Beach',
    description: '',
    budget: '',
    currency: 'INR',
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchTrip = async () => {
        try {
          const res = await axiosInstance.get(`/api/trips/${id}`);
          const data = res.data;
          setFormData({
            tripName: data.tripName || '',
            destination: data.destinationCity ? `${data.destinationCity}, ${data.destinationCountry}` : data.destinationCountry || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            tripType: data.tripType || 'Beach',
            description: data.description || '',
            budget: data.budget || '',
            currency: data.destinationCurrency || 'INR',
          });
          if (data.coverPhotoUrl) {
            setPreviewUrl(data.coverPhotoUrl);
          }
        } catch (error) {
          toast.error('Failed to load trip details for editing.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTrip();
    }
  }, [id, isEditMode]);

  // For Sidebar
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripTypeClick = (type) => {
    setFormData((prev) => ({ ...prev, tripType: type }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tripName || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }

    setLoading(true);

    try {
      // 1. Split destination into city and country roughly
      const parts = formData.destination.split(',');
      const destinationCity = parts[0]?.trim() || formData.destination;
      const destinationCountry = parts.length > 1 ? parts[1]?.trim() : formData.destination;

      const tripRequest = {
        tripName: formData.tripName,
        destinationCity,
        destinationCountry,
        destinationCurrency: formData.currency,
        tripType: formData.tripType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      let newTrip;
      if (isEditMode) {
        const tripRes = await axiosInstance.put(`/api/trips/${id}`, tripRequest);
        newTrip = tripRes.data;
      } else {
        const tripRes = await axiosInstance.post('/api/trips', tripRequest);
        newTrip = tripRes.data;
      }

      // 3. Upload photo if provided
      if (coverPhoto) {
        const formDataPayload = new FormData();
        formDataPayload.append('file', coverPhoto);
        await axiosInstance.post(`/api/trips/${newTrip.id}/upload-cover`, formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(isEditMode ? `✈️ "${formData.tripName}" updated successfully!` : `✈️ "${formData.tripName}" created successfully!`);
      if (refetch) {
        await refetch();
      }
      navigate(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error('Create trip error:', error);
      const data = error.response?.data;
      // Backend can return: { "error": "..." }, { "message": "..." },
      // or validation map: { "tripName": "required", ... }
      let msg = 'Failed to create trip';
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.error) {
          msg = data.error;
        } else if (data.message) {
          msg = data.message;
        } else {
          // Validation field errors — join them
          const fieldErrors = Object.values(data).join(', ');
          if (fieldErrors) msg = fieldErrors;
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { code: 'INR', label: 'INR — Indian Rupee' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
    { code: 'CAD', label: 'CAD — Canadian Dollar' },
    { code: 'SGD', label: 'SGD — Singapore Dollar' },
    { code: 'AED', label: 'AED — UAE Dirham' },
    { code: 'CHF', label: 'CHF — Swiss Franc' },
  ];

  const tripTypes = [
    { name: 'Beach', icon: '🏖️' },
    { name: 'Adventure', icon: '⛰️' },
    { name: 'Cultural', icon: '🏛️' },
    { name: 'Food', icon: '🍽️' },
    { name: 'Business', icon: '💼' },
    { name: 'Family', icon: '👨‍👩‍👧' },
    { name: 'Romantic', icon: '❤️' },
    { name: 'Other', icon: '🎭' },
  ];

  return (
    <>
      <Topbar title={isEditMode ? "Edit trip" : "Create new trip"} />

        <div className="p-8 flex-1 overflow-y-auto">
          {initialLoading ? (
            <div className="flex items-center justify-center h-full text-[var(--tw-text-muted)]">Loading trip details...</div>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[640px] mx-auto"
          >
            <div className="mb-[22px]">
              <div className="flex items-center gap-[10px] cursor-pointer" onClick={() => navigate(-1)}>
                <span className="text-[14px] text-[var(--tw-text-muted)]">&larr; Back</span>
              </div>
              <div className="font-serif text-[22px] font-bold text-[var(--tw-text-heading)] mt-2">
                {isEditMode ? "Edit trip" : "Create new trip"}
              </div>
              <div className="text-[13px] text-[var(--tw-text-muted)] mt-[2px]">
                Fill in your trip details
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[var(--tw-bg-card)] rounded-[var(--tw-r-lg)] shadow-[var(--tw-shadow-card)] border border-[var(--tw-border-light)] p-6">
              
              {/* Cover Upload */}
              <div className="relative h-[170px] border-2 border-dashed border-[var(--tw-border)] rounded-[var(--tw-r-xl)] overflow-hidden flex flex-col items-center justify-center gap-2 mb-[22px] cursor-pointer"
                   style={previewUrl ? {} : { background: 'linear-gradient(135deg, var(--tw-sky-light), var(--tw-teal-light))' }}
                   onClick={() => document.getElementById('cover-upload-input').click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="text-[30px] text-[var(--tw-sky)]">📸</div>
                    <div className="text-[14px] font-medium text-[var(--tw-sky)]">Add cover photo</div>
                    <div className="text-[12px] text-[var(--tw-text-muted)]">Drag and drop or click to upload</div>
                  </>
                )}
                <input
                  id="cover-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tw-text-muted)] mb-3 pb-2 border-b border-[var(--tw-border-light)]">
                Trip details
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-[6px] tracking-[0.01em]">
                Trip name *
              </label>
              <div className="relative flex items-center mb-[18px]">
                <span className="absolute left-[13px] text-[var(--tw-text-light)] text-[16px]">🏷️</span>
                <input
                  type="text"
                  name="tripName"
                  value={formData.tripName}
                  onChange={handleChange}
                  required
                  className="w-full py-[11px] pr-[14px] pl-[40px] bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                  placeholder="e.g. Bali Honeymoon 2026"
                />
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-[6px] tracking-[0.01em]">
                Destination *
              </label>
              <div className="relative flex items-center mb-[18px]">
                <span className="absolute left-[13px] text-[var(--tw-text-light)] text-[16px]">📍</span>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full py-[11px] pr-[14px] pl-[40px] bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                  placeholder="City, Country"
                />
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-2 tracking-[0.01em]">
                Date range *
              </label>
              <div className="grid grid-cols-2 gap-[14px] mb-[22px]">
                <div className="relative flex items-center bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] overflow-hidden">
                  <span className="absolute left-[14px] text-[var(--tw-sky)] text-[16px] pointer-events-none">📅</span>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full py-[11px] pr-[14px] pl-[40px] bg-transparent text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                  />
                </div>
                <div className="relative flex items-center bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] overflow-hidden">
                  <span className="absolute left-[14px] text-[var(--tw-sky)] text-[16px] pointer-events-none">📅</span>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full py-[11px] pr-[14px] pl-[40px] bg-transparent text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                  />
                </div>
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-[10px] tracking-[0.01em]">
                Trip type
              </label>
              <div className="grid grid-cols-4 gap-[10px] mb-6">
                {tripTypes.map((type) => (
                  <div
                    key={type.name}
                    onClick={() => handleTripTypeClick(type.name)}
                    className={`flex flex-col items-center gap-[6px] py-[14px] px-[10px] rounded-[var(--tw-r-lg)] border-[1.5px] text-[12px] font-medium cursor-pointer transition-all duration-200 ${
                      formData.tripType === type.name
                        ? 'border-[var(--tw-sky)] text-[var(--tw-sky)] bg-[var(--tw-sky-light)] font-semibold shadow-[0_0_0_3px_rgba(74,144,217,0.12)]'
                        : 'bg-[var(--tw-bg-subtle)] border-[var(--tw-border)] text-[var(--tw-text-muted)] hover:border-[var(--tw-text-light)]'
                    }`}
                  >
                    <span className="text-[22px]">{type.icon}</span>
                    {type.name}
                  </div>
                ))}
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-[6px] tracking-[0.01em]">
                Description (optional)
              </label>
              <div className="relative flex items-start mb-[18px]">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full py-[11px] px-[14px] h-[80px] resize-none bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                  placeholder="What's this trip about?"
                ></textarea>
              </div>

              <label className="block text-[13px] font-medium text-[var(--tw-text-muted)] mb-[6px] tracking-[0.01em]">
                Budget (optional)
              </label>
              <div className="flex gap-3 mb-2">
                <div className="relative flex items-center flex-1">
                  <span className="absolute left-[13px] text-[var(--tw-text-light)] text-[16px]">💰</span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full py-[11px] pr-[14px] pl-[40px] bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] text-[14px] text-[var(--tw-text-body)] focus:outline-none focus:border-[var(--tw-sky)] transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div className="relative flex items-center bg-[var(--tw-bg-input)] border-[1.5px] border-[var(--tw-border)] rounded-[var(--tw-r-md)] min-w-[100px] overflow-hidden">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full py-[11px] px-[14px] bg-transparent text-[14px] font-medium text-[var(--tw-text-body)] focus:outline-none appearance-none cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none text-[12px] text-[var(--tw-text-muted)]">
                    ▾
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-[var(--tw-r-md)] text-[14px] font-semibold transition-all duration-200 whitespace-nowrap bg-[var(--tw-bg-subtle)] text-[var(--tw-text-body)] border-[1.5px] border-[var(--tw-border)] hover:bg-[var(--tw-border-light)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-[var(--tw-r-md)] text-[14px] font-semibold transition-all duration-200 whitespace-nowrap bg-[var(--tw-sky)] text-white shadow-[0_2px_12px_rgba(74,144,217,0.28)] hover:bg-[var(--tw-sky-dark)] disabled:opacity-70"
                >
                  {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? '✈️ Save changes' : '✈️ Create trip')}
                </button>
              </div>
            </form>
          </motion.div>
          )}
      </div>
    </>
  );
};

export default CreateTrip;
