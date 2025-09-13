// controllers/videoConferenceController.js
const VideoConferenceBooking = require('../models/VideoConferenceBooking');
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
      meetingType, expectedParticipants, requiresRecording, technicalRequirements
    } = req.body;

    // Validate required fields
    if (!name || !department || !purpose || !date || !startTime || !endTime || !expectedParticipants) {
      return res.status(400).json({ 
        message: 'All required fields must be filled',
        required: ['name', 'department', 'purpose', 'date', 'startTime', 'endTime', 'expectedParticipants']
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for time conflicts in Video Conference Hall only
    const existingBookings = await VideoConferenceBooking.find({
      date: new Date(date),
      isActive: true
    });

    const hasConflict = existingBookings.some(booking =>
      checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return res.status(400).json({
        message: 'Video Conference Hall is already booked for this time slot'
      });
    }

    // Create the booking
    const booking = new VideoConferenceBooking({
      user: req.user.userId || req.user.id,
      name,
      department,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      meetingType: meetingType || 'internal',
      expectedParticipants,
      requiresRecording: requiresRecording || false,
      technicalRequirements,
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
      hallName: 'Video Conference Hall',
      purpose,
      bookingDate: new Date(date).toLocaleDateString(),
      startTime,
      endTime,
      department,
      meetingType,
      expectedParticipants,
      requiresRecording,
      technicalRequirements
    };

    // Send emails
    try {
      await emailService.sendBookingConfirmation(bookingDetails);
      await emailService.sendBookingNotification(bookingDetails);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      message: 'Video Conference Hall booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Video Conference booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await VideoConferenceBooking.find({
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

const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await VideoConferenceBooking.find({
      user: req.user.userId || req.user.id,
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

    const booking = await VideoConferenceBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (adminNote) {
      booking.adminNote = adminNote;
    }
    await booking.save();

    res.json({
      message: 'Video Conference booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await VideoConferenceBooking.findById(bookingId).populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.isActive = false;
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Video Conference booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available dates (dates that are not fully booked)
const getAvailableDates = async (req, res) => {
  try {
    // Get all dates with bookings
    const bookings = await VideoConferenceBooking.find({
      status: { $in: ['confirmed', 'pending'] },
      isActive: true
    }).select('date startTime endTime');

    // Group bookings by date
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

    // Generate all possible time slots (9:00 AM to 4:30 PM, 30-minute intervals)
    const generateAllTimeSlots = () => {
      const slots = [];
      for (let hour = 9; hour <= 16; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          if (hour === 16 && minutes > 30) break; // Stop at 4:30 PM
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          slots.push(timeSlot);
        }
      }
      return slots;
    };

    const allTimeSlots = generateAllTimeSlots();
    const fullyBookedDates = [];

    // Check each date to see if it's fully booked
    Object.keys(bookingsByDate).forEach(dateStr => {
      const dateBookings = bookingsByDate[dateStr];
      let availableSlots = [...allTimeSlots];

      // Remove booked time slots
      dateBookings.forEach(booking => {
        availableSlots = availableSlots.filter(slot => {
          // Check if this slot conflicts with the booking
          const slotEnd = addMinutes(slot, 30);
          return !(slot < booking.endTime && slotEnd > booking.startTime);
        });
      });

      // If no slots are available, mark date as fully booked
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

// Helper function to add minutes to a time string
const addMinutes = (timeString, minutes) => {
  const [hours, mins] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
};

module.exports = {
  createBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBookingStatus,
  deleteBooking,
  getAvailableDates
};
