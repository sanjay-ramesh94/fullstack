// routes/lab.js
const express = require('express');
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
} = require('../controllers/labController');

const router = express.Router();

// Get available dates (must be before other GET routes)
router.get('/available-dates', getAvailableDates);

// Create lab booking
router.post('/', auth, createBooking);

// Get user's lab bookings
router.get('/my-bookings', auth, getBookingsByUser);

// Get lab bookings for a specific date
router.get('/date/:date', getBookingsByDate);

// Update lab booking status (admin)
router.put('/:bookingId/status', updateBookingStatus);

// Delete lab booking
router.delete('/:bookingId', auth, deleteBooking);

// Admin routes
router.get('/admin/bookings', auth, getAllBookingsForAdmin);
router.get('/admin/events/:date', auth, getBookingsByDateForAdmin);
router.get('/admin/dashboard-stats', auth, getDashboardStats);
router.get('/admin/download-report', auth, downloadReport);

// Export Lab bookings
router.get('/admin/export-bookings', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { format = 'csv', startDate, endDate, status, dateRange } = req.query;
    const LabBooking = require('../models/LabBooking');
    
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
    const bookings = await LabBooking.find(matchQuery)
      .populate('user', 'name department email phone')
      .sort({ date: 1, startTime: 1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID', 'Name', 'Department', 'Email', 'Phone', 'Date', 'Start Time', 
        'End Time', 'Purpose', 'Lab Type', 'Experiment Type', 'Students', 'Supervisor', 'Status', 'Created At'
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
        booking.labType || 'N/A',
        booking.experimentType || 'N/A',
        booking.numberOfStudents || 'N/A',
        booking.supervisorName || 'N/A',
        booking.status,
        booking.createdAt.toISOString()
      ].map(field => `"${field}"`).join(','));
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.header('Content-Type', 'text/csv');
      res.attachment('lab-bookings.csv');
      return res.send(csvContent);
    } else {
      // Default to JSON
      res.json(bookings);
    }
  } catch (error) {
    console.error('Lab export error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

module.exports = router;
