// routes/mbaSeminar.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates
} = require('../controllers/mbaSeminarController');

const router = express.Router();

// Get available dates (must be before other GET routes)
router.get('/available-dates', getAvailableDates);

// Create MBA seminar booking
router.post('/', auth, createBooking);

// Get user's MBA seminar bookings
router.get('/my-bookings', auth, getBookingsByUser);

// Get MBA seminar bookings for a specific date
router.get('/date/:date', getBookingsByDate);

// Update MBA seminar booking status (admin)
router.put('/:bookingId/status', updateBookingStatus);

// Delete MBA seminar booking
router.delete('/:bookingId', auth, deleteBooking);

module.exports = router;
