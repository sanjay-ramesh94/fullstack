// models/ConventionCenterBooking.js
const mongoose = require('mongoose');

const conventionCenterBookingSchema = new mongoose.Schema({
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
  // Convention center specific fields
  eventType: {
    type: String,
    enum: ['conference', 'seminar', 'workshop', 'cultural', 'academic', 'corporate'],
    required: true
  },
  expectedAttendees: {
    type: Number,
    min: 1,
    max: 500,
    required: true
  },
  seatingArrangement: {
    type: String,
    enum: ['theater', 'classroom', 'u-shape', 'boardroom', 'banquet'],
    default: 'theater'
  },
  audioVisualNeeds: {
    type: [String],
    enum: ['projector', 'microphone', 'speakers', 'lighting', 'stage'],
    default: []
  },
  cateringRequired: {
    type: Boolean,
    default: false
  },
  specialRequirements: {
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
conventionCenterBookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('ConventionCenterBooking', conventionCenterBookingSchema);
