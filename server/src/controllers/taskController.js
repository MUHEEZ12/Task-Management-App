import Task from '../models/Task.js';
import Column from '../models/Column.js';
import Activity from '../models/Activity.js';

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, columnId, boardId, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      column: columnId,
      board: boardId,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    // Add task to column
    await Column.findByIdAndUpdate(columnId, {
      $push: { tasks: task._id },
    });

    // Log activity
    await Activity.create({
      board: boardId,
      user: req.user.id,
      action: 'created_task',
      task: task._id,
      description: `Created task "${title}"`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, priority, dueDate, labels, assignee, isCompleted } = req.body;

    const changes = {};
    if (title !== undefined && title !== task.title) changes.title = { from: task.title, to: title };
    if (description !== undefined && description !== task.description)
      changes.description = { from: task.description, to: description };
    if (priority !== undefined && priority !== task.priority) changes.priority = { from: task.priority, to: priority };
    if (assignee !== undefined && assignee !== task.assignee?.toString())
      changes.assignee = { from: task.assignee, to: assignee };
    if (isCompleted !== undefined && isCompleted !== task.isCompleted)
      changes.isCompleted = { from: task.isCompleted, to: isCompleted };

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, dueDate, labels, assignee, isCompleted },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name avatar');

    // Log activity
    if (Object.keys(changes).length > 0) {
      await Activity.create({
        board: task.board,
        user: req.user.id,
        action: 'updated_task',
        task: task._id,
        changes,
        description: `Updated task "${task.title}"`,
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const boardId = task.board;
    const columnId = task.column;
    const taskTitle = task.title;

    // Remove from column
    await Column.findByIdAndUpdate(columnId, {
      $pull: { tasks: task._id },
    });

    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      board: boardId,
      user: req.user.id,
      action: 'deleted_task',
      description: `Deleted task "${taskTitle}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move task between columns
// @route   PUT /api/tasks/:id/move
// @access  Private
export const moveTask = async (req, res, next) => {
  try {
    const { fromColumnId, toColumnId, fromIndex, toIndex } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Remove from old column
    await Column.findByIdAndUpdate(fromColumnId, {
      $pull: { tasks: task._id },
    });

    // Add to new column
    const toColumn = await Column.findById(toColumnId);
    toColumn.tasks.splice(toIndex, 0, task._id);
    await toColumn.save();

    // Update task
    task.column = toColumnId;
    await task.save();

    // Log activity
    await Activity.create({
      board: task.board,
      user: req.user.id,
      action: 'moved_task',
      task: task._id,
      description: `Moved task "${task.title}"`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name avatar');

    res.status(200).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user.id,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('comments.user', 'name avatar');

    // Log activity
    await Activity.create({
      board: task.board,
      user: req.user.id,
      action: 'added_comment',
      task: task._id,
      description: `Added comment to task "${task.title}"`,
    });

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};
