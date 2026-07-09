import axiosInstance from './axios';

export const weatherApi = {
  getWeather: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/weather`);
    return response.data;
  },
  refreshWeather: async (tripId) => {
    const response = await axiosInstance.post(`/api/trips/${tripId}/weather/refresh`);
    return response.data;
  }
};
