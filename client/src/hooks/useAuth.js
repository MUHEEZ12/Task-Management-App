import { useEffect } from 'react';
import { useAuthStore, useNotificationStore } from '../context/store';
import { authService } from '../services';

export const useAuth = () => {
  const { user, token, setUser, setToken, loading, setLoading } = useAuthStore();

  const checkAuth = async () => {
    if (token && !user) {
      try {
        setLoading(true);
        const res = await authService.getMe();
        setUser(res.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setToken(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    setUser,
    setToken,
  };
};
