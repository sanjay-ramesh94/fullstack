// server/controllers/bookingController.js
const Booking = require('../models/Booking');
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
    const { name, email, phone, department, purpose, date, startTime, endTime, hallName } = req.body;
    
    // Check for time conflicts
    const existingBookings = await Booking.find({
      date: new Date(date),
      status: { $in: ['confirmed', 'pending'] },
      isActive: true
    });

    const hasConflict = existingBookings.some(booking => 
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return res.status(400).json({ 
        message: 'Time slot conflicts with existing booking' 
      });
    }

    const booking = new Booking({
      name,
      email,
      phone,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      hallName: hallName || 'Conference Hall',
      status: 'confirmed' // Auto-confirm bookings
    });

    await booking.save();

    // Send email notifications
    try {
      const bookingDetails = {
        bookingId: booking._id,
        userName: name,
        userEmail: email,
        userPhone: phone,
        hallName: hallName || 'Conference Hall',
        purpose,
        bookingDate: new Date(date).toLocaleDateString(),
        startTime,
        endTime,
        department
      };

      // Send confirmation email to user
      await emailService.sendBookingConfirmation(bookingDetails);
      
      // Send notification email to admin
      await emailService.sendBookingNotification(bookingDetails);
      
      console.log('Booking emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ isActive: true })
      .sort({ date: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const bookings = await Booking.find({
      email: userEmail,
      isActive: true
    }).sort({ date: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNote } = req.body;

    const booking = await Booking.findById(bookingId);
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
        userEmail: booking.email,
        hallName: booking.hallName,
        purpose: booking.purpose,
        bookingDate: booking.date.toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        department: booking.department,
        status,
        adminNote
      };

      await emailService.sendStatusUpdateEmail(statusDetails);
      console.log('Status update email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Soft delete
    booking.isActive = false;
    booking.status = 'cancelled';
    await booking.save();

    // Send cancellation emails
    try {
      const cancellationDetails = {
        bookingId: booking._id,
        userName: booking.name,
        userEmail: booking.email,
        hallName: booking.hallName,
        purpose: booking.purpose,
        bookingDate: booking.date.toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        department: booking.department
      };

      // Send cancellation email to user
      await emailService.sendCancellationNotification(cancellationDetails);
      
      // Send cancellation notification to admin
      await emailService.sendAdminCancellationNotification(cancellationDetails);
      
      console.log('Cancellation emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const testEmail = async (req, res) => {
  try {
    const result = await emailService.testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Email test failed', 
      error: error.message 
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
  testEmail
};