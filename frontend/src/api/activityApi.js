import axiosInstance from './axios';

export const activityApi = {
  getActivitiesByDay: async (dayId) => {
    const response = await axiosInstance.get(`/api/days/${dayId}/activities`);
    return response.data;
  },
  
  createActivity: async (dayId, activityData) => {
    const response = await axiosInstance.post(`/api/days/${dayId}/activities`, activityData);
    return response.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await axiosInstance.put(`/api/activities/${id}`, activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    await axiosInstance.delete(`/api/activities/${id}`);
  }
};
