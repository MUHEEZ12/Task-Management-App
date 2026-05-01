import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
      isArchived: false,
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boards.length,
      boards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'columns',
        populate: {
          path: 'tasks',
          populate: [
            { path: 'assignee', select: 'name email avatar' },
            { path: 'comments.user', select: 'name avatar' },
          ],
        },
      });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.create({
      title,
      description,
      color: color || '#3B82F6',
      owner: req.user.id,
      members: [req.user.id],
    });

    // Create default columns
    const columnTitles = ['To Do', 'In Progress', 'Done'];
    const columns = [];

    for (let i = 0; i < columnTitles.length; i++) {
      const column = await Column.create({
        title: columnTitles[i],
        board: board._id,
        order: i,
      });
      columns.push(column._id);
    }

    board.columns = columns;
    await board.save();

    // Log activity
    await Activity.create({
      board: board._id,
      user: req.user.id,
      action: 'created_board',
      description: `Created board "${title}"`,
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'columns',
        populate: {
          path: 'tasks',
        },
      });

    res.status(201).json({
      success: true,
      board: populatedBoard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this board' });
    }

    const { title, description, color } = req.body;

    board = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description, color },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'columns',
        populate: {
          path: 'tasks',
        },
      });

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this board' });
    }

    // Delete all columns and tasks
    await Column.deleteMany({ board: req.params.id });
    await Task.deleteMany({ board: req.params.id });
    await Activity.deleteMany({ board: req.params.id });

    await Board.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Board deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this board' });
    }

    if (board.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already a member' });
    }

    board.members.push(userId);
    await board.save();

    await Activity.create({
      board: board._id,
      user: req.user.id,
      action: 'added_member',
      description: `Added member to board`,
    });

    board = await board.populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    next(error);
  }
};
