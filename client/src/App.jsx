// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar'; // ✅ make sure path is correct

// User pages
import UserHomePage from './pages/user/UserHomePage';
import UserLoginPage from './pages/user/UserLoginPage';
import BookingPage from './pages/user/BookingPage';

// Admin pages
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
