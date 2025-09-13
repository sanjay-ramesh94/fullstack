// controllers/conventionCenterController.js
const ConventionCenterBooking = require('../models/ConventionCenterBooking');
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

const createConventionCenterBooking = async (req, res) => {
  try {
    const { 
      name, department, purpose, date, startTime, endTime,
      eventType, expectedAttendees, seatingArrangement, audioVisualNeeds, 
      cateringRequired, specialRequirements
    } = req.body;

    // Validate required fields
    if (!name || !department || !purpose || !date || !startTime || !endTime || !eventType || !expectedAttendees) {
      return res.status(400).json({ 
        message: 'All required fields must be filled',
        required: ['name', 'department', 'purpose', 'date', 'startTime', 'endTime', 'eventType', 'expectedAttendees']
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for time conflicts in Convention Center only
    const existingBookings = await ConventionCenterBooking.find({
      date: new Date(date),
      isActive: true
    });

    const hasConflict = existingBookings.some(booking =>
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return res.status(400).json({
        message: 'Convention Center is already booked for this time slot'
      });
    }

    // Create the booking
    const booking = new ConventionCenterBooking({
      user: req.user.userId || req.user.id,
      name,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      eventType,
      expectedAttendees,
      seatingArrangement: seatingArrangement || 'theater',
      audioVisualNeeds: audioVisualNeeds || [],
      cateringRequired: cateringRequired || false,
      specialRequirements,
      status: 'confirmed',
      isActive: true
    });

    const savedBooking = await booking.save();

    // Prepare email data
    const bookingDetails = {
      bookingId: savedBooking._id.toString(),
      userName: name,
      userEmail: user.email,
      userPhone: user.phone || 'Not provided',
      hallName: 'Convention Center',
      purpose,
      bookingDate: new Date(date).toLocaleDateString(),
      startTime,
      endTime,
      department,
      eventType,
      expectedAttendees,
      seatingArrangement,
      audioVisualNeeds,
      cateringRequired,
      specialRequirements
    };

    // Send emails
    try {
      await emailService.sendBookingConfirmation(bookingDetails);
      await emailService.sendBookingNotification(bookingDetails);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      message: 'Convention Center booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Convention Center booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllConventionCenterBookings = async (req, res) => {
  try {
    const bookings = await ConventionCenterBooking.find({ isActive: true })
      .populate('user', 'name email department')
      .sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserConventionCenterBookings = async (req, res) => {
  try {
    const bookings = await ConventionCenterBooking.find({
      user: req.user.userId || req.user.id,
      isActive: true
    }).sort({ date: -1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getConventionCenterBookingsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await ConventionCenterBooking.find({
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

const updateConventionCenterBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNote } = req.body;

    const booking = await ConventionCenterBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (adminNote) {
      booking.adminNote = adminNote;
    }
    await booking.save();

    res.json({
      message: 'Convention Center booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteConventionCenterBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await ConventionCenterBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.isActive = false;
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Convention Center booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createConventionCenterBooking,
  getAllConventionCenterBookings,
  getUserConventionCenterBookings,
  getConventionCenterBookingsForDate,
  updateConventionCenterBookingStatus,
  deleteConventionCenterBooking
};
