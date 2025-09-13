// controllers/mbaSeminarController.js
const MBASeminarBooking = require('../models/MBASeminarBooking');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Check if time slots conflict
const checkTimeConflict = (start1, end1, start2, end2) => {
  const startTime1 = new Date(`1970-01-01T${start1}`);
  const endTime1 = new Date(`1970-01-01T${end1}`);
  const startTime2 = new Date(`1970-01-01T${start2}`);
  const endTime2 = new Date(`1970-01-01T${end2}`);

  return (startTime1 < endTime2 && startTime2 < endTime1);
};

const createBooking = async (req, res) => {
  try {
    const { 
      name, department, purpose, date, startTime, endTime,
      sessionType, speakerName, speakerDesignation, speakerCompany,
      expectedStudents, semester, subject, presentationRequired, 
      recordingRequired, refreshmentsNeeded, specialArrangements
    } = req.body;

    // Validate required fields
    if (!name || !department || !purpose || !date || !startTime || !endTime || 
        !sessionType || !expectedStudents || !semester || !subject) {
      return res.status(400).json({ 
        message: 'All required fields must be filled',
        required: ['name', 'department', 'purpose', 'date', 'startTime', 'endTime', 
                  'sessionType', 'expectedStudents', 'semester', 'subject']
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for time conflicts in MBA Seminar Hall only
    const existingBookings = await MBASeminarBooking.find({
      date: new Date(date),
      isActive: true
    });

    const hasConflict = existingBookings.some(booking =>
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return res.status(400).json({
        message: 'MBA Seminar Hall is already booked for this time slot'
      });
    }

    // Create the booking
    const booking = new MBASeminarBooking({
      user: req.user.userId || req.user.id,
      name,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      sessionType,
      speakerName,
      speakerDesignation,
      speakerCompany,
      expectedStudents,
      semester,
      subject,
      presentationRequired: presentationRequired || false,
      recordingRequired: recordingRequired || false,
      refreshmentsNeeded: refreshmentsNeeded || false,
      specialArrangements,
      status: 'pending', // Changed from 'confirmed' to 'pending'
      isActive: true
    });

    const savedBooking = await booking.save();

    // Note: Emails will be sent only after admin approval

    // Prepare email data
    const bookingDetails = {
      bookingId: savedBooking._id.toString(),
      userName: name,
      userEmail: user.email,
      userPhone: user.phone || 'Not provided',
      hallName: 'MBA Seminar Hall',
      purpose,
      bookingDate: new Date(date).toLocaleDateString(),
      startTime,
      endTime,
      department,
      sessionType,
      speakerName,
      speakerDesignation,
      speakerCompany,
      expectedStudents,
      semester,
      subject,
      presentationRequired,
      recordingRequired,
      refreshmentsNeeded,
      specialArrangements
    };


    res.status(201).json({
      message: 'MBA Seminar Hall booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('MBA Seminar booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await MBASeminarBooking.find({
      user: req.user.userId || req.user.id,
      isActive: true
    }).sort({ date: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await MBASeminarBooking.find({
      date: new Date(date),
      status: { $in: ['confirmed', 'pending'] },
      isActive: true
    })
    .populate('user', 'name department email')
    .sort({ startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNote } = req.body;

    const booking = await MBASeminarBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    if (adminNote) {
      booking.adminNote = adminNote;
    }
    await booking.save();

    // Send emails only when admin confirms a pending booking
    if (previousStatus === 'pending' && status === 'confirmed') {
      try {
        // Prepare email data
        const bookingDetails = {
          bookingId: booking._id.toString(),
          userName: booking.name,
          userEmail: booking.user.email,
          userPhone: booking.user.phone || 'Not provided',
          hallName: 'MBA Seminar Hall',
          purpose: booking.purpose,
          bookingDate: booking.date.toLocaleDateString(),
          startTime: booking.startTime,
          endTime: booking.endTime,
          department: booking.department,
          seminarType: booking.seminarType,
          expectedParticipants: booking.expectedParticipants,
          presentationNeeds: booking.presentationNeeds,
          refreshmentsRequired: booking.refreshmentsRequired,
          specialArrangements: booking.specialArrangements
        };

        // Send confirmation and notification emails
        await emailService.sendBookingConfirmation(bookingDetails);
        await emailService.sendBookingNotification(bookingDetails);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.json({
      message: 'MBA Seminar booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await MBASeminarBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.isActive = false;
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'MBA Seminar booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAvailableDates = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let dateFilter = {
      status: { $in: ['confirmed', 'pending'] },
      isActive: true
    };
    
    // If year and month are provided, filter by that month
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }
    
    const bookings = await MBASeminarBooking.find(dateFilter).select('date startTime endTime');

  const bookingsByDate = {};
  bookings.forEach(booking => {
    const dateStr = booking.date.toISOString().split('T')[0];
    if (!bookingsByDate[dateStr]) {
      bookingsByDate[dateStr] = [];
    }
    bookingsByDate[dateStr].push({
      startTime: booking.startTime,
      endTime: booking.endTime
    });
  });

  const generateAllTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 16; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        if (hour === 16 && minutes > 30) break;
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  const allTimeSlots = generateAllTimeSlots();
  const fullyBookedDates = [];

  Object.keys(bookingsByDate).forEach(dateStr => {
    const dateBookings = bookingsByDate[dateStr];
    let availableSlots = [...allTimeSlots];

    dateBookings.forEach(booking => {
      availableSlots = availableSlots.filter(slot => {
        const slotEnd = addMinutes(slot, 30);
        return !(slot < booking.endTime && slotEnd > booking.startTime);
      });
    });

    if (availableSlots.length === 0) {
      fullyBookedDates.push(dateStr);
    }
  });

    res.json({ fullyBookedDates });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMinutes = (timeString, minutes) => {
  const [hours, mins] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
};

// Admin-specific functions
const getAllBookingsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const dateFilter = req.query.dateFilter;

    let matchQuery = { isActive: true };
    
    // Exclude cancelled bookings from calendar view unless specifically requested
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      matchQuery.status = status;
    } else {
      // Default: exclude cancelled bookings
      matchQuery.status = { $ne: 'cancelled' };
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
    }

    const [bookingsData, totalCount] = await Promise.all([
      MBASeminarBooking.aggregate([
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
      MBASeminarBooking.countDocuments(matchQuery)
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
      },
      hallType: 'MBA Seminar Hall'
    });
  } catch (error) {
    console.error('Error fetching MBA seminar bookings for admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingsByDateForAdmin = async (req, res) => {
  try {
    const { date } = req.params;
    
    const queryDate = new Date(date + 'T00:00:00.000');
    const startOfDay = new Date(queryDate);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookings = await MBASeminarBooking.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
      status: { $ne: 'cancelled' } // Exclude cancelled bookings from calendar
    })
    .populate('user', 'name department email')
    .sort({ startTime: 1 })
    .lean();

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const completedEvents = [];
    const upcomingEvents = [];

    bookings.forEach(booking => {
      let isCompleted = false;
      
      if (date < todayString) {
        isCompleted = true;
      } else if (date > todayString) {
        isCompleted = false;
      } else {
        const [endHour, endMin] = booking.endTime.split(':').map(Number);
        const [nowHour, nowMin] = currentTime.split(':').map(Number);
        
        const endMinutes = endHour * 60 + endMin;
        const nowMinutes = nowHour * 60 + nowMin;
        
        isCompleted = nowMinutes >= endMinutes;
      }
      
      if (isCompleted) {
        completedEvents.push({ ...booking, eventStatus: 'completed' });
      } else {
        upcomingEvents.push({ ...booking, eventStatus: 'upcoming' });
      }
    });

    res.json({
      completedEvents,
      upcomingEvents,
      totalEvents: bookings.length,
      hallType: 'MBA Seminar Hall',
      metadata: {
        selectedDate: date,
        currentDate: todayString,
        currentTime
      }
    });
  } catch (error) {
    console.error('Error fetching MBA seminar events for admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [todayStats, totalStats, upcomingStats, monthlyStats] = await Promise.all([
      MBASeminarBooking.aggregate([
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
      
      MBASeminarBooking.countDocuments({ isActive: true }),
      
      MBASeminarBooking.countDocuments({
        date: { $gte: todayEnd },
        status: { $in: ['confirmed', 'pending'] },
        isActive: true
      }),
      
      MBASeminarBooking.aggregate([
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
      hallType: 'MBA Seminar Hall',
      metadata: {
        generatedAt: new Date().toISOString(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      }
    });
  } catch (error) {
    console.error('Error fetching MBA seminar dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates,
  // Admin functions
  getAllBookingsForAdmin,
  getBookingsByDateForAdmin,
  getDashboardStats
};
