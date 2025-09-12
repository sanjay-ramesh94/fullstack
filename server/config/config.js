// server/config/config.js
const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hall_booking',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Email configuration (for future use)
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_USER || '',

  // File upload configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Business hours configuration
  BUSINESS_START_HOUR: process.env.BUSINESS_START_HOUR || 9,
  BUSINESS_END_HOUR: process.env.BUSINESS_END_HOUR || 16,
  BUSINESS_END_MINUTE: process.env.BUSINESS_END_MINUTE || 30,
  
  // Pagination configuration
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE || 10,
  MAX_PAGE_SIZE: process.env.MAX_PAGE_SIZE || 100,
  
  // Security configuration
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 12,
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  
  // Booking configuration
  MAX_BOOKING_DURATION: process.env.MAX_BOOKING_DURATION || 8 * 60, // 8 hours in minutes
  MIN_BOOKING_DURATION: process.env.MIN_BOOKING_DURATION || 30, // 30 minutes
  MAX_ADVANCE_BOOKING_DAYS: process.env.MAX_ADVANCE_BOOKING_DAYS || 90, // 3 months
};

module.exports = config;