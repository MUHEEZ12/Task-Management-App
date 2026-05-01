import { expect } from 'chai';
import sinon from 'sinon';
import { validateRegister, validateLogin, validateBoard, validateTask } from '../src/middleware/validation.js';

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  describe('validateRegister', () => {
    it('should pass validation with valid data', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        passwordConfirm: 'SecurePass123'
      };

      validateRegister(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.body.name).to.equal('John Doe');
      expect(req.body.email).to.equal('john@example.com');
    });

    it('should reject missing fields', () => {
      req.body = { name: 'John Doe' };

      validateRegister(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/Please provide/)
      }))).to.be.true;
    });

    it('should reject invalid email', () => {
      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123',
        passwordConfirm: 'SecurePass123'
      };

      validateRegister(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/valid email/)
      }))).to.be.true;
    });

    it('should reject weak password', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        passwordConfirm: 'weak'
      };

      validateRegister(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/at least 6 characters/)
      }))).to.be.true;
    });

    it('should reject password without complexity', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      validateRegister(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/uppercase.*lowercase.*number/)
      }))).to.be.true;
    });

    it('should reject mismatched passwords', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        passwordConfirm: 'DifferentPass123'
      };

      validateRegister(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: 'Passwords do not match'
      }))).to.be.true;
    });
  });

  describe('validateLogin', () => {
    it('should pass validation with valid data', () => {
      req.body = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      validateLogin(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.body.email).to.equal('john@example.com');
    });

    it('should reject missing email or password', () => {
      req.body = { email: 'john@example.com' };

      validateLogin(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/email and password/)
      }))).to.be.true;
    });

    it('should reject invalid email format', () => {
      req.body = {
        email: 'invalid-email',
        password: 'SecurePass123'
      };

      validateLogin(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/valid email/)
      }))).to.be.true;
    });
  });

  describe('validateBoard', () => {
    it('should pass validation with valid data', () => {
      req.body = {
        title: 'Project Board',
        description: 'A project management board'
      };

      validateBoard(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.body.title).to.equal('Project Board');
      expect(req.body.description).to.equal('A project management board');
    });

    it('should reject missing title', () => {
      req.body = { description: 'A description' };

      validateBoard(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/board title/)
      }))).to.be.true;
    });

    it('should reject title too long', () => {
      req.body = {
        title: 'a'.repeat(101),
        description: 'Valid description'
      };

      validateBoard(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/100 characters/)
      }))).to.be.true;
    });

    it('should reject description too long', () => {
      req.body = {
        title: 'Valid Title',
        description: 'a'.repeat(501)
      };

      validateBoard(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/500 characters/)
      }))).to.be.true;
    });
  });

  describe('validateTask', () => {
    it('should pass validation with valid data', () => {
      req.body = {
        title: 'Implement feature',
        description: 'Implement the new feature',
        priority: 'high'
      };

      validateTask(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.body.title).to.equal('Implement feature');
    });

    it('should reject missing title', () => {
      req.body = { description: 'A description' };

      validateTask(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/task title/)
      }))).to.be.true;
    });

    it('should reject invalid priority', () => {
      req.body = {
        title: 'Valid Title',
        priority: 'urgent'
      };

      validateTask(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/low.*medium.*high/)
      }))).to.be.true;
    });

    it('should reject title too long', () => {
      req.body = {
        title: 'a'.repeat(201),
        description: 'Valid description'
      };

      validateTask(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/200 characters/)
      }))).to.be.true;
    });

    it('should reject description too long', () => {
      req.body = {
        title: 'Valid Title',
        description: 'a'.repeat(1001)
      };

      validateTask(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(sinon.match({
        success: false,
        message: sinon.match(/1000 characters/)
      }))).to.be.true;
    });
  });
});