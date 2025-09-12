// src/utils/dateUtils.js

/**
 * Utility functions for date and time operations
 */

// Format date to YYYY-MM-DD string
export const formatDateToString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format date for display (e.g., "Monday, January 15, 2024")
export const formatDateForDisplay = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  return new Date(date).toLocaleDateString('en-US', formatOptions);
};

// Format time for display (e.g., "2:30 PM")
export const formatTimeForDisplay = (time) => {
  if (!time) return '';
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get days in a month
export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

// Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

// Check if date is today
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Check if date is in the past
export const isPastDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Check if date is in the future
export const isFutureDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

// Get week days names
export const getWeekDays = (format = 'short') => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (format === 'short') {
    return days.map(day => day.substring(0, 3));
  }
  
  return days;
};

// Get month names
export const getMonthNames = (format = 'long') => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (format === 'short') {
    return months.map(month => month.substring(0, 3));
  }
  
  return months;
};

// Add days to a date
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Subtract days from a date
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

// Add months to a date
export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Get start of week (Sunday)
export const getStartOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  return new Date(result.setDate(diff));
};

// Get end of week (Saturday)
export const getEndOfWeek = (date) => {
  const startOfWeek = getStartOfWeek(date);
  return addDays(startOfWeek, 6);
};

// Get start of month
export const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get end of month
export const getEndOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// Generate time slots
export const generateTimeSlots = (startHour = 9, endHour = 16, intervalMinutes = 30) => {
  const slots = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      if (hour === endHour && minutes > 30) break; // Stop at 4:30 PM
      
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
  }
  
  return slots;
};

// Check if time is within business hours
export const isWithinBusinessHours = (time, startHour = 9, endHour = 16, endMinutes = 30) => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = startHour * 60;
  const endInMinutes = endHour * 60 + endMinutes;
  
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};

// Calculate duration between two times
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diffMs = end - start;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

// Check if two time ranges overlap
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  const startTime1 = new Date(`1970-01-01T${start1}`);
  const endTime1 = new Date(`1970-01-01T${end1}`);
  const startTime2 = new Date(`1970-01-01T${start2}`);
  const endTime2 = new Date(`1970-01-01T${end2}`);

  return (startTime1 < endTime2 && startTime2 < endTime1);
};

// Get relative time (e.g., "2 hours ago", "in 3 days")
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate - now;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return 'just now';
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  } else if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  } else {
    return formatDateForDisplay(date, { month: 'short', day: 'numeric' });
  }
};

// Parse time string to minutes
export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to time string
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Get current time in HH:MM format
export const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// Check if a date is a weekend
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Get next business day
export const getNextBusinessDay = (date) => {
  let nextDay = addDays(date, 1);
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};

// Get previous business day
export const getPreviousBusinessDay = (date) => {
  let prevDay = subtractDays(date, 1);
  while (isWeekend(prevDay)) {
    prevDay = subtractDays(prevDay, 1);
  }
  return prevDay;
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isSameDay(start, end)) {
    return formatDateForDisplay(start);
  } else if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()} ${getMonthNames()[start.getMonth()]} ${start.getFullYear()}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${getMonthNames('short')[start.getMonth()]} ${start.getDate()} - ${getMonthNames('short')[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${formatDateForDisplay(start, { month: 'short', day: 'numeric', year: 'numeric' })} - ${formatDateForDisplay(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
};

// Validate date string
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Get age from birthdate
export const calculateAge = (birthdate) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Get timezone offset
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

// Convert UTC to local time
export const utcToLocal = (utcDate) => {
  const date = new Date(utcDate);
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
};

// Convert local time to UTC
export const localToUtc = (localDate) => {
  const date = new Date(localDate);
  return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
};

export default {
  formatDateToString,
  formatDateForDisplay,
  formatTimeForDisplay,
  getDaysInMonth,
  isSameDay,
  isToday,
  isPastDate,
  isFutureDate,
  getWeekDays,
  getMonthNames,
  addDays,
  subtractDays,
  addMonths,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  generateTimeSlots,
  isWithinBusinessHours,
  calculateDuration,
  timeRangesOverlap,
  getRelativeTime,
  timeToMinutes,
  minutesToTime,
  getCurrentTime,
  isWeekend,
  getNextBusinessDay,
  getPreviousBusinessDay,
  formatDateRange,
  isValidDate,
  calculateAge,
  getTimezoneOffset,
  utcToLocal,
  localToUtc
};