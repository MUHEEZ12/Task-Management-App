import express from 'express';
import { getBoardActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/board/:boardId', getBoardActivity);

export default router;
