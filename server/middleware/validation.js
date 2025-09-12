// server/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(422).json({
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
};

// User registration validation rules
const userRegistrationRules = () => {
  return [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    
    body('department')
      .trim()
      .isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'])
      .withMessage('Please select a valid department'),
    
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ];
};

// User login validation rules
const userLoginRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

// Admin login validation rules
const adminLoginRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid admin email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

// Booking creation validation rules
const bookingCreationRules = () => {
  return [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    
    body('department')
      .trim()
      .isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'])
      .withMessage('Please select a valid department'),
    
    body('purpose')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Purpose must be between 10 and 500 characters'),
    
    body('date')
      .isISO8601()
      .toDate()
      .custom((value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value < today) {
          throw new Error('Booking date must be today or in the future');
        }
        return true;
      }),
    
    body('startTime')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format')
      .custom((value) => {
        const [hours, minutes] = value.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        const minTime = 9 * 60; // 9:00 AM
        const maxTime = 16 * 60 + 30; // 4:30 PM
        
        if (timeInMinutes < minTime || timeInMinutes > maxTime) {
          throw new Error('Start time must be between 9:00 AM and 4:30 PM');
        }
        return true;
      }),
    
    body('endTime')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format')
      .custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (!startTime) return true;
        
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${value}`);
        
        if (end <= start) {
          throw new Error('End time must be after start time');
        }
        
        const diffMinutes = (end - start) / (1000 * 60);
        if (diffMinutes < 30) {
          throw new Error('Minimum booking duration is 30 minutes');
        }
        
        if (diffMinutes > 480) {
          throw new Error('Maximum booking duration is 8 hours');
        }
        
        const [hours, minutes] = value.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        const maxTime = 16 * 60 + 30; // 4:30 PM
        
        if (timeInMinutes > maxTime) {
          throw new Error('End time must be before 4:30 PM');
        }
        
        return true;
      })
  ];
};

// Booking status update validation rules
const bookingStatusUpdateRules = () => {
  return [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Status must be one of: pending, confirmed, cancelled, completed')
  ];
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags and trim whitespace
        obj[key] = obj[key]
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 1000); // Limit length
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Auth rate limiting
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Booking rate limiting
const bookingLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 booking requests per hour
  'Too many booking requests, please try again later.'
);

// General API rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests, please try again later.'
);

module.exports = {
  validate,
  userRegistrationRules,
  userLoginRules,
  adminLoginRules,
  bookingCreationRules,
  bookingStatusUpdateRules,
  sanitizeInput,
  authLimiter,
  bookingLimiter,
  generalLimiter
};