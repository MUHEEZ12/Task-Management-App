import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useTaskStore, useBoardStore } from '../context/store';

export const AnalyticsDashboard = () => {
  const { tasks } = useTaskStore();
  const { boards } = useBoardStore();
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    tasksByPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    tasksByStatus: { todo: 0, inProgress: 0, done: 0 },
    weeklyProgress: [],
    averageCompletionTime: 0,
  });

  useEffect(() => {
    calculateAnalytics();
  }, [tasks]);

  const calculateAnalytics = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task =>
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
    ).length;

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority || 'medium'] = (acc[task.priority || 'medium'] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0, critical: 0 });

    const tasksByStatus = tasks.reduce((acc, task) => {
      const status = task.status === 'done' ? 'done' :
                    task.status === 'in_progress' ? 'inProgress' : 'todo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { todo: 0, inProgress: 0, done: 0 });

    // Calculate weekly progress (mock data for demo)
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: Math.floor(Math.random() * 5) + 1,
      };
    }).reverse();

    setAnalytics({
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      weeklyProgress,
      averageCompletionTime: Math.floor(Math.random() * 24) + 8, // Mock data
    });
  };

  const completionRate = analytics.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold">{analytics.totalTasks}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{analytics.completedTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold">{analytics.overdueTasks}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'critical' ? 'bg-red-500' :
                    priority === 'high' ? 'bg-orange-500' :
                    priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                    {priority}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'done' ? 'bg-green-500' :
                    status === 'inProgress' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Weekly Progress</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {analytics.weeklyProgress.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.completed / 8) * 100}%` }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 min-h-[4px]"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{day.date}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.completed}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Productivity Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-indigo-100 text-sm">Avg. Completion Time</p>
            <p className="text-2xl font-bold">{analytics.averageCompletionTime}h</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Most Productive Day</p>
            <p className="text-2xl font-bold">Tuesday</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Streak</p>
            <p className="text-2xl font-bold">5 days</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};