// routes/videoConference.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createVideoConferenceBooking,
  getAllVideoConferenceBookings,
  getUserVideoConferenceBookings,
  getVideoConferenceBookingsForDate,
  updateVideoConferenceBookingStatus,
  deleteVideoConferenceBooking
} = require('../controllers/videoConferenceController');

const router = express.Router();

// Create video conference booking
router.post('/', auth, createVideoConferenceBooking);

// Get all video conference bookings (admin)
router.get('/', getAllVideoConferenceBookings);

// Get user's video conference bookings
router.get('/my-bookings', auth, getUserVideoConferenceBookings);

// Get video conference bookings for a specific date
router.get('/date/:date', getVideoConferenceBookingsForDate);

// Update video conference booking status (admin)
router.put('/:bookingId/status', updateVideoConferenceBookingStatus);

// Delete video conference booking
router.delete('/:bookingId', auth, deleteVideoConferenceBooking);

module.exports = router;
