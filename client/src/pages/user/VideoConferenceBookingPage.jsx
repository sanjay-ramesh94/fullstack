// src/pages/user/VideoConferenceBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingCalendar from '../../components/user/BookingCalendar';
import VideoConferenceBookingForm from '../../components/user/VideoConferenceBookingForm';
import { api } from '../../services/api';

const VideoConferenceBookingPage = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookingsForDate = async (date) => {
    setLoadingBookings(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await api.get(`/video-conference/date/${dateStr}`);
      setExistingBookings(response.data);
    } catch (error) {
      console.error('Error fetching video conference bookings:', error);
    }
    setLoadingBookings(false);
  };

  const handleBookingSuccess = () => {
    setBookingComplete(true);
  };

  const handleNewBooking = () => {
    setBookingComplete(false);
    setSelectedDate(null);
    setExistingBookings([]);
  };

  const handleLogout = () => {
    logout();
    navigate('/user');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/user/login" />;
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Logout */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Video Conference Hall Booking</h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex items-center justify-center py-16">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Request Sent!</h2>
              <p className="text-gray-600 mb-6">
                Your Video Conference Hall booking request has been sent to the admin for approval. You will receive an email once your booking is approved.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleNewBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Make Another Booking
                </button>
                <button
                  onClick={() => navigate('/user')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info and Logout */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Book Video Conference Hall</h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user.name || 'User'}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">Select a date and time for your video conference hall booking</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
            <BookingCalendar 
              onDateSelect={setSelectedDate} 
              selectedDate={selectedDate}
              hallType="video-conference"
            />
          </div>

          {/* Booking Details Section */}
          <div className="space-y-6">
            {selectedDate && (
              <>
                {/* Existing Bookings Display */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Video Conference Hall Bookings for {selectedDate.toDateString()}
                  </h3>
                  
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading bookings...</span>
                    </div>
                  ) : existingBookings.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {existingBookings.length} booking{existingBookings.length > 1 ? 's' : ''} scheduled
                        </span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          Time slots unavailable
                        </span>
                      </div>
                      {existingBookings.map(booking => {
                        // Format time for display
                        const formatTime = (time) => {
                          const [hours, minutes] = time.split(':');
                          const hour12 = hours % 12 || 12;
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          return `${hour12}:${minutes} ${ampm}`;
                        };
                        
                        return (
                          <div key={booking._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                <span className="font-semibold text-red-800 text-lg">
                                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                </span>
                              </div>
                              <span className="text-red-600 text-xs font-medium bg-red-200 px-2 py-1 rounded-full">
                                {booking.status || 'Confirmed'}
                              </span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <p className="text-sm font-medium text-red-700">
                                {booking.purpose}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-red-600">
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {booking.expectedParticipants} participants
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {booking.department}
                                </span>
                                {booking.meetingType && (
                                  <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {booking.meetingType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">No bookings for this date</p>
                      <p className="text-gray-500 text-sm">Video Conference Hall is available!</p>
                    </div>
                  )}
                </div>

                {/* Booking Form */}
                <VideoConferenceBookingForm
                  selectedDate={selectedDate}
                  existingBookings={existingBookings}
                  onBookingSuccess={handleBookingSuccess}
                />
              </>
            )}
            
            {!selectedDate && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0L6 7m6 0l6 0m-6 0v6m0-6L12 1m0 6l4 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Date</h3>
                <p className="text-gray-600">Choose an available date from the calendar to proceed with video conference hall booking</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceBookingPage;
