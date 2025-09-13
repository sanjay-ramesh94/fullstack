// routes/conventionCenter.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createConventionCenterBooking,
  getAllConventionCenterBookings,
  getUserConventionCenterBookings,
  getConventionCenterBookingsForDate,
  updateConventionCenterBookingStatus,
  deleteConventionCenterBooking
} = require('../controllers/conventionCenterController');

const router = express.Router();

// Create convention center booking
router.post('/', auth, createConventionCenterBooking);

// Get all convention center bookings (admin)
router.get('/', getAllConventionCenterBookings);

// Get user's convention center bookings
router.get('/my-bookings', auth, getUserConventionCenterBookings);

// Get convention center bookings for a specific date
router.get('/date/:date', getConventionCenterBookingsForDate);

// Update convention center booking status (admin)
router.put('/:bookingId/status', updateConventionCenterBookingStatus);

// Delete convention center booking
router.delete('/:bookingId', auth, deleteConventionCenterBooking);

module.exports = router;
