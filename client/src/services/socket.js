import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://task-management-app-kljf.onrender.com';

let socket = null;

export const initSocket = () => {
  socket = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem('token'),
    },
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketEvents = {
  // Emit
  joinBoard: (boardId) => socket?.emit('join-board', boardId),
  taskCreated: (data) => socket?.emit('task-created', data),
  taskUpdated: (data) => socket?.emit('task-updated', data),
  taskMoved: (data) => socket?.emit('task-moved', data),
  taskDeleted: (data) => socket?.emit('task-deleted', data),
  sendNotification: (data) => socket?.emit('notification', data),

  // Listen
  onTaskCreated: (callback) => socket?.on('task-created', callback),
  onTaskUpdated: (callback) => socket?.on('task-updated', callback),
  onTaskMoved: (callback) => socket?.on('task-moved', callback),
  onTaskDeleted: (callback) => socket?.on('task-deleted', callback),
  onNotification: (callback) => socket?.on('notification', callback),
};
