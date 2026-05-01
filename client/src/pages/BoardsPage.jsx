import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, BarChart3, Grid3X3 } from 'lucide-react';
import { boardService } from '../services';
import { useBoardStore } from '../context/store';
import { useNotification } from '../hooks/useNotification';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const BoardsPage = () => {
  const navigate = useNavigate();
  const { boards, setBoards, loading, setLoading } = useBoardStore();
  const { error } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const res = await boardService.getBoards();
      setBoards(res.data.boards);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-hidden flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {showAnalytics ? 'Analytics' : 'Boards'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {showAnalytics
                        ? 'Track your productivity and task completion metrics.'
                        : 'Manage your projects and tasks in one place.'
                      }
                    </p>
                  </div>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setShowAnalytics(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        !showAnalytics
                          ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Boards
                    </button>
                    <button
                      onClick={() => setShowAnalytics(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        showAnalytics
                          ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {showAnalytics ? (
                <AnalyticsDashboard />
              ) : (
                <>
                  {/* Loading */}
                  {loading ? (
                    <LoadingSkeleton count={6} />
                  ) : boards.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No boards yet"
                      description="Create your first board to get started organizing your tasks."
                      action={
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/boards/new')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                        >
                          <Plus className="w-5 h-5" />
                          Create Your First Board
                        </motion.button>
                      }
                    />
                  ) : (
                    <div>
                      {/* Boards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boards.map((board) => (
                          <motion.div
                            key={board._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate(`/boards/${board._id}`)}
                            className="cursor-pointer group"
                          >
                            <div
                              className="p-6 rounded-lg shadow-md hover:shadow-lg transition h-32 flex flex-col justify-between text-white"
                              style={{
                                background: `linear-gradient(135deg, ${board.color}, ${board.color}dd)`,
                              }}
                            >
                              <div>
                                <h3 className="text-lg font-semibold mb-1 line-clamp-2">{board.title}</h3>
                                {board.description && (
                                  <p className="text-sm opacity-90 line-clamp-1">{board.description}</p>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs opacity-75">
                                  {board.columns?.length || 0} columns
                                </p>
                                <div className="flex -space-x-2">
                                  {board.members?.slice(0, 3).map((member) => (
                                    <div
                                      key={member._id}
                                      className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-bold"
                                      title={member.name}
                                    >
                                      {member.name?.[0]?.toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* New Board Card */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/boards/new')}
                          className="p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 flex items-center justify-center h-32"
                        >
                          <div className="text-center">
                            <Plus className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              Create Board
                            </p>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
