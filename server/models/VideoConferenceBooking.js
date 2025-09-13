// models/VideoConferenceBooking.js
const mongoose = require('mongoose');

const videoConferenceBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  // Video conference specific fields
  meetingType: {
    type: String,
    enum: ['internal', 'external', 'international'],
    default: 'internal'
  },
  expectedParticipants: {
    type: Number,
    min: 1,
    max: 50,
    required: true
  },
  requiresRecording: {
    type: Boolean,
    default: false
  },
  technicalRequirements: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for date and time conflict checking
videoConferenceBookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('VideoConferenceBooking', videoConferenceBookingSchema);
