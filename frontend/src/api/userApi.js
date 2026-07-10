import axiosInstance from './axios';

export const userApi = {
  /** GET /api/user/profile */
  getProfile: () => axiosInstance.get('/api/user/profile').then(r => r.data),

  /** PUT /api/user/profile */
  updateProfile: (data) => axiosInstance.put('/api/user/profile', data).then(r => r.data),

  /** PUT /api/user/password */
  changePassword: (data) => axiosInstance.put('/api/user/password', data),

  /** DELETE /api/user/account */
  deleteAccount: () => axiosInstance.delete('/api/user/account'),

  /** POST /api/user/support */
  sendSupportMessage: (message) => axiosInstance.post('/api/user/support', { message }),

  /** POST /api/user/profile-photo */
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/api/user/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
};
