const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { sendEmail, sendOTPEmail } = require('../utils/email');
const config = require('../config');
const OTP = require('../models/OTP');

/**
 * @desc    Register a new student (public registration is student-only)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.sendOTP = async (req, res) => {
  try {
    console.log('=== SEND OTP CALLED ===');
    console.log('Request body:', req.body);
    console.log('Email config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      passExists: !!process.env.SMTP_PASS
    });

    const { email, mobileNumber, name } = req.body;
    const cleanMobile = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-10) : '';

    if (!email && !cleanMobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number or email is required'
      });
    }

    // Check if email or mobile number is already registered
    const userCheckQueries = [];
    if (email) userCheckQueries.push({ email: email.toLowerCase().trim() });
    if (cleanMobile) userCheckQueries.push({ mobileNumber: cleanMobile });

    if (userCheckQueries.length > 0) {
      const existingUser = await User.findOne({ $or: userCheckQueries });
      if (existingUser) {
        const isEmailMatch = email && existingUser.email === email.toLowerCase().trim();
        return res.status(400).json({
          success: false,
          message: isEmailMatch
            ? 'This email is already registered. Please login instead.'
            : 'This mobile number is already registered. Please login instead.'
        });
      }
    }

    // Delete old OTPs for this email or mobile
    const otpDeleteQueries = [];
    if (email) otpDeleteQueries.push({ email: email.toLowerCase().trim() });
    if (cleanMobile) otpDeleteQueries.push({ mobileNumber: cleanMobile });
    await OTP.deleteMany({ $or: otpDeleteQueries });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database
    const otpRecord = await OTP.create({
      email: email ? email.toLowerCase().trim() : '',
      mobileNumber: cleanMobile,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
      attempts: 0
    });

    console.log('OTP saved to DB:', otpRecord._id, 'Code:', otpCode);

    // Send SMS OTP to Mobile Number
    if (cleanMobile) {
      const { sendSMSOTP } = require('../utils/sms');
      await sendSMSOTP(cleanMobile, otpCode);
    }

    // Send Email OTP if email provided
    let emailSent = false;
    if (email) {
      try {
        await sendOTPEmail(email.trim(), otpCode, name || 'Student');
        emailSent = true;
        console.log('✅ OTP email dispatched to:', email);
      } catch (emailError) {
        console.warn('⚠️ Live email dispatch skipped (SMS & local OTP ready):', emailError.message);
      }
    }

    const destination = cleanMobile && email 
      ? `mobile number +91 ${cleanMobile} and ${email}` 
      : (cleanMobile ? `mobile number +91 ${cleanMobile}` : email);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${destination}. Valid for 10 minutes.`,
      devOtp: otpCode,
    });

  } catch (error) {
    console.error('SEND OTP ERROR:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      mobileNumber,
      collegeName,
      branch
    } = req.body;

    // Validate essential fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Roll number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanMobile = mobileNumber ? mobileNumber.toString().replace(/\D/g, '').slice(-10) : '';
    const studentEmail = email && email.trim() 
      ? email.toLowerCase().trim() 
      : (cleanMobile ? `${cleanMobile}@student.synctest.com` : `${rollNumber.trim().toLowerCase()}@student.synctest.com`);

    // Check if email, roll number, or mobile number is already registered
    const duplicateQueries = [{ email: studentEmail }];
    if (rollNumber) duplicateQueries.push({ rollNumber: rollNumber.trim() });
    if (cleanMobile) duplicateQueries.push({ mobileNumber: cleanMobile });

    const existing = await User.findOne({ $or: duplicateQueries });
    if (existing) {
      if (existing.email === studentEmail) {
        return res.status(400).json({ success: false, message: 'This email is already registered. Please login.' });
      }
      if (existing.rollNumber === rollNumber.trim()) {
        return res.status(400).json({ success: false, message: 'This roll number is already registered. Please login.' });
      }
      if (cleanMobile && existing.mobileNumber === cleanMobile) {
        return res.status(400).json({ success: false, message: 'This mobile number is already registered. Please login.' });
      }
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }

    // Create user account directly without OTP verification
    const user = await User.create({
      name: name.trim(),
      email: studentEmail,
      password,
      rollNumber: rollNumber.trim(),
      mobileNumber: cleanMobile || (mobileNumber ? mobileNumber.trim() : ''),
      collegeName: collegeName ? collegeName.trim() : '',
      branch: branch || 'Computer Engineering',
      role: 'student',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SyncTest.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * @desc    Login user (both student and admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role } = req.body;

    const identifier = (email || '').trim();
    const cleanMobile = identifier.replace(/\D/g, '').slice(-10);
    const isMobile = cleanMobile.length === 10 && /^\d{10}$/.test(cleanMobile);

    // Find user by email or mobile number with password field
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        ...(isMobile ? [{ mobileNumber: cleanMobile }] : [])
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/mobile number or password',
      });
    }

    // If a role was specified (e.g., admin login page), verify role matches
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: role === 'admin'
          ? 'This account does not have admin privileges'
          : 'Please use the admin login page',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber || '',
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password — send reset token via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists (security)
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6366f1;">🔐 Password Reset — SyncTest</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">This link expires in <strong>30 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">— SyncTest Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset — SyncTest',
        html,
      });
    } catch {
      // If email fails, clear token and inform user
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token: resetToken, password } = req.body;

    // Hash the token from the URL and find matching user
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new auth token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
