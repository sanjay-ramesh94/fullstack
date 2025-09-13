// routes/lab.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createLabBooking,
  getAllLabBookings,
  getUserLabBookings,
  getLabBookingsForDate,
  updateLabBookingStatus,
  deleteLabBooking
} = require('../controllers/labController');

const router = express.Router();

// Create lab booking
router.post('/', auth, createLabBooking);

// Get all lab bookings (admin)
router.get('/', getAllLabBookings);

// Get user's lab bookings
router.get('/my-bookings', auth, getUserLabBookings);

// Get lab bookings for a specific date
router.get('/date/:date', getLabBookingsForDate);

// Update lab booking status (admin)
router.put('/:bookingId/status', updateLabBookingStatus);

// Delete lab booking
router.delete('/:bookingId', auth, deleteLabBooking);

module.exports = router;
