import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, MessageSquare, Edit2 } from 'lucide-react';
import { formatDate, formatDistanceToNow, getPriorityColor, getInitials } from '../utils/helpers';

export const TaskDetailModal = ({ task, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">{task.description || 'No description'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PRIORITY</p>
              <span className={`inline-block text-xs px-3 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">DUE DATE</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ASSIGNED TO</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(task.assignee.name)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{task.assignee.name}</span>
                </div>
              </div>
            )}

            {/* Labels */}
            {task.labels?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">LABELS</p>
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          {task.comments?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({task.comments.length})
              </h3>
              <div className="space-y-3">
                {task.comments.map((comment, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {comment.user?.name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(comment.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
