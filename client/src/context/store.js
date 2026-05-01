import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token'),
  loading: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setLoading: (loading) => set({ loading }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

export const useBoardStore = create((set) => ({
  boards: [],
  currentBoard: null,
  loading: false,

  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setLoading: (loading) => set({ loading }),

  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] })),
  updateBoard: (id, updated) =>
    set((state) => ({
      boards: state.boards.map((b) => (b._id === id ? { ...b, ...updated } : b)),
      currentBoard:
        state.currentBoard?._id === id ? { ...state.currentBoard, ...updated } : state.currentBoard,
    })),
  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b._id !== id),
      currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
    })),
}));

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  searchQuery: '',
  filterPriority: '',
  filterAssignee: '',

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),

  getFilteredTasks: () => {
    const state = get();
    return state.tasks.filter(task => {
      const matchesSearch = !state.searchQuery ||
        task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesPriority = !state.filterPriority || task.priority === state.filterPriority;
      const matchesAssignee = !state.filterAssignee || task.assignedTo?.includes(state.filterAssignee);
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  },

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updated) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updated } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
    })),
  moveTask: (taskId, fromColId, toColId, boardId) =>
    set((state) => {
      // Update tasks in current board's columns
      return { tasks: state.tasks };
    }),
}));

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => {
      const id = Date.now();
      return {
        notifications: [...state.notifications, { ...notification, id }],
      };
    }),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

const defaultSettings = {
  profile: { bio: '' },
  notifications: {
    email: true,
    taskUpdates: true,
    boardInvites: true,
  },
  privacy: {
    profileVisibility: true,
    activityStatus: false,
  },
};

const loadSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('taskflowSettings')) || {};
    return {
      profile: { ...defaultSettings.profile, ...(stored.profile || {}) },
      notifications: { ...defaultSettings.notifications, ...(stored.notifications || {}) },
      privacy: { ...defaultSettings.privacy, ...(stored.privacy || {}) },
    };
  } catch (err) {
    return defaultSettings;
  }
};

const saveSettings = (settings) => {
  localStorage.setItem('taskflowSettings', JSON.stringify(settings));
};

export const useSettingsStore = create((set) => ({
  settings: loadSettings(),

  setProfileSettings: (profile) =>
    set((state) => {
      const newSettings = { ...state.settings, profile };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setNotificationSettings: (notifications) =>
    set((state) => {
      const newSettings = { ...state.settings, notifications };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setPrivacySettings: (privacy) =>
    set((state) => {
      const newSettings = { ...state.settings, privacy };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),
}));

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    }),
}));
