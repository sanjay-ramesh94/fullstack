// routes/videoConference.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates
} = require('../controllers/videoConferenceController');

// Get available dates (must be before other GET routes)
router.get('/available-dates', getAvailableDates);

// Create video conference booking
router.post('/', auth, createBooking);

// Get user's video conference bookings
router.get('/my-bookings', auth, getBookingsByUser);

// Get video conference bookings for a specific date
router.get('/date/:date', getBookingsByDate);

// Update video conference booking status (admin)
router.put('/:bookingId/status', updateBookingStatus);

// Delete video conference booking
router.delete('/:bookingId', auth, deleteBooking);

module.exports = router;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      