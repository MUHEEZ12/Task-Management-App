import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/emailController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { getUserStats } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { strictLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const isTestEnvironment = process.env.NODE_ENV === 'test';
const testBypass = (req, res, next) => next();

// Authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

// Email verification routes (strict rate limiting)
router.post('/verify-email', isTestEnvironment ? testBypass : strictLimiter, verifyEmail);
router.post('/resend-verification', isTestEnvironment ? testBypass : strictLimiter, resendVerificationEmail);

// Password reset routes (strict rate limiting)
router.post('/forgot-password', isTestEnvironment ? testBypass : strictLimiter, forgotPassword);
router.post('/reset-password', isTestEnvironment ? testBypass : strictLimiter, resetPassword);

// Stats routes
router.get('/stats', protect, getUserStats);

export default router;
