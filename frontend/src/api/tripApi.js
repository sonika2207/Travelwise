import axiosInstance from './axios';

export const tripApi = {
  getAllTrips: async () => {
    const response = await axiosInstance.get('/api/trips');
    return response.data;
  },

  getTripById: async (id) => {
    const response = await axiosInstance.get(`/api/trips/${id}`);
    return response.data;
  },

  createTrip: async (tripData) => {
    const response = await axiosInstance.post('/api/trips', tripData);
    return response.data;
  },

  updateTrip: async (id, tripData) => {
    const response = await axiosInstance.put(`/api/trips/${id}`, tripData);
    return response.data;
  },

  deleteTrip: async (id) => {
    await axiosInstance.delete(`/api/trips/${id}`);
  },

  fetchCoverPhoto: async (id) => {
    const response = await axiosInstance.post(`/api/trips/${id}/cover-photo`);
    return response.data;
  },
};
