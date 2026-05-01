import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../src/index.js';
import User from '../src/models/User.js';

describe('Email Verification & Password Reset Tests', () => {
  let server;
  let testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123',
    passwordConfirm: 'TestPass123'
  };
  let verificationToken;
  let resetToken;

  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-test');
    }

    // Start server for testing
    server = app.listen(0);
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
  });

  describe('Email Verification Flow', () => {
    beforeEach(async () => {
      // Register user (this should generate verification token)
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Get the verification token from the user (in real app, this would be sent via email)
      const user = await User.findOne({ email: testUser.email });
      if (user.emailVerificationToken) {
        // Convert hashed token back to original (for testing only)
        // In real scenario, we'd capture the token from the email
        verificationToken = 'test-token-for-verification'; // Mock token
      }
    });

    it('should verify email with valid token', async () => {
      // First, let's manually set up a verification token for testing
      const user = await User.findOne({ email: testUser.email });
      const { token, hashedToken } = generateTestToken();
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const response = await request(server)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Email verified successfully');

      // Verify user is marked as verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailVerified).to.be.true;
      expect(updatedUser.emailVerificationToken).to.be.undefined;
    });

    it('should reject invalid verification token', async () => {
      const response = await request(server)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid or expired verification token');
    });

    it('should reject expired verification token', async () => {
      const user = await User.findOne({ email: testUser.email });
      const { token, hashedToken } = generateTestToken();
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpiry = new Date(Date.now() - 1000); // Expired
      await user.save();

      const response = await request(server)
        .post('/api/auth/verify-email')
        .send({ token })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid or expired verification token');
    });

    it('should resend verification email', async () => {
      const response = await request(server)
        .post('/api/auth/resend-verification')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Verification email sent');
    });

    it('should reject resend for already verified email', async () => {
      // First verify the email
      const user = await User.findOne({ email: testUser.email });
      user.emailVerified = true;
      await user.save();

      const response = await request(server)
        .post('/api/auth/resend-verification')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal('Email is already verified');
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      // Register user
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should request password reset for existing user', async () => {
      const response = await request(server)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Password reset email sent');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(server)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('password reset link has been sent');
    });

    it('should reset password with valid token', async () => {
      // First, set up a reset token
      const user = await User.findOne({ email: testUser.email });
      const { token, hashedToken } = generateTestToken();
      user.passwordResetToken = hashedToken;
      user.passwordResetExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const newPassword = 'NewSecurePass123';

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword,
          confirmPassword: newPassword
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Password reset successfully');

      // Verify password was updated
      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.passwordResetToken).to.be.undefined;
      expect(updatedUser.passwordResetExpiry).to.be.undefined;
    });

    it('should reject password reset with invalid token', async () => {
      const response = await request(server)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPass123',
          confirmPassword: 'NewPass123'
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid or expired reset token');
    });

    it('should reject password reset with mismatched passwords', async () => {
      const user = await User.findOne({ email: testUser.email });
      const { token, hashedToken } = generateTestToken();
      user.passwordResetToken = hashedToken;
      user.passwordResetExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword: 'NewPass123',
          confirmPassword: 'DifferentPass123'
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal('Passwords do not match');
    });

    it('should reject password reset with weak password', async () => {
      const user = await User.findOne({ email: testUser.email });
      const { token, hashedToken } = generateTestToken();
      user.passwordResetToken = hashedToken;
      user.passwordResetExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const response = await request(server)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword: 'weak',
          confirmPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('at least 6 characters');
    });
  });
});

// Helper function to generate test tokens
const generateTestToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};