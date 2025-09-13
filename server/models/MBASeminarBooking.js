// models/MBASeminarBooking.js
const mongoose = require('mongoose');

const mbaSeminarBookingSchema = new mongoose.Schema({
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
  // MBA Seminar specific fields
  sessionType: {
    type: String,
    enum: ['guest-lecture', 'case-study', 'presentation', 'group-discussion', 'workshop', 'exam'],
    required: true
  },
  speakerName: {
    type: String,
    trim: true
  },
  speakerDesignation: {
    type: String,
    trim: true
  },
  speakerCompany: {
    type: String,
    trim: true
  },
  expectedStudents: {
    type: Number,
    min: 1,
    max: 100,
    required: true
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  presentationRequired: {
    type: Boolean,
    default: false
  },
  recordingRequired: {
    type: Boolean,
    default: false
  },
  refreshmentsNeeded: {
    type: Boolean,
    default: false
  },
  specialArrangements: {
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
mbaSeminarBookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('MBASeminarBooking', mbaSeminarBookingSchema);
