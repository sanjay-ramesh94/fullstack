// server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sanitizeInput } = require('../utils/validation');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} type - User type (user or admin)
 * @returns {string} JWT token
 */
const generateToken = (userId, type) => {
  return jwt.sign(
    { userId, type },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '24h' }
  );
};

/**
 * User Registration
 */
const registerUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { name, department, email, password } = sanitizedData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { name }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or roll number already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      department,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, 'user');

    // Return success response (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        department: user.department,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === 'Email' ? 'Email' : 'Email'} already exists`
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * User Login
 */
const loginUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { email, password } = sanitizedData;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, 'user');

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        department: user.department,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Admin Login
 */
const loginAdmin = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { email, password } = sanitizedData;

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Admin account is deactivated. Please contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(admin._id, 'admin');

    // Return success response
    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Server error during admin login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get User Profile (Protected route)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        department: user.department,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update User Profile (Protected route)
 */
const updateUserProfile = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { name, department } = sanitizedData;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, department },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        department: updatedUser.department,
        email: updatedUser.email
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change Password (Protected route)
 */
const changePassword = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { currentPassword, newPassword } = sanitizedData;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(req.user.userId, {
      password: hashedNewPassword
    });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Token (Protected route)
 */
const verifyToken = async (req, res) => {
  try {
    let user;
    
    if (req.user.type === 'admin') {
      user = await Admin.findById(req.user.userId).select('-password');
    } else {
      user = await User.findById(req.user.userId).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      type: req.user.type,
      user: req.user.type === 'admin' ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : {
        id: user._id,
        name: user.name,
        department: user.department,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      message: 'Server error verifying token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getUserProfile,
  updateUserProfile,
  changePassword,
  verifyToken
};