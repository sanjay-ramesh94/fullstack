// src/utils/validation.js

/**
 * Utility functions for form validation
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Strong password validation
export const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Name validation
export const isValidName = (name) => {
  // At least 2 characters, only letters and spaces
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name?.trim());
};

// Roll number validation


// Department validation
export const isValidDepartment = (department) => {
  const validDepartments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Other'
  ];
  return validDepartments.includes(department);
};

// Purpose validation
export const isValidPurpose = (purpose) => {
  return purpose && purpose.trim().length >= 10 && purpose.trim().length <= 500;
};

// Time validation
export const isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Date validation
export const isValidBookingDate = (date) => {
  if (!date) return false;
  
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Must be today or in the future
  return bookingDate >= today;
};

// Time range validation
export const isValidTimeRange = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { isValid: false, message: 'Invalid time format' };
  }
  
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  
  if (start >= end) {
    return { isValid: false, message: 'End time must be after start time' };
  }
  
  // Check minimum duration (30 minutes)
  const diffMinutes = (end - start) / (1000 * 60);
  if (diffMinutes < 30) {
    return { isValid: false, message: 'Minimum booking duration is 30 minutes' };
  }
  
  // Check maximum duration (8 hours)
  if (diffMinutes > 480) {
    return { isValid: false, message: 'Maximum booking duration is 8 hours' };
  }
  
  return { isValid: true };
};

// Business hours validation
export const isWithinBusinessHours = (startTime, endTime) => {
  const businessStart = '09:00';
  const businessEnd = '16:30';
  
  if (startTime < businessStart || endTime > businessEnd) {
    return { 
      isValid: false, 
      message: 'Booking must be between 9:00 AM and 4:30 PM' 
    };
  }
  
  return { isValid: true };
};

// User registration validation
export const validateUserRegistration = (userData) => {
  const errors = {};
  
  // Name validation
  if (!userData.name || !isValidName(userData.name)) {
    errors.name = 'Name must contain at least 2 letters and only alphabetic characters';
  }
  
  // Roll number validation
  
  
  // Department validation
  if (!userData.department || !isValidDepartment(userData.department)) {
    errors.department = 'Please select a valid department';
  }
  
  // Email validation
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!userData.password || !isValidPassword(userData.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  // Confirm password validation
  if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// User login validation
export const validateUserLogin = (loginData) => {
  const errors = {};
  
  // Email validation
  if (!loginData.email || !isValidEmail(loginData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!loginData.password || loginData.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Admin login validation
export const validateAdminLogin = (loginData) => {
  const errors = {};
  
  // Email validation
  if (!loginData.email || !isValidEmail(loginData.email)) {
    errors.email = 'Please enter a valid admin email address';
  }
  
  // Password validation
  if (!loginData.password || loginData.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Booking validation
export const validateBooking = (bookingData, existingBookings = []) => {
  const errors = {};
  
  // Name validation
  if (!bookingData.name || !isValidName(bookingData.name)) {
    errors.name = 'Name must contain at least 2 letters and only alphabetic characters';
  }
  
  // Roll number validation
  
  
  // Department validation
  if (!bookingData.department || !isValidDepartment(bookingData.department)) {
    errors.department = 'Please select a valid department';
  }
  
  // Purpose validation
  if (!bookingData.purpose || !isValidPurpose(bookingData.purpose)) {
    errors.purpose = 'Purpose must be between 10-500 characters';
  }
  
  // Date validation
  if (!bookingData.date || !isValidBookingDate(bookingData.date)) {
    errors.date = 'Please select a valid future date';
  }
  
  // Time validation
  const timeRangeValidation = isValidTimeRange(bookingData.startTime, bookingData.endTime);
  if (!timeRangeValidation.isValid) {
    errors.timeRange = timeRangeValidation.message;
  }
  
  // Business hours validation
  const businessHoursValidation = isWithinBusinessHours(bookingData.startTime, bookingData.endTime);
  if (!businessHoursValidation.isValid) {
    errors.businessHours = businessHoursValidation.message;
  }
  
  // Conflict validation
  const hasConflict = existingBookings.some(booking => {
    const start1 = new Date(`1970-01-01T${bookingData.startTime}`);
    const end1 = new Date(`1970-01-01T${bookingData.endTime}`);
    const start2 = new Date(`1970-01-01T${booking.startTime}`);
    const end2 = new Date(`1970-01-01T${booking.endTime}`);
    
    return (start1 < end2 && start2 < end1);
  });
  
  if (hasConflict) {
    errors.conflict = 'Selected time slot conflicts with existing booking';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Sanitize object
export const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Check for required fields
export const checkRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

// Validate file upload
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = []) => {
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isStrongPassword,
  isValidName,
  isValidDepartment,
  isValidPurpose,
  isValidTime,
  isValidBookingDate,
  isValidTimeRange,
  isWithinBusinessHours,
  validateUserRegistration,
  validateUserLogin,
  validateAdminLogin,
  validateBooking,
  sanitizeInput,
  sanitizeObject,
  checkRequiredFields,
  validateFile
};