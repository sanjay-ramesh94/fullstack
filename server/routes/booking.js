// routes/booking.js - FIXED VERSION
const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User'); // Make sure you import User model
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Check if time slots conflict
const checkTimeConflict = (start1, end1, start2, end2) => {
  const startTime1 = new Date(`1970-01-01T${start1}`);
  const endTime1 = new Date(`1970-01-01T${end1}`);
  const startTime2 = new Date(`1970-01-01T${start2}`);
  const endTime2 = new Date(`1970-01-01T${end2}`);

  return (startTime1 < endTime2 && startTime2 < endTime1);
};

// Create booking (MAIN ENDPOINT - FIXED)
router.post('/', auth, async (req, res) => {
  console.log('🎯 === BOOKING ROUTE START ===');
  console.log('📥 Request body:', req.body);
  console.log('👤 User from auth:', req.user);
  
  try {
    const { name, department, purpose, date, startTime, endTime } = req.body;

    console.log('📝 Extracted booking data:', {
      name, department, purpose, date, startTime, endTime, userId: req.user?.userId || req.user?.id
    });

    // Validate required fields
    if (!name || !department || !purpose || !date || !startTime || !endTime) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { name, department, purpose, date, startTime, endTime }
      });
    }

    // Get user details for emails
    console.log('👤 Fetching user details...');
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      console.error('❌ User not found for ID:', req.user.userId || req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', { email: user.email, name: user.name });

    // Check for time conflicts
    console.log('🔍 Checking for time conflicts...');
    const existingBookings = await Booking.find({
      date: new Date(date),
      isActive: true
    });

    const hasConflict = existingBookings.some(booking =>
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      console.log('⚠️ Time conflict found');
      return res.status(400).json({
        message: 'Time slot is already booked'
      });
    }

    console.log('✅ No time conflicts found');

    // Create the booking (matching your Booking model)
    console.log('💾 Creating new booking...');
    const booking = new Booking({
      user: req.user.userId || req.user.id,
      name,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      // New bookings start as pending and require admin approval
      status: 'pending',
      isActive: true
    });

    const savedBooking = await booking.save();
    console.log('✅ Booking saved to database:', savedBooking._id);

    // Prepare email data
    const bookingDetails = {
      bookingId: savedBooking._id.toString(),
      userName: name,
      userEmail: user.email,
      userPhone: user.phone || 'Not provided',
      hallName: 'Conference Hall', // Default hall name
      purpose,
      bookingDate: new Date(date).toLocaleDateString(),
      startTime,
      endTime,
      department
    };

    console.log('📧 Prepared email data:', bookingDetails);

    // Send emails BEFORE sending response
    console.log('📧 Starting email sending process...');
    let emailResults = {
      requestReceivedSent: false,
      notificationSent: false,
      errors: []
    };

    // Send "booking request received" email to user
    try {
      console.log('✉️ Sending booking request received email to user...');
      const requestResult = await emailService.sendBookingRequestReceived(bookingDetails);
      emailResults.requestReceivedSent = true;
      console.log('✅ Booking request received email sent:', requestResult);
    } catch (requestError) {
      console.error('❌ Booking request received email failed:', requestError.message);
      emailResults.errors.push(`Request received: ${requestError.message}`);
    }

    // Send notification email to admin about new booking request
    try {
      console.log('📬 Sending new booking request notification email to admin...');
      const notificationResult = await emailService.sendBookingNotification(bookingDetails);
      emailResults.notificationSent = true;
      console.log('✅ Admin notification sent:', notificationResult);
    } catch (notificationError) {
      console.error('❌ Admin notification failed:', notificationError.message);
      emailResults.errors.push(`Admin notification: ${notificationError.message}`);
    }

    console.log('📧 Email process completed:', emailResults);

    // Return success response (even if emails failed)
    console.log('🎯 === BOOKING ROUTE SUCCESS ===');
    return res.status(201).json({
      message: 'Booking request sent to admin successfully',
      booking: savedBooking,
      emailStatus: emailResults
    });

  } catch (error) {
    console.error('❌ === BOOKING ROUTE ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test route for email functionality
router.get('/test-email', async (req, res) => {
  console.log('🧪 === EMAIL TEST ROUTE START ===');
  
  try {
    console.log('🔧 Testing email configuration...');
    const testResult = await emailService.testEmailConfig();
    
    console.log('✅ Email test successful:', testResult);
    return res.status(200).json({
      message: 'Email test successful',
      result: testResult
    });
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return res.status(500).json({
      message: 'Email test failed',
      error: error.message
    });
  }
});

// Get all bookings (admin)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const bookings = await Booking.find({ isActive: true })
      .populate('user', 'name email department')
      .sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.userId || req.user.id,
      isActive: true
    }).sort({ date: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status (admin) - sends status update email
router.put('/:bookingId/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { bookingId } = req.params;
    const { status, adminNote } = req.body;

    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (adminNote) {
      booking.adminNote = adminNote;
    }
    await booking.save();

    // Send status update email
    try {
      const statusDetails = {
        bookingId: booking._id,
        userName: booking.name,
        userEmail: booking.user.email,
        hallName: 'Conference Hall',
        purpose: booking.purpose,
        bookingDate: booking.date.toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        department: booking.department,
        status,
        adminNote
      };

      await emailService.sendStatusUpdateEmail(statusDetails);
      console.log('✅ Status update email sent');
    } catch (emailError) {
      console.error('❌ Status update email failed:', emailError);
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete booking
router.delete('/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Prepare cancellation details before deleting the document
    const cancellationDetails = {
      bookingId: booking._id,
      userName: booking.name,
      userEmail: booking.user.email,
      hallName: 'Conference Hall',
      purpose: booking.purpose,
      bookingDate: booking.date.toLocaleDateString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      department: booking.department
    };

    // Hard delete the booking from the database
    await booking.deleteOne();

    // Send cancellation emails
    try {
      await emailService.sendCancellationNotification(cancellationDetails);
      await emailService.sendAdminCancellationNotification(cancellationDetails);
      console.log('✅ Cancellation emails sent');
    } catch (emailError) {
      console.error('❌ Cancellation emails failed:', emailError);
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available dates
router.get('/available-dates', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookings = await Booking.find({
      date: { $gte: today },
      status: { $in: ['confirmed', 'pending'] },
      isActive: true
    }).select('date startTime endTime');

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

    const fullyBookedDates = [];
    Object.keys(bookingsByDate).forEach(dateStr => {
      const dayBookings = bookingsByDate[dateStr];
      dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      let totalCoverage = 0;
      let lastEndTime = '09:00';
      
      for (const booking of dayBookings) {
        if (booking.startTime <= lastEndTime) {
          if (booking.endTime > lastEndTime) {
            lastEndTime = booking.endTime;
          }
        }
      }
      
      if (lastEndTime >= '16:30') {
        fullyBookedDates.push(dateStr);
      }
    });

    res.json({
      fullyBookedDates,
      bookingsByDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await Booking.find({
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
});

module.exports = router;