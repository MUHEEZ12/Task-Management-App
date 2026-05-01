import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/index.js';
import User from '../src/models/User.js';

describe('API Integration Tests', () => {
  let server;
  let testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123',
    passwordConfirm: 'TestPass123'
  };
  let authToken;

  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-test');
    }

    // Start server for testing
    server = app.listen(0); // Use random port
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

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body).to.have.property('token');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user.name).to.equal(testUser.name);
      expect(response.body.user.email).to.equal(testUser.email);
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same email
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('already in use');
    });

    it('should reject invalid email format', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('valid email');
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        password: 'weak',
        passwordConfirm: 'weak'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register user first
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body).to.have.property('token');
      expect(response.body.user.email).to.equal(testUser.email);

      // Store token for other tests
      authToken = response.body.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Register and login to get token
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      const loginResponse = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      authToken = loginResponse.body.token;
    });

    it('should return current user profile', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.user.name).to.equal(testUser.name);
      expect(response.body.user.email).to.equal(testUser.email);
      expect(response.body.user).to.have.property('id');
    });

    it('should reject request without token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should reject invalid token', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).to.equal('OK');
    });
  });
});