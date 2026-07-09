import axiosInstance from './axios';

export const dayApi = {
  getDaysForTrip: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/days`);
    return response.data;
  }
};
