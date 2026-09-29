import api from './client';

export const plannerApi = {
  createPlan: (payload) => api.post('/planner/plans', payload),
  listPlans: () => api.get('/planner/plans'),
  deletePlan: (id) => api.delete(`/planner/plans/${id}`),

  createTask: (payload) => api.post('/planner/tasks', payload),
  listTasks: (params) => api.get('/planner/tasks', { params }),
  updateTask: (id, payload) => api.put(`/planner/tasks/${id}`, payload),
  deleteTask: (id) => api.delete(`/planner/tasks/${id}`),

  createRevisionItem: (payload) => api.post('/planner/revision', payload),
  listRevisionItems: (params) => api.get('/planner/revision', { params }),
  reviewRevisionItem: (id, quality) => api.post(`/planner/revision/${id}/review`, { quality }),
  deleteRevisionItem: (id) => api.delete(`/planner/revision/${id}`),
};
