// routes/conventionCenter.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates
} = require('../controllers/conventionCenterController');

const router = express.Router();

// Get available dates (must be before other GET routes)
router.get('/available-dates', getAvailableDates);

// Create convention center booking
router.post('/', auth, createBooking);

// Get user's convention center bookings
router.get('/my-bookings', auth, getBookingsByUser);

// Get convention center bookings for a specific date
router.get('/date/:date', getBookingsByDate);

// Update convention center booking status (admin)
router.put('/:bookingId/status', updateBookingStatus);

// Delete convention center booking
router.delete('/:bookingId', auth, deleteBooking);

module.exports = router;
