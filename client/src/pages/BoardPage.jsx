import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Settings, Plus, Activity, Filter } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { boardService } from '../services';
import { useBoardStore, useTaskStore } from '../context/store';
import { useNotification } from '../hooks/useNotification';
import { initSocket, socketEvents, getSocket } from '../services/socket';
import { Column } from '../components/Column';
import { ActivityLog } from '../components/ActivityLog';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const BoardPage = () => {
  const { id: boardId } = useParams();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard, loading, setLoading } = useBoardStore();
  const { tasks, setTasks, getFilteredTasks } = useTaskStore();
  const { error, success } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    loadBoard();
    initSocket();
    const socket = getSocket();
    if (socket) {
      socketEvents.joinBoard(boardId);
    }
  }, [boardId]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      key: 'b',
      ctrl: true,
      action: () => {
        // Go back to boards
        navigate('/boards');
      }
    },
    {
      key: 'a',
      ctrl: true,
      action: () => {
        // Toggle activity panel
        setShowActivityPanel(!showActivityPanel);
      }
    },
    {
      key: 'f',
      ctrl: true,
      action: () => {
        // Open advanced search
        event.preventDefault();
        setShowAdvancedSearch(true);
      }
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals/panels
        setShowActivityPanel(false);
        setSidebarOpen(false);
        setShowAdvancedSearch(false);
      }
    }
  ]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const res = await boardService.getBoard(boardId);
      setCurrentBoard(res.data.board);

      // Flatten all tasks from columns
      const allTasks = [];
      res.data.board.columns?.forEach((column) => {
        allTasks.push(...(column.tasks || []));
      });
      setTasks(allTasks);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load board');
      navigate('/boards');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (taskId, updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updatedTask } : t)));

    const socket = getSocket();
    if (socket) {
      socketEvents.taskUpdated({ ...updatedTask, boardId, taskId });
    }
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));

    const socket = getSocket();
    if (socket) {
      socketEvents.taskDeleted({ boardId, taskId });
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If no destination or dropped in same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Find the task being moved
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // If moving within the same column
    if (destination.droppableId === source.droppableId) {
      // Update task position within column
      const columnTasks = tasks.filter(t => t.column === destination.droppableId);
      const reorderedTasks = Array.from(columnTasks);
      const [removed] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, removed);

      // Update all tasks with new positions
      const updatedTasks = tasks.map(t => {
        if (t.column === destination.droppableId) {
          const newTask = reorderedTasks.find(rt => rt._id === t._id);
          return newTask || t;
        }
        return t;
      });

      setTasks(updatedTasks);
    } else {
      // Moving to different column
      const updatedTask = { ...task, column: destination.droppableId };
      handleTaskUpdate(task._id, updatedTask);
    }

    // Emit socket event for real-time updates
    const socket = getSocket();
    if (socket) {
      socketEvents.taskMoved({
        taskId: draggableId,
        fromColumnId: source.droppableId,
        toColumnId: destination.droppableId,
        boardId,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 p-6">
          <LoadingSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-hidden flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Board Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/boards')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentBoard?.title}
              </h1>
              {currentBoard?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentBoard.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvancedSearch(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400"
              title="Advanced Search (Ctrl+F)"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowActivityPanel(!showActivityPanel)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400"
              title="Activity"
            >
              <Activity className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-x-auto p-6">
          {currentBoard?.columns && currentBoard.columns.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 min-w-min justify-start">
                {currentBoard.columns.map((column) => {
                  // Filter tasks for this column
                  const columnTasks = getFilteredTasks().filter(task => task.column === column._id);
                  return (
                    <Column
                      key={column._id}
                      column={column}
                      boardId={boardId}
                      tasks={columnTasks}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}                      onTaskClick={handleTaskClick}                      loading={loading}
                    />
                  );
                })}
              </div>
            </DragDropContext>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">No columns yet</h3>
                <p className="text-sm">Create your first column to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ActivityLog
        boardId={boardId}
        isOpen={showActivityPanel}
        onClose={() => setShowActivityPanel(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onUpdate={(id, updated) => handleTaskUpdate(id, updated)}
      />

      {showAdvancedSearch && (
        <AdvancedSearch
          tasks={tasks}
          onFilter={setFilteredTasks}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      <PomodoroTimer />
    </div>
  );
};
