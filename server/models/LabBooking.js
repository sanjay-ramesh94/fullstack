// models/LabBooking.js
const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
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
  // Lab specific fields
  labType: {
    type: String,
    enum: ['computer', 'physics', 'chemistry', 'biology', 'engineering', 'research'],
    required: true
  },
  experimentType: {
    type: String,
    required: true,
    trim: true
  },
  numberOfStudents: {
    type: Number,
    min: 1,
    max: 60,
    required: true
  },
  equipmentNeeded: {
    type: [String],
    default: []
  },
  safetyRequirements: {
    type: String,
    trim: true
  },
  supervisorName: {
    type: String,
    required: true,
    trim: true
  },
  supervisorContact: {
    type: String,
    required: true,
    trim: true
  },
  chemicalsRequired: {
    type: [String],
    default: []
  },
  specialInstructions: {
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
labBookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('LabBooking', labBookingSchema);
