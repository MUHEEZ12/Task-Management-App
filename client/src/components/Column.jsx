import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { TaskSkeleton } from './LoadingSkeleton';
import { TaskTemplates } from './TaskTemplates';
import { taskService } from '../services';
import { useNotification } from '../hooks/useNotification';

export const Column = ({ column, boardId, onTaskUpdate, onTaskDelete, onTaskMove, tasks = [], loading }) => {
  const [showNewTask, setShowNewTask] = useState(false);
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { success, error } = useNotification();
  const inputRef = useRef(null);

  useEffect(() => {
    if (showNewTask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNewTask]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsCreating(true);
      const taskData = {
        title,
        columnId: column._id,
        boardId,
      };

      // Add template data if available
      if (selectedTemplate) {
        taskData.description = selectedTemplate.defaultDescription;
        taskData.priority = selectedTemplate.priority;
        taskData.labels = selectedTemplate.labels;
      }

      const res = await taskService.createTask(taskData);
      success('Task created');
      onTaskUpdate(res.data.task._id, res.data.task);
      setTitle('');
      setShowNewTask(false);
      setSelectedTemplate(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setShowNewTask(true);
    setShowTemplates(false);
  };

  const columnTasks = tasks.filter((t) => t.column === column._id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 w-80 lg:w-96 flex-shrink-0 max-h-[calc(100vh-180px)] overflow-y-auto"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{columnTasks.length} tasks</p>
        </div>
        <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-400">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      {loading ? (
        <TaskSkeleton count={3} />
      ) : (
        <Droppable droppableId={column._id} type="task">
          {(provided, snapshot) => (
            <motion.div
              ref={provided.innerRef}
              {...provided.droppableProps}
              layout
              className={`space-y-3 mb-3 min-h-[50px] rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <AnimatePresence>
                {columnTasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TaskCard
                      task={task}
                      index={index}
                      onUpdate={(id, updated) => onTaskUpdate(id, updated)}
                      onDelete={onTaskDelete}
                      onClick={() => {}}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </motion.div>
          )}
        </Droppable>
      )}

      {/* New Task Form */}
      {showNewTask ? (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleCreateTask}
          className="mb-3"
        >
          <textarea
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Add Card'}
            </button>
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg font-medium text-sm transition"
              title="Use template"
            >
              📋
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewTask(false);
                setTitle('');
                setSelectedTemplate(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium text-sm transition"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewTask(true)}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add a card
        </motion.button>
      )}

      {showTemplates && (
        <TaskTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </motion.div>
  );
};
