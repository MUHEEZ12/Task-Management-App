import User from '../models/User.js';
import { sendTokenResponse } from '../utils/tokenUtils.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {Object} req - Request object with body containing name, email, password, passwordConfirm
 * @param   {Object} res - Response object
 * @param   {Function} next - Express next middleware
 * @returns {Object} JSON response with token and user data
 * @throws  {400} Bad Request - validation errors
 * @throws  {409} Conflict - user already exists
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate email & password (validation middleware handles this)
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {Object} req - Request object with email and password in body
 * @param   {Object} res - Response object
 * @param   {Function} next - Express next middleware
 * @returns {Object} JSON response with token and user data
 * @throws  {400} Bad Request - missing email or password
 * @throws  {401} Unauthorized - invalid credentials
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password (validation middleware handles this)
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 * @param   {Object} req - Request object with user ID from auth middleware
 * @param   {Object} res - Response object
 * @param   {Function} next - Express next middleware
 * @returns {Object} JSON response with user data
 * @throws  {401} Unauthorized - not authenticated
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private (requires authentication)
 * @param   {Object} req - Request object with updated user data in body
 * @param   {Object} res - Response object
 * @param   {Function} next - Express next middleware
 * @returns {Object} JSON response with updated user data
 * @throws  {401} Unauthorized - not authenticated
 * @throws  {400} Bad Request - validation error
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, theme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar, theme },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};
