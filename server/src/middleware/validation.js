/**
 * Validation middleware for request data sanitization
 * Prevents common security issues and validates input format
 */

import validator from 'validator';

/**
 * Validate registration request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Check if fields are provided
  if (!name || !email || !password || !passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, password, and password confirmation',
    });
  }

  // Sanitize inputs
  const sanitizedName = validator.trim(validator.escape(name));
  const sanitizedEmail = validator.trim(validator.normalizeEmail(email));

  // Validate email format
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  // Validate name length
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 50 characters',
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  if (password.length > 128) {
    return res.status(400).json({
      success: false,
      message: 'Password must be less than 128 characters',
    });
  }

  // Check password complexity (at least one uppercase, one number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    });
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  // Attach sanitized data to request
  req.body.name = sanitizedName;
  req.body.email = sanitizedEmail;

  next();
};

/**
 * Validate login request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  const sanitizedEmail = validator.trim(validator.normalizeEmail(email));

  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  req.body.email = sanitizedEmail;
  next();
};

/**
 * Validate board creation/update
 */
export const validateBoard = (req, res, next) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a board title',
    });
  }

  const sanitizedTitle = validator.trim(validator.escape(title));
  const sanitizedDescription = description ? validator.trim(validator.escape(description)) : '';

  if (sanitizedTitle.length < 1 || sanitizedTitle.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must be between 1 and 100 characters',
    });
  }

  if (sanitizedDescription.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Description must be less than 500 characters',
    });
  }

  req.body.title = sanitizedTitle;
  req.body.description = sanitizedDescription;

  next();
};

/**
 * Validate task creation/update
 */
export const validateTask = (req, res, next) => {
  const { title, description, priority } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a task title',
    });
  }

  const sanitizedTitle = validator.trim(validator.escape(title));
  const sanitizedDescription = description ? validator.trim(validator.escape(description)) : '';
  const validPriorities = ['low', 'medium', 'high'];

  if (sanitizedTitle.length < 1 || sanitizedTitle.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title must be between 1 and 200 characters',
    });
  }

  if (sanitizedDescription.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be less than 1000 characters',
    });
  }

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be one of: low, medium, high',
    });
  }

  req.body.title = sanitizedTitle;
  req.body.description = sanitizedDescription;

  next();
};
