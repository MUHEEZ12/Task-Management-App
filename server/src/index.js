import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { responseTime, trackMetrics, getSystemHealth, getMetrics } from './middleware/monitoring.js';

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        process.env.CORS_ORIGIN,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB Error:', err));

// Middleware
app.use(requestLogger);
app.use(trackMetrics);
app.use(responseTime);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        process.env.CORS_ORIGIN,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

const isTestEnvironment = process.env.NODE_ENV === 'test';

// Rate limiting
if (!isTestEnvironment) {
  app.use('/api/', apiLimiter);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);

// Monitoring routes
app.get('/api/health', getSystemHealth);
app.get('/api/metrics', getMetrics);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`);
    socket.broadcast.to(`board-${boardId}`).emit('user-joined', {
      message: `A user joined the board`,
    });
  });

  socket.on('task-created', (data) => {
    io.to(`board-${data.boardId}`).emit('task-created', data);
  });

  socket.on('task-updated', (data) => {
    io.to(`board-${data.boardId}`).emit('task-updated', data);
  });

  socket.on('task-moved', (data) => {
    io.to(`board-${data.boardId}`).emit('task-moved', data);
  });

  socket.on('task-deleted', (data) => {
    io.to(`board-${data.boardId}`).emit('task-deleted', data);
  });

  socket.on('notification', (data) => {
    io.to(`board-${data.boardId}`).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server only outside of test environment
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
