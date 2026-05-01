import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus } from 'lucide-react';
import { boardService } from '../services';
import { useBoardStore } from '../context/store';
import { useNotification } from '../hooks/useNotification';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export const CreateBoardPage = () => {
  const navigate = useNavigate();
  const { addBoard } = useBoardStore();
  const { error, success } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      error('Please enter a board title');
      return;
    }

    try {
      setLoading(true);
      const res = await boardService.createBoard(formData);
      addBoard(res.data.board);
      success('Board created successfully!');
      navigate(`/boards/${res.data.board._id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create board');
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
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => navigate('/boards')}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Boards
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Create New Board
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up a new board to organize your tasks and collaborate with your team.
                </p>
              </div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 space-y-6"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Q4 Project, Marketing Launch"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this board is for..."
                    rows="4"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition outline-none resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Board Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData((prev) => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-lg transition ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Preview
                  </label>
                  <div
                    className="p-6 rounded-lg text-white h-32 flex flex-col justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${formData.color}, ${formData.color}dd)`,
                    }}
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {formData.title || 'Untitled Board'}
                      </h3>
                      {formData.description && (
                        <p className="text-sm opacity-90">{formData.description.substring(0, 50)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating...' : 'Create Board'}
                    {!loading && <Plus className="w-5 h-5" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => navigate('/boards')}
                    className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 font-semibold py-2.5 rounded-lg transition"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
