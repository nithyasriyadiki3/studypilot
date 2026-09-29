import api from './client';

export const userApi = {
  updateAccount: (payload) => api.put('/users/account', payload),
  updateTheme: (theme) => api.put('/users/theme', { theme }),
  changePassword: (payload) => api.put('/users/password', payload),
  deleteAccount: () => api.delete('/users/account'),
  getLearningProfile: () => api.get('/users/learning-profile'),
  updateLearningProfile: (payload) => api.put('/users/learning-profile', payload),
};
