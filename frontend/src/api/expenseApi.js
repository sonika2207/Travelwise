import axiosInstance from './axios';

export const expenseApi = {
  addExpense: async (tripId, request) => {
    const response = await axiosInstance.post(`/api/trips/${tripId}/expenses`, request);
    return response.data;
  },

  getTripExpenses: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/expenses`);
    return response.data;
  },

  getExpense: async (expenseId) => {
    const response = await axiosInstance.get(`/api/expenses/${expenseId}`);
    return response.data;
  },

  updateExpense: async (expenseId, request) => {
    const response = await axiosInstance.put(`/api/expenses/${expenseId}`, request);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    await axiosInstance.delete(`/api/expenses/${expenseId}`);
  },

  getExpenseSummary: async (tripId) => {
    const response = await axiosInstance.get(`/api/trips/${tripId}/expenses/summary`);
    return response.data;
  }
};
