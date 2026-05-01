import API from './api';

export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
};

export const boardService = {
  getBoards: () => API.get('/boards'),
  getBoard: (id) => API.get(`/boards/${id}`),
  createBoard: (data) => API.post('/boards', data),
  updateBoard: (id, data) => API.put(`/boards/${id}`, data),
  deleteBoard: (id) => API.delete(`/boards/${id}`),
  addMember: (id, data) => API.post(`/boards/${id}/members`, data),
};

export const taskService = {
  createTask: (data) => API.post('/tasks', data),
  getTask: (id) => API.get(`/tasks/${id}`),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
  moveTask: (id, data) => API.put(`/tasks/${id}/move`, data),
  addComment: (id, data) => API.post(`/tasks/${id}/comments`, data),
};

export const activityService = {
  getBoardActivity: (boardId) => API.get(`/activity/board/${boardId}`),
};
