// controllers/labController.js
const LabBooking = require('../models/LabBooking');
const User = require('../models/User');
const emailService = require('../services/emailService');
const PDFDocument = require('pdfkit');

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
      labType, experimentType, numberOfStudents, equipmentNeeded, 
      safetyRequirements, supervisorName, supervisorContact, 
      chemicalsRequired, specialInstructions
    } = req.body;

    // Validate required fields
    if (!name || !department || !purpose || !date || !startTime || !endTime || 
        !labType || !experimentType || !numberOfStudents || !supervisorName || !supervisorContact) {
      return res.status(400).json({ 
        message: 'All required fields must be filled',
        required: ['name', 'department', 'purpose', 'date', 'startTime', 'endTime', 
                  'labType', 'experimentType', 'numberOfStudents', 'supervisorName', 'supervisorContact']
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for time conflicts in Lab only
    const existingBookings = await LabBooking.find({
      date: new Date(date),
      isActive: true
    });

    const hasConflict = existingBookings.some(booking =>
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return res.status(400).json({
        message: 'Lab is already booked for this time slot'
      });
    }

    // Create the booking
    const booking = new LabBooking({
      user: req.user.userId || req.user.id,
      name,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      labType,
      experimentType,
      numberOfStudents,
      equipmentNeeded: equipmentNeeded || [],
      safetyRequirements,
      supervisorName,
      supervisorContact,
      chemicalsRequired: chemicalsRequired || [],
      specialInstructions,
      status: 'pending',
      isActive: true
    });

    const savedBooking = await booking.save();

    // Note: Emails will be sent only after admin approval

    res.status(201).json({
      message: 'Lab booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Lab booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await LabBooking.find({
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
    const bookings = await LabBooking.find({
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

    const booking = await LabBooking.findById(bookingId).populate('user');
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
          hallName: 'Lab',
          purpose: booking.purpose,
          bookingDate: booking.date.toLocaleDateString(),
          startTime: booking.startTime,
          endTime: booking.endTime,
          department: booking.department,
          labType: booking.labType,
          equipmentNeeded: booking.equipmentNeeded,
          safetyRequirements: booking.safetyRequirements,
          specialInstructions: booking.specialInstructions
        };

        // Send confirmation and notification emails
        await emailService.sendBookingConfirmation(bookingDetails);
        await emailService.sendBookingNotification(bookingDetails);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.json({
      message: 'Lab booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await LabBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.isActive = false;
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Lab booking cancelled successfully' });
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
    
    const bookings = await LabBooking.find(dateFilter).select('date startTime endTime');

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

const downloadReport = async (req, res) => {
  try {
    const { dateRange = 'all', status = 'all' } = req.query;
    
    let matchQuery = { isActive: true };
    
    // Apply status filter
    if (status !== 'all') {
      matchQuery.status = status;
    }
    
    // Apply date range filter
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
        matchQuery.date = { $gte: weekStart };
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        matchQuery.date = { $gte: monthStart };
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        matchQuery.date = { $gte: yearStart };
        break;
    }

    const bookings = await LabBooking.find(matchQuery)
      .populate('user', 'name email department phone')
      .sort({ date: -1, startTime: 1 })
      .lean();

    // Calculate summary statistics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    // Set response headers FIRST
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="laboratory-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      bufferPages: true
    });
    
    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF document error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'PDF generation failed' });
      }
    });

    res.on('error', (err) => {
      console.error('Response stream error:', err);
    });
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Times-Bold')
       .text('KONGU ENGINEERING COLLEGE (AUTONOMOUS)', { align: 'center' })
       .text('LABORATORY', { align: 'center' })
       .text('(BOOKING REPORT)', { align: 'center' })
       .moveDown(2);

    // Report generation date
    doc.fontSize(12).font('Times-Roman')
       .text(`Report Generated: ${new Date().toLocaleDateString('en-IN', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`)
       .text(`Date Range: ${dateRange.toUpperCase()}`)
       .text(`Status Filter: ${status.toUpperCase()}`)
       .moveDown(1.5);

    // Summary statistics
    doc.fontSize(16).font('Times-Bold')
       .text('SUMMARY STATISTICS:')
       .moveDown(0.5)
       .fontSize(12).font('Times-Roman')
       .text(`Total Lab Sessions: ${totalBookings}`)
       .text(`Confirmed: ${confirmedBookings}`)
       .text(`Completed: ${completedBookings}`)
       .text(`Pending: ${pendingBookings}`)
       .moveDown(1.5);

    // Booking details header
    doc.fontSize(16).font('Times-Bold')
       .text('LAB SESSION DETAILS:')
       .moveDown(1);

    if (bookings.length === 0) {
      doc.fontSize(12).font('Times-Roman')
         .text('No lab sessions found for the selected criteria.');
    } else {
      // Table headers
      const tableTop = doc.y;
      const tableHeaders = ['Date', 'Time', 'Session', 'Organizer', 'Email', 'Phone', 'Dept', 'Lab Type', 'Experiment', 'Students', 'Status'];
      const columnWidths = [50, 60, 70, 65, 80, 60, 40, 55, 70, 45, 45];
      const margin = 50;
      
      let currentX = margin;

      doc.fontSize(8).font('Times-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
        currentX += columnWidths[i];
      });

      // Draw header line
      doc.moveTo(margin, tableTop + 12)
         .lineTo(margin + columnWidths.reduce((a, b) => a + b, 0), tableTop + 12)
         .stroke();

      let currentY = tableTop + 16;
      doc.fontSize(7).font('Times-Roman');

      // Table rows
      bookings.forEach((booking, index) => {
        const bookingDate = booking.date ? 
          new Date(booking.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          }) : 'N/A';
        const timeStr = `${booking.startTime || 'N/A'}-${booking.endTime || 'N/A'}`;
        const sessionName = booking.name || 'N/A';
        const organizer = booking.user?.name || 'N/A';
        const email = booking.user?.email || '';
        const phone = booking.user?.phone || '';
        const department = booking.user?.department || booking.department || 'N/A';
        const labType = booking.labType || 'N/A';
        const experiment = booking.experimentType || 'N/A';
        const students = booking.numberOfStudents || 'N/A';
        const status = booking.status || 'N/A';

        // Truncate long text
        const safeSessionName = sessionName.length > 10 ? sessionName.substring(0, 10) + '...' : sessionName;
        const safeOrganizer = organizer.length > 9 ? organizer.substring(0, 9) + '...' : organizer;
        const safeEmail = email.length > 11 ? email.substring(0, 11) + '...' : email;
        const safePhone = phone.length > 9 ? phone.substring(0, 9) : phone;
        const safeDept = department.length > 5 ? department.substring(0, 5) + '...' : department;
        const safeLabType = labType.length > 8 ? labType.substring(0, 8) + '...' : labType;
        const safeExperiment = experiment.length > 10 ? experiment.substring(0, 10) + '...' : experiment;

        const rowData = [bookingDate, timeStr, safeSessionName, safeOrganizer, safeEmail, safePhone, safeDept, safeLabType, safeExperiment, students, status];

        // Calculate row height
        const cellHeights = rowData.map((data, i) => {
          const text = (data || '').toString();
          return doc.heightOfString(text, { width: columnWidths[i], align: 'left' });
        });
        const rowHeight = Math.max(...cellHeights, 10) + 2;

        // Start new page if needed
        if (currentY + rowHeight > 750) {
          doc.addPage();
          currentY = 50;

          // Redraw headers on new page
          doc.fontSize(8).font('Times-Bold');
          currentX = margin;
          tableHeaders.forEach((header, i) => {
            doc.text(header, currentX, currentY, { width: columnWidths[i], align: 'left' });
            currentX += columnWidths[i];
          });
          doc.moveTo(margin, currentY + 12)
             .lineTo(margin + columnWidths.reduce((a, b) => a + b, 0), currentY + 12)
             .stroke();
          currentY += 16;
          doc.fontSize(7).font('Times-Roman');
        }

        // Draw row
        currentX = margin;
        rowData.forEach((data, i) => {
          const text = (data || '').toString();
          doc.text(text, currentX, currentY, { width: columnWidths[i], align: 'left' });
          currentX += columnWidths[i];
        });

        currentY += rowHeight;
      });
    }

    // Footer
    doc.fontSize(10).font('Times-Roman')
       .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 50, doc.page.height - 100, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('❌ Error generating laboratory report:', error);
    console.error('Error stack:', error.stack);
    
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Error generating report', 
        error: error.message
      });
    } else {
      // If headers were already sent, we can't send JSON
      // The PDF stream is already started, so we just log the error
      console.error('Cannot send error response - headers already sent');
    }
  }
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
      LabBooking.aggregate([
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
      LabBooking.countDocuments(matchQuery)
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
      hallType: 'Laboratory'
    });
  } catch (error) {
    console.error('Error fetching lab bookings for admin:', error);
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
    
    const bookings = await LabBooking.find({
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
      hallType: 'Laboratory',
      metadata: {
        selectedDate: date,
        currentDate: todayString,
        currentTime
      }
    });
  } catch (error) {
    console.error('Error fetching lab events for admin:', error);
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
      LabBooking.aggregate([
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
      
      LabBooking.countDocuments({ isActive: true }),
      
      LabBooking.countDocuments({
        date: { $gte: todayEnd },
        status: { $in: ['confirmed', 'pending'] },
        isActive: true
      }),
      
      LabBooking.aggregate([
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
      hallType: 'Laboratory',
      metadata: {
        generatedAt: new Date().toISOString(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      }
    });
  } catch (error) {
    console.error('Error fetching lab dashboard stats:', error);
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
  downloadReport,
  // Admin functions
  getAllBookingsForAdmin,
  getBookingsByDateForAdmin,
  getDashboardStats
};
