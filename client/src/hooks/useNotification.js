import { useEffect } from 'react';
import { useNotificationStore } from '../context/store';

export const useNotification = () => {
  const { notifications, addNotification, removeNotification } = useNotificationStore();

  const notify = (message, type = 'success', duration = 3000) => {
    const id = addNotification({ message, type });

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const success = (message) => notify(message, 'success');
  const error = (message) => notify(message, 'error', 5000);
  const info = (message) => notify(message, 'info');
  const warning = (message) => notify(message, 'warning');

  return {
    notifications,
    notify,
    success,
    error,
    info,
    warning,
    removeNotification,
  };
};
