// routes/mbaSeminar.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  createMBASeminarBooking,
  getAllMBASeminarBookings,
  getUserMBASeminarBookings,
  getMBASeminarBookingsForDate,
  updateMBASeminarBookingStatus,
  deleteMBASeminarBooking
} = require('../controllers/mbaSeminarController');

const router = express.Router();

// Create MBA seminar booking
router.post('/', auth, createMBASeminarBooking);

// Get all MBA seminar bookings (admin)
router.get('/', getAllMBASeminarBookings);

// Get user's MBA seminar bookings
router.get('/my-bookings', auth, getUserMBASeminarBookings);

// Get MBA seminar bookings for a specific date
router.get('/date/:date', getMBASeminarBookingsForDate);

// Update MBA seminar booking status (admin)
router.put('/:bookingId/status', updateMBASeminarBookingStatus);

// Delete MBA seminar booking
router.delete('/:bookingId', auth, deleteMBASeminarBooking);

module.exports = router;
