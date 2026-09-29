import api from './client';

export const learningApi = {
  getSubjects: () => api.get('/learning/subjects'),
  getTopics: (subjectId) => api.get('/learning/topics', { params: subjectId ? { subjectId } : {} }),
  upsertProgress: (payload) => api.post('/learning/progress', payload),
  getWeakStrong: () => api.get('/learning/progress/weak-strong'),
  generateRoadmap: () => api.post('/learning/roadmap/generate'),
  getActiveRoadmap: () => api.get('/learning/roadmap/active'),
  runSession: (payload) => api.post('/learning/session', payload),
  getSessionHistory: (params) => api.get('/learning/session/history', { params }),
};
