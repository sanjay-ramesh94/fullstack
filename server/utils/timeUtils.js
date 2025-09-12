// server/utils/timeUtils.js

/**
 * Convert time string to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in format "HH:MM"
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if two time slots overlap
 * @param {string} start1 - Start time of first slot
 * @param {string} end1 - End time of first slot
 * @param {string} start2 - Start time of second slot
 * @param {string} end2 - End time of second slot
 * @returns {boolean} True if slots overlap
 */
const checkTimeOverlap = (start1, end1, start2, end2) => {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Validate time format
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} True if valid time format
 */
const isValidTimeFormat = (timeStr) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

/**
 * Check if time is within business hours (9:00 AM to 4:30 PM)
 * @param {string} timeStr - Time to check
 * @returns {boolean} True if within business hours
 */
const isWithinBusinessHours = (timeStr) => {
  const minutes = timeToMinutes(timeStr);
  const startBusiness = timeToMinutes('09:00');
  const endBusiness = timeToMinutes('16:30');
  
  return minutes >= startBusiness && minutes <= endBusiness;
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Check if a booking time has passed
 * @param {Date} bookingDate - Date of the booking
 * @param {string} endTime - End time of the booking
 * @returns {boolean} True if booking has ended
 */
const isBookingCompleted = (bookingDate, endTime) => {
  const now = new Date();
  const bookingDateTime = new Date(bookingDate);
  const [hours, minutes] = endTime.split(':').map(Number);
  
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  return now > bookingDateTime;
};

/**
 * Calculate duration between two times
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {number} Duration in minutes
 */
const calculateDuration = (startTime, endTime) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return endMinutes - startMinutes;
};

/**
 * Generate time slots for the day
 * @param {number} intervalMinutes - Interval between slots (default: 30)
 * @returns {Array<string>} Array of time slots
 */
const generateTimeSlots = (intervalMinutes = 30) => {
  const slots = [];
  const startMinutes = timeToMinutes('09:00');
  const endMinutes = timeToMinutes('16:30');
  
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += intervalMinutes) {
    slots.push(minutesToTime(minutes));
  }
  
  return slots;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  checkTimeOverlap,
  isValidTimeFormat,
  isWithinBusinessHours,
  getCurrentTime,
  isBookingCompleted,
  calculateDuration,
  generateTimeSlots
};