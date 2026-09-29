import api from './client';

export const quizApi = {
  generate: (payload) => api.post('/quizzes/generate', payload),
  list: () => api.get('/quizzes'),
  get: (id) => api.get(`/quizzes/${id}`),
  submitAttempt: (id, payload) => api.post(`/quizzes/${id}/attempt`, payload),
};
