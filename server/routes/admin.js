// FIXED Admin Routes with Corrected Date Logic
// routes/admin.js
const express = require('express');
const Booking = require('../models/Booking');
const ConventionCenterBooking = require('../models/ConventionCenterBooking');
const LabBooking = require('../models/LabBooking');
const MBASeminarBooking = require('../models/MBASeminarBooking');
const VideoConferenceBooking = require('../models/VideoConferenceBooking');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Helper function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to compare time strings (HH:MM format)
const compareTime = (time1, time2) => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  return totalMinutes1 - totalMinutes2;
};

// Helper function to get date string in YYYY-MM-DD format (UTC normalized)
const getDateString = (date) => {
  const d = new Date(date);
  return d.getFullYear() + '-' + 
         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
         String(d.getDate()).padStart(2, '0');
};

// FIXED: Get events for a specific date
// BULLETPROOF FIX - Replace your /events/:date route with this
router.get('/events/:date', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { date } = req.params; // This should be "2025-08-23"
    
    // Get current date as YYYY-MM-DD string (no timezone issues)
    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log('=== BULLETPROOF DEBUG ===');
    console.log('Requested date:', date);
    console.log('Today string:', todayString);
    console.log('Current time:', currentTime);
    
    // Create start and end of requested date for DB query
    const queryDate = new Date(date + 'T00:00:00.000');
    const startOfDay = new Date(queryDate);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Fetch bookings
    const bookings = await Booking.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'completed'] },
      isActive: true
    })
    .populate('user', 'name department email')
    .sort({ startTime: 1 })
    .lean();

    console.log('Found bookings:', bookings.length);
    
    const completedEvents = [];
    const upcomingEvents = [];

    bookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1}: ${booking.name} ---`);
      console.log('Start time:', booking.startTime);
      console.log('End time:', booking.endTime);
      
      let isCompleted = false;
      
      // SUPER SIMPLE comparison using string comparison
      if (date < todayString) {
        // Past date
        isCompleted = true;
        console.log('Decision: PAST DATE -> Completed');
      } else if (date > todayString) {
        // Future date
        isCompleted = false;
        console.log('Decision: FUTURE DATE -> Upcoming');
      } else {
        // Today - check if end time has passed
        const [endHour, endMin] = booking.endTime.split(':').map(Number);
        const [nowHour, nowMin] = currentTime.split(':').map(Number);
        
        const endMinutes = endHour * 60 + endMin;
        const nowMinutes = nowHour * 60 + nowMin;
        
        isCompleted = nowMinutes >= endMinutes;
        console.log(`Decision: TODAY -> End: ${endMinutes}min, Now: ${nowMinutes}min -> ${isCompleted ? 'Completed' : 'Upcoming'}`);
      }
      
      if (isCompleted) {
        completedEvents.push({ ...booking, eventStatus: 'completed' });
      } else {
        upcomingEvents.push({ ...booking, eventStatus: 'upcoming' });
      }
    });

    console.log('\n=== FINAL RESULTS ===');
    console.log('Completed events:', completedEvents.length);
    console.log('Upcoming events:', upcomingEvents.length);
    console.log('========================');

    res.json({
      completedEvents,
      upcomingEvents,
      totalEvents: bookings.length,
      metadata: {
        selectedDate: date,
        currentDate: todayString,
        currentTime
      }
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get booked dates for a date range (for calendar highlighting)
router.get('/booked-dates', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Create proper date range
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Aggregate bookings to get unique dates with booking counts
    const bookedDatesData = await Booking.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end
          },
          status: { $in: ['confirmed', 'completed'] },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          bookingCount: { $sum: 1 },
          events: {
            $push: {
              startTime: '$startTime',
              endTime: '$endTime',
              name: '$name',
              purpose: '$purpose'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Extract just the dates for highlighting
    const bookedDates = bookedDatesData.map(item => item._id);
    
    // Prepare detailed data for potential future use
    const bookedDatesDetails = bookedDatesData.reduce((acc, item) => {
      acc[item._id] = {
        count: item.bookingCount,
        events: item.events
      };
      return acc;
    }, {});

    res.json({
      bookedDates,
      bookedDatesDetails,
      dateRange: { startDate, endDate },
      totalBookedDays: bookedDates.length
    });
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all bookings with pagination and filtering
router.get('/all-bookings', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const dateFilter = req.query.dateFilter;

    let matchQuery = { isActive: true };
    
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      matchQuery.status = status;
    } else {
      matchQuery.status = { $in: ['confirmed', 'completed'] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (dateFilter) {
      case 'today':
        matchQuery.date = { $gte: today, $lt: tomorrow };
        break;
      case 'upcoming':
        matchQuery.date = { $gte: tomorrow };
        break;
      case 'past':
        matchQuery.date = { $lt: today };
        break;
      default:
        break;
    }

    const [bookingsData, totalCount] = await Promise.all([
      Booking.aggregate([
        { $match: matchQuery },
        { $sort: { date: -1, startTime: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [{ $project: { name: 1, department: 1, email: 1 } }]
          }
        },
        { $unwind: '$user' }
      ]),
      Booking.countDocuments(matchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      bookings: bookingsData,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      },
      filters: {
        status: status || 'all',
        dateFilter: dateFilter || 'all'
      }
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status
router.patch('/booking/:id/status', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name department email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Send status update email to user
    try {
      const statusDetails = {
        bookingId: booking._id,
        userName: booking.name || (booking.user && booking.user.name),
        userEmail: booking.user.email,
        hallName: booking.hallName || 'Conference Hall',
        purpose: booking.purpose,
        bookingDate: booking.date.toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        department: booking.department || (booking.user && booking.user.department),
        status,
        adminNote: undefined
      };

      await emailService.sendStatusUpdateEmail(statusDetails);
      console.log('✅ Status update email sent from admin route');
    } catch (emailError) {
      console.error('❌ Status update email failed in admin route:', emailError);
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [todayStats, totalStats, upcomingStats, monthlyStats] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            date: { $gte: todayStart, $lt: todayEnd },
            status: { $in: ['confirmed', 'completed'] },
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        }
      ]),
      
      Booking.countDocuments({ isActive: true }),
      
      Booking.countDocuments({
        date: { $gte: todayEnd },
        status: { $in: ['confirmed', 'pending'] },
        isActive: true
      }),
      
      Booking.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(today.getFullYear(), today.getMonth(), 1),
              $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
            },
            isActive: true
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const todayData = todayStats[0] || { total: 0, confirmed: 0, completed: 0 };
    const monthlyData = monthlyStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      today: {
        total: todayData.total,
        confirmed: todayData.confirmed,
        completed: todayData.completed
      },
      overall: {
        totalBookings: totalStats,
        upcomingBookings: upcomingStats,
        completedBookings: totalStats - upcomingStats - todayData.total
      },
      monthly: {
        confirmed: monthlyData.confirmed || 0,
        completed: monthlyData.completed || 0,
        pending: monthlyData.pending || 0,
        cancelled: monthlyData.cancelled || 0,
        total: Object.values(monthlyData).reduce((sum, count) => sum + count, 0)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get aggregated booking analytics across all halls
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;

    let start = null;
    let end = null;

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const baseMatch = { isActive: true, status: { $ne: 'cancelled' } };
    const dateFilter = start && end ? { date: { $gte: start, $lte: end } } : {};
    const matchQuery = { ...baseMatch, ...dateFilter };

    const monthlyPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          bookings: { $sum: 1 }
        }
      }
    ];

    const [
      vcCount,
      ccCount,
      labCount,
      mbaCount,
      vcDates,
      ccDates,
      labDates,
      mbaDates,
      vcMonthly,
      ccMonthly,
      labMonthly,
      mbaMonthly
    ] = await Promise.all([
      VideoConferenceBooking.countDocuments(matchQuery),
      ConventionCenterBooking.countDocuments(matchQuery),
      LabBooking.countDocuments(matchQuery),
      MBASeminarBooking.countDocuments(matchQuery),
      VideoConferenceBooking.distinct('date', matchQuery),
      ConventionCenterBooking.distinct('date', matchQuery),
      LabBooking.distinct('date', matchQuery),
      MBASeminarBooking.distinct('date', matchQuery),
      VideoConferenceBooking.aggregate(monthlyPipeline),
      ConventionCenterBooking.aggregate(monthlyPipeline),
      LabBooking.aggregate(monthlyPipeline),
      MBASeminarBooking.aggregate(monthlyPipeline)
    ]);

    const totalBookings = vcCount + ccCount + labCount + mbaCount;

    const getDistinctDayCount = (dates) => {
      const set = new Set(
        dates.map((d) => new Date(d).toISOString().split('T')[0])
      );
      return set.size;
    };

    let totalDays = null;
    if (start && end) {
      totalDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
    }

    const computeUtilization = (dates) => {
      if (!totalDays) return 0;
      const distinctCount = getDistinctDayCount(dates);
      return Math.round((distinctCount / totalDays) * 100);
    };

    const hallStats = [
      {
        name: 'Video Conferencing Hall',
        bookings: vcCount,
        utilization: computeUtilization(vcDates),
        color: '#302b5b'
      },
      {
        name: 'Convention Center',
        bookings: ccCount,
        utilization: computeUtilization(ccDates),
        color: '#4a4570'
      },
      {
        name: 'Lab',
        bookings: labCount,
        utilization: computeUtilization(labDates),
        color: '#605785'
      },
      {
        name: 'MBA Seminar Hall',
        bookings: mbaCount,
        utilization: computeUtilization(mbaDates),
        color: '#76699a'
      }
    ];

    const activeHalls = hallStats.filter((hall) => hall.bookings > 0).length || 4;

    const utilizationRate =
      hallStats.length > 0
        ? Math.round(
            hallStats.reduce((sum, hall) => sum + hall.utilization, 0) /
              hallStats.length
          )
        : 0;

    const monthlyMap = new Map();

    const mergeMonthly = (docs) => {
      docs.forEach((doc) => {
        const year = doc._id.year;
        const month = doc._id.month;
        const key = `${year}-${month}`;
        const current = monthlyMap.get(key) || 0;
        monthlyMap.set(key, current + doc.bookings);
      });
    };

    mergeMonthly(vcMonthly);
    mergeMonthly(ccMonthly);
    mergeMonthly(labMonthly);
    mergeMonthly(mbaMonthly);

    const monthlyTrends = Array.from(monthlyMap.entries())
      .sort((a, b) => {
        const [yearA, monthA] = a[0].split('-').map(Number);
        const [yearB, monthB] = b[0].split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      })
      .map(([key, bookings]) => {
        const [year, month] = key.split('-').map(Number);
        const label = new Date(year, month - 1, 1).toLocaleString('en-US', {
          month: 'short'
        });
        return {
          month: label,
          bookings,
          growth: 0,
          events: bookings
        };
      });

    res.json({
      totalBookings,
      activeHalls,
      utilizationRate,
      hallStats,
      monthlyTrends,
      weeklyPatterns: []
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete/Cancel booking (admin) - HARD DELETE with cancellation emails
router.delete('/booking/:id', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Find booking first so we can use its details for emails
    const booking = await Booking.findById(id).populate('user', 'name department email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const cancellationDetails = {
      bookingId: booking._id,
      userName: booking.name || (booking.user && booking.user.name),
      userEmail: booking.user && booking.user.email,
      hallName: booking.hallName || 'Conference Hall',
      purpose: booking.purpose,
      bookingDate: booking.date.toLocaleDateString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      department: booking.department || (booking.user && booking.user.department),
      cancellationReason: reason
    };

    // Hard delete the booking document
    await booking.deleteOne();

    // Send cancellation emails (user + admin), but don't block response on failures
    try {
      await emailService.sendCancellationNotification(cancellationDetails);
      await emailService.sendAdminCancellationNotification(cancellationDetails);
      console.log('✅ Cancellation emails sent from admin route');
    } catch (emailError) {
      console.error('❌ Cancellation emails failed in admin route:', emailError);
    }

    res.json({
      message: 'Booking cancelled and removed successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking details by ID
router.get('/booking/:id', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('user', 'name department email')
      .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const currentTime = getCurrentTime();
    const today = new Date();
    const bookingDate = new Date(booking.date);
    
    const todayDateString = getDateString(today);
    const bookingDateString = getDateString(bookingDate);

    let eventStatus = 'upcoming';
    if (bookingDateString < todayDateString) {
      eventStatus = 'completed';
    } else if (bookingDateString === todayDateString) {
      eventStatus = compareTime(booking.endTime, currentTime) <= 0 ? 'completed' : 'upcoming';
    }

    res.json({
      ...booking,
      eventStatus,
      metadata: {
        currentDate: todayDateString,
        currentTime
      }
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics-export', auth, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { format = 'csv', startDate, endDate, status = 'all' } = req.query;

    if (format !== 'csv') {
      return res.status(400).json({ message: 'Only CSV format is supported for analytics export' });
    }

    let matchQuery = { isActive: true, status: { $ne: 'cancelled' } };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchQuery.date = { $gte: start, $lte: end };
    }

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    const [
      vcBookings,
      ccBookings,
      labBookings,
      mbaBookings
    ] = await Promise.all([
      VideoConferenceBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      ConventionCenterBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      LabBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      MBASeminarBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean()
    ]);

    const allBookings = [
      ...vcBookings.map((booking) => ({ ...booking, __hallName: 'Video Conference Hall' })),
      ...ccBookings.map((booking) => ({ ...booking, __hallName: 'Convention Center' })),
      ...labBookings.map((booking) => ({ ...booking, __hallName: 'Lab' })),
      ...mbaBookings.map((booking) => ({ ...booking, __hallName: 'MBA Seminar Hall' }))
    ];

    const csvHeaders = [
      'ID',
      'Name',
      'Department',
      'Email',
      'Phone',
      'Date',
      'Start Time',
      'End Time',
      'Hall',
      'Purpose',
      'Status',
      'Created At'
    ].join(',');

    const csvRows = allBookings.map((booking) => [
      booking._id,
      booking.user?.name || booking.name || 'N/A',
      booking.user?.department || booking.department || 'N/A',
      booking.user?.email || 'N/A',
      booking.user?.phone || 'N/A',
      new Date(booking.date).toISOString().split('T')[0],
      booking.startTime,
      booking.endTime,
      booking.__hallName,
      booking.purpose,
      booking.status,
      booking.createdAt ? booking.createdAt.toISOString() : ''
    ]
      .map((field) => `"${field}"`)
      .join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('analytics-bookings-export.csv');
    return res.send(csvContent);
  } catch (error) {
    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    // Apply date range filter if no specific dates provided
    if (!startDate && !endDate && dateRange && dateRange !== 'all') {
      const today = new Date();
      switch (dateRange) {
        case 'today': {
          const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          matchQuery.date = { $gte: todayStart, $lt: todayEnd };
          break;
        }
        case 'week': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          matchQuery.date = { $gte: weekStart, $lt: weekEnd };
          break;
        }
        case 'month': {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          matchQuery.date = { $gte: monthStart, $lt: monthEnd };
          break;
        }
        case 'year': {
          const yearStart = new Date(today.getFullYear(), 0, 1);
          const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
          matchQuery.date = { $gte: yearStart, $lt: yearEnd };
          break;
        }
        default:
          break;
      }
    }

    // Fetch bookings from generic and hall-specific collections
    const [
      genericBookings,
      vcBookings,
      ccBookings,
      labBookings,
      mbaBookings
    ] = await Promise.all([
      Booking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      VideoConferenceBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      ConventionCenterBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      LabBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean(),
      MBASeminarBooking.find(matchQuery)
        .populate('user', 'name department email phone')
        .sort({ date: 1, startTime: 1 })
        .lean()
    ]);

    const allBookings = [
      ...genericBookings.map((booking) => ({
        ...booking,
        __hallName: booking.hallName || 'General Hall'
      })),
      ...vcBookings.map((booking) => ({
        ...booking,
        __hallName: 'Video Conference Hall'
      })),
      ...ccBookings.map((booking) => ({
        ...booking,
        __hallName: 'Convention Center'
      })),
      ...labBookings.map((booking) => ({
        ...booking,
        __hallName: 'Lab'
      })),
      ...mbaBookings.map((booking) => ({
        ...booking,
        __hallName: 'MBA Seminar Hall'
      }))
    ];

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Name',
        'Department',
        'Email',
        'Phone',
        'Date',
        'Start Time',
        'End Time',
        'Hall',
        'Purpose',
        'Status',
        'Created At'
      ].join(',');

      const csvRows = allBookings.map((booking) => [
        booking._id,
        booking.user?.name || booking.name || 'N/A',
        booking.user?.department || booking.department || 'N/A',
        booking.user?.email || 'N/A',
        booking.user?.phone || 'N/A',
        new Date(booking.date).toISOString().split('T')[0],
        booking.startTime,
        booking.endTime,
        booking.__hallName,
        booking.purpose,
        booking.status,
        booking.createdAt ? booking.createdAt.toISOString() : ''
      ]
        .map((field) => `"${field}"`)
        .join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment('bookings-export.csv');
      return res.send(csvContent);
    } else if (format === 'xlsx') {
      // For Excel export, we'll need to install xlsx package
      // For now, return JSON with instructions
      return res.status(501).json({
        message:
          'Excel export not implemented yet. Please install xlsx package and implement.'
      });
    } else {
      // Default to JSON
      res.json(allBookings);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

module.exports = router;