const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/send-otp
router.post('/send-otp', authController.sendOTP);

// @route   POST /api/auth/register (student only — admin cannot register publicly)
router.post('/register', authController.register);

// @route   POST /api/auth/login (both student + admin, role sent in body)
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email or mobile number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role')
      .optional()
      .isIn(['admin', 'student'])
      .withMessage('Invalid role'),
  ],
  authController.login
);

// @route   GET /api/auth/me
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update-profile
router.put('/update-profile', protect, authController.updateProfile);

// @route   PUT /api/auth/change-password
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  authController.changePassword
);

// @route   POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  authController.forgotPassword
);

// @route   POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  authController.resetPassword
);

module.exports = router;