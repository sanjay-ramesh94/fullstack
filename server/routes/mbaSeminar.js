// routes/mbaSeminar.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates,
  downloadReport,
  // Admin functions
  getAllBookingsForAdmin,
  getBookingsByDateForAdmin,
  getDashboardStats
} = require('../controllers/mbaSeminarController');

// Get available dates (must be before other GET routes)
router.get('/available-dates', getAvailableDates);

// Create MBA seminar booking
router.post('/', auth, createBooking);

// Get user's MBA seminar bookings
router.get('/my-bookings', auth, getBookingsByUser);

// Get MBA seminar bookings for a specific date
router.get('/date/:date', getBookingsByDate);

// Update MBA seminar booking status (admin)
router.put('/:bookingId/status', auth, (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, updateBookingStatus);

// Delete MBA seminar booking
router.delete('/:bookingId', auth, deleteBooking);

// Admin routes
router.get('/admin/bookings', auth, (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, getAllBookingsForAdmin);

router.get('/admin/events/:date', auth, (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, getBookingsByDateForAdmin);

router.get('/admin/dashboard-stats', auth, (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, getDashboardStats);

router.get('/admin/download-report', auth, (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, downloadReport);

// Export MBA Seminar bookings
router.get('/admin/export-bookings', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { format = 'csv', startDate, endDate, status, dateRange } = req.query;
    const MBASeminarBooking = require('../models/MBASeminarBooking');
    
    // Build filter query
    let matchQuery = { isActive: true };
    
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    // Apply date range filter if no specific dates provided
    if (!startDate && !endDate && dateRange && dateRange !== 'all') {
      const today = new Date();
      switch (dateRange) {
        case 'today':
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          matchQuery.date = { $gte: todayStart, $lt: todayEnd };
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          matchQuery.date = { $gte: weekStart, $lt: weekEnd };
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          matchQuery.date = { $gte: monthStart, $lt: monthEnd };
          break;
        case 'year':
          const yearStart = new Date(today.getFullYear(), 0, 1);
          const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
          matchQuery.date = { $gte: yearStart, $lt: yearEnd };
          break;
      }
    }

    // Fetch bookings with user data
    const bookings = await MBASeminarBooking.find(matchQuery)
      .populate('user', 'name department email phone')
      .sort({ date: 1, startTime: 1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID', 'Name', 'Department', 'Email', 'Phone', 'Date', 'Start Time', 
        'End Time', 'Purpose', 'Session Type', 'Speaker', 'Expected Students', 'Semester', 'Subject', 'Status', 'Created At'
      ].join(',');
      
      const csvRows = bookings.map(booking => [
        booking._id,
        booking.user?.name || booking.name || 'N/A',
        booking.user?.department || booking.department || 'N/A',
        booking.user?.email || 'N/A',
        booking.user?.phone || 'N/A',
        new Date(booking.date).toISOString().split('T')[0],
        booking.startTime,
        booking.endTime,
        booking.purpose,
        booking.sessionType || 'N/A',
        booking.speakerName || 'N/A',
        booking.expectedStudents || 'N/A',
        booking.semester || 'N/A',
        booking.subject || 'N/A',
        booking.status,
        booking.createdAt.toISOString()
      ].map(field => `"${field}"`).join(','));
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.header('Content-Type', 'text/csv');
      res.attachment('mba-seminar-bookings.csv');
      return res.send(csvContent);
    } else {
      // Default to JSON
      res.json(bookings);
    }
  } catch (error) {
    console.error('MBA Seminar export error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

module.exports = router;
