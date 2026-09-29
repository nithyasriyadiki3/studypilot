import api from './client';

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getActivityTrend: (days) => api.get('/analytics/activity-trend', { params: { days } }),
  getSubjectBreakdown: () => api.get('/analytics/subject-breakdown'),
  getQuizPerformance: () => api.get('/analytics/quiz-performance'),
  getModeDistribution: () => api.get('/analytics/mode-distribution'),
};
