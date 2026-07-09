import axiosInstance from './axios';

export const packingApi = {
  generate: async (tripId) => {
    const response = await axiosInstance.post(`/api/trips/${tripId}/packing/generate`);
    return response.data;
  },

  getItems: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/packing`);
    return response.data;
  },

  toggle: async (itemId) => {
    const response = await axiosInstance.put(`/api/packing/${itemId}/toggle`);
    return response.data;
  },

  addCustom: async (tripId, request) => {
    const response = await axiosInstance.post(`/api/trips/${tripId}/packing/custom`, request);
    return response.data;
  },

  delete: async (itemId) => {
    await axiosInstance.delete(`/api/packing/${itemId}`);
  },

  getProgress: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/packing/progress`);
    return response.data;
  }
};
