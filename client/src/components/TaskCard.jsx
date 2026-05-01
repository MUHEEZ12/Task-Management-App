import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Flag, Calendar, Users, MessageSquare, Plus } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { formatDate, formatDistanceToNow, getPriorityColor, getInitials } from '../utils/helpers';
import { taskService } from '../services';
import { useNotification } from '../hooks/useNotification';
import { ConfirmationModal } from './ConfirmationModal';

export const TaskCard = ({ task, index, onUpdate, onDelete, onClick, onAssign }) => {
  const { error, success } = useNotification();
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await taskService.deleteTask(task._id);
      success('Task deleted');
      onDelete(task._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleComplete = async (e) => {
    e.stopPropagation();
    try {
      await taskService.updateTask(task._id, { isCompleted: !task.isCompleted });
      success(`Task marked as ${!task.isCompleted ? 'completed' : 'incomplete'}`);
      onUpdate(task._id, { isCompleted: !task.isCompleted });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className={`bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 dark:border-slate-600 ${
              snapshot.isDragging ? 'shadow-lg rotate-3' : ''
            }`}
          >
            {/* Title and Checkbox */}
            <div className="flex items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={handleComplete}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium line-clamp-2 ${
                    task.isCompleted
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {task.title}
                </p>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>
            )}

            {/* Priority and Status */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              {task.labels?.map((label) => (
                <span key={label} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              ))}
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(task.assignee.name)}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee.name}</span>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-600"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </Draggable>

    <ConfirmationModal
      isOpen={showDeleteConfirm}
      title="Delete Task"
      message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      confirmText="Delete"
      onConfirm={confirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
      type="danger"
    />
    </>
  );
};
