/**
 * Statistics controller
 * Provides board and task statistics for dashboards
 */

import Board from '../models/Board.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

/**
 * @desc    Get board statistics
 * @route   GET /api/boards/:boardId/stats
 * @access  Private
 */
export const getBoardStats = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    // Verify board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Get task statistics
    const totalTasks = await Task.countDocuments({ board: boardId });
    const completedTasks = await Task.countDocuments({
      board: boardId,
      status: 'completed',
    });
    const pendingTasks = await Task.countDocuments({
      board: boardId,
      status: { $in: ['todo', 'in-progress'] },
    });

    // Get priority breakdown
    const priorityStats = await Task.aggregate([
      { $match: { board: require('mongoose').Types.ObjectId(boardId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Get completion rate
    const completionRate =
      totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    // Get recent activity
    const recentActivity = await Activity.find({ board: boardId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: parseFloat(completionRate),
        priorityBreakdown: priorityStats.reduce(
          (acc, item) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/auth/stats
 * @access  Private
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get boards owned by user
    const totalBoards = await Board.countDocuments({ owner: userId });

    // Get all tasks assigned to user
    const totalTasksAssigned = await Task.countDocuments({
      assignees: userId,
    });

    // Get completed tasks
    const completedTasks = await Task.countDocuments({
      assignees: userId,
      status: 'completed',
    });

    // Get tasks in progress
    const inProgressTasks = await Task.countDocuments({
      assignees: userId,
      status: 'in-progress',
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      assignees: userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBoards,
        totalTasksAssigned,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate:
          totalTasksAssigned > 0
            ? ((completedTasks / totalTasksAssigned) * 100).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
