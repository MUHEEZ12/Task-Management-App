import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'created_task',
        'updated_task',
        'deleted_task',
        'moved_task',
        'completed_task',
        'assigned_task',
        'added_comment',
        'created_board',
        'updated_board',
        'added_member',
      ],
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    changes: {
      from: mongoose.Schema.Types.Mixed,
      to: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
