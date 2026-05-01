import express from 'express';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  addComment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.post('/:id/comments', addComment);

export default router;
