// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar'; // ✅ make sure path is correct

// User pages
import UserHomePage from './pages/user/UserHomePage';
import UserLoginPage from './pages/user/UserLoginPage';
import BookingPage from './pages/user/BookingPage';
import VideoConferenceBookingPage from './pages/user/VideoConferenceBookingPage';
import ConventionCenterBookingPage from './pages/user/ConventionCenterBookingPage';
import LabBookingPage from './pages/user/LabBookingPage';
import MBASeminarBookingPage from './pages/user/MBASeminarBookingPage';

// Admin pages
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHallSelection from './components/admin/AdminHallSelection';
import AdminHallDashboard from './components/admin/AdminHallDashboard';
import AdminAnalytics from './components/admin/AdminAnalytics';
import VideoConferenceAdmin from './components/admin/VideoConferenceAdmin';
import ConventionCenterAdmin from './components/admin/ConventionCenterAdmin';
import LabAdmin from './components/admin/LabAdmin';
import MBASeminarAdmin from './components/admin/MBASeminarAdmin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* ✅ Navbar added globally */}
          <Navbar />

          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Navigate to="/user" />} />
            <Route path="/user" element={<UserHomePage />} />
            <Route path="/user/login" element={<UserLoginPage />} />
            <Route path="/user/booking" element={<BookingPage />} />
            <Route path="/user/video-conference-booking" element={<VideoConferenceBookingPage />} />
            <Route path="/user/convention-center-booking" element={<ConventionCenterBookingPage />} />
            <Route path="/user/lab-booking" element={<LabBookingPage />} />
            <Route path="/user/mba-seminar-booking" element={<MBASeminarBookingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminHallSelection />} />
            <Route path="/admin/dashboard/:hallId" element={<AdminHallDashboard />} />
            <Route path="/admin/video-conference" element={<VideoConferenceAdmin />} />
            <Route path="/admin/convention-center" element={<ConventionCenterAdmin />} />
            <Route path="/admin/lab" element={<LabAdmin />} />
            <Route path="/admin/mba-seminar" element={<MBASeminarAdmin />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
