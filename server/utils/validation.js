// server/utils/validation.js

const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for admin login
 */
const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for booking creation
 */
const validateBookingCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('purpose')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error('Date cannot be in the past');
      }
      
      // Check if date is not more than 3 months in advance
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      if (selectedDate > threeMonthsLater) {
        throw new Error('Date cannot be more than 3 months in advance');
      }
      
      return true;
    }),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time in HH:MM format')
    .custom((value) => {
      const timeMinutes = parseInt(value.split(':')[0]) * 60 + parseInt(value.split(':')[1]);
      const startBusiness = 9 * 60; // 9:00 AM
      const endBusiness = 16 * 60 + 30; // 4:30 PM
      
      if (timeMinutes < startBusiness || timeMinutes > endBusiness) {
        throw new Error('Start time must be between 09:00 and 16:30');
      }
      
      return true;
    }),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time in HH:MM format')
    .custom((value, { req }) => {
      const startTime = req.body.startTime;
      if (!startTime) return true;
      
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(value.split(':')[0]) * 60 + parseInt(value.split(':')[1]);
      const endBusiness = 16 * 60 + 30; // 4:30 PM
      
      if (endMinutes > endBusiness) {
        throw new Error('End time cannot be later than 16:30');
      }
      
      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time');
      }
      
      // Minimum booking duration of 30 minutes
      if (endMinutes - startMinutes < 30) {
        throw new Error('Minimum booking duration is 30 minutes');
      }
      
      // Maximum booking duration of 8 hours
      if (endMinutes - startMinutes > 480) {
        throw new Error('Maximum booking duration is 8 hours');
      }
      
      return true;
    })
];

/**
 * Validation rules for updating booking status
 */
const validateBookingStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed')
];

/**
 * Sanitize input data
 * @param {Object} data - Input data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeInput = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      // Remove HTML tags and trim whitespace
      sanitized[key] = data[key]
        .replace(/<[^>]*>/g, '')
        .trim();
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with boolean and message
 */
const isStrongPassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is strong' };
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateAdminLogin,
  validateBookingCreation,
  validateBookingStatusUpdate,
  sanitizeInput,
  isValidEmail,
  isStrongPassword
};