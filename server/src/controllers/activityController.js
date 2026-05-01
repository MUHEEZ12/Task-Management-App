import Activity from '../models/Activity.js';

// @desc    Get board activity
// @route   GET /api/activity/board/:boardId
// @access  Private
export const getBoardActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ board: req.params.boardId })
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
