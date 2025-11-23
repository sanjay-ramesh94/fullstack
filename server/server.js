const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const videoConferenceRoutes = require('./routes/videoConference');
const conventionCenterRoutes = require('./routes/conventionCenter');
const labRoutes = require('./routes/lab');
const mbaSeminarRoutes = require('./routes/mbaSeminar');
const config = require('./config/config');

// Import email service (only once)
const emailService = require('./services/emailService');

// ✅ middleware order matters
app.use(cors({
  origin: config.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hall_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/video-conference', videoConferenceRoutes);
app.use('/api/convention-center', conventionCenterRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/mba-seminar', mbaSeminarRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});