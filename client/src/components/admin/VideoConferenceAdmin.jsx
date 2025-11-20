// src/components/admin/VideoConferenceAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const VideoConferenceAdmin = () => {
  const { admin, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateEvents, setDateEvents] = useState({ completedEvents: [], upcomingEvents: [] });
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFilter: 'all',
    page: 1
  });

  // Calendar utility functions
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calendar generation
  const generateCalendarData = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarData = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      if (currentDate.getMonth() === monthIndex || 
          (i < 7 && currentDate.getMonth() === monthIndex - 1) ||
          (i >= 35 && currentDate.getMonth() === monthIndex + 1)) {
        calendarData.push(new Date(currentDate));
      } else {
        calendarData.push(null);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendarData;
  };

  const calendarData = generateCalendarData(currentMonth);

  // Date utility functions
  const isDateToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDateBooked = (date, bookedDatesSet) => {
    const dateString = date.toISOString().split('T')[0];
    return bookedDatesSet.has(dateString);
  };

  const getDateStyles = (date, selectedDate, bookedDatesSet) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = isDateToday(date);
    const isBooked = isDateBooked(date, bookedDatesSet);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    
    let classes = 'hover:bg-blue-100 ';
    
    if (!isCurrentMonth) {
      classes += 'text-gray-400 ';
    }
    
    if (isSelected) {
      classes += 'bg-blue-600 text-white shadow-lg ';
    } else if (isToday && isBooked) {
      classes += 'bg-amber-200 border-2 border-amber-400 text-amber-800 font-bold ';
    } else if (isToday) {
      classes += 'bg-blue-50 border-2 border-blue-300 text-blue-700 font-semibold ';
    } else if (isBooked) {
      classes += 'bg-green-100 border border-green-300 text-green-800 ';
    } else {
      classes += 'text-gray-700 ';
    }
    
    return classes;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const updateSelectedDate = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    if (admin) {
      fetchBookings();
      fetchStats();
      fetchBookedDates();
    }
  }, [filters, admin]);

  useEffect(() => {
    if (admin) {
      fetchBookedDates();
    }
  }, [currentMonth, admin]);

  useEffect(() => {
    if (admin && selectedDate) {
      fetchDateEvents();
    }
  }, [selectedDate, admin]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFilter !== 'all' && { dateFilter: filters.dateFilter })
      });

      const response = await api.get(`/video-conference/admin/bookings?${params}`);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching video conference bookings:', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/video-conference/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching video conference stats:', error.response?.data || error.message);
    }
  };

  const fetchBookedDates = async () => {
    setLoadingBookedDates(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await api.get(`/video-conference/admin/bookings?dateFilter=all&limit=1000`);
      
      const bookedDatesSet = new Set();
      if (response.data.bookings) {
        response.data.bookings.forEach(booking => {
          const bookingDate = new Date(booking.date);
          const dateString = bookingDate.toISOString().split('T')[0];
          bookedDatesSet.add(dateString);
        });
      }
      
      setBookedDates(bookedDatesSet);
    } catch (error) {
      console.error('Error fetching booked dates:', error.response?.data || error.message);
    }
    setLoadingBookedDates(false);
  };

  const fetchDateEvents = async () => {
    try {
      const dateString = selectedDate instanceof Date ? 
        selectedDate.toISOString().split('T')[0] : 
        selectedDate;
      const response = await api.get(`/video-conference/admin/events/${dateString}`);
      setDateEvents(response.data);
    } catch (error) {
      console.error('Error fetching date events:', error.response?.data || error.message);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/video-conference/${bookingId}/status`, { status: newStatus });
      fetchBookings();
      fetchDateEvents();
      fetchStats();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      await api.delete(`/video-conference/${bookingId}`);
      fetchBookings();
      fetchDateEvents();
      fetchStats();
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        // Booking already deleted or not found - refresh lists but don't treat as fatal error
        console.warn('Booking already deleted or not found, refreshing view.');
        fetchBookings();
        fetchDateEvents();
        fetchStats();
      } else {
        console.error('Error deleting booking:', error.response?.data || error.message);
      }
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadReport = async (dateRange = 'all', status = 'all') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in as admin to download reports');
        return;
      }
      
      const params = new URLSearchParams({ dateRange, status });
      const url = `/api/video-conference/admin/download-report?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } else {
          throw new Error(`Failed to download report: ${response.status} ${response.statusText}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('pdf')) {
        const text = await response.text();
        console.error('Expected PDF but got:', contentType, text.substring(0, 200));
        throw new Error('Server returned invalid response. Expected PDF file.');
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `video-conference-report-${dateRange}-${currentDate}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      console.log('✅ PDF report downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      alert(`Failed to download report: ${error.message}`);
    }
  };

  // Auth checks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Conference Hall Admin</h1>
            <p className="text-gray-600">Manage video conference hall bookings and view analytics</p>
          </div>

          <button
            onClick={() => handleDownloadReport('all', 'all')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.today.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overall.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overall.upcomingBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.monthly.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loadingBookedDates}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  {loadingBookedDates && (
                    <p className="text-sm text-blue-600 mt-1">Loading booked dates...</p>
                  )}
                </div>
                
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loadingBookedDates}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {calendarData.map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date && (
                      <button
                        onClick={() => updateSelectedDate(date)}
                        className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 relative ${getDateStyles(date, selectedDate, bookedDates)}`}
                        title={
                          isDateBooked(date, bookedDates)
                            ? `${date.getDate()} - Has bookings${isDateToday(date) ? ' (Today)' : ''}`
                            : `${date.getDate()}${isDateToday(date) ? ' (Today)' : ''}`
                        }
                      >
                        <span className="relative z-10">{date.getDate()}</span>
                        
                        {/* Booking indicator dot */}
                        {isDateBooked(date, bookedDates) && !getDateStyles(date, selectedDate, bookedDates).includes('bg-blue-600') && (
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-600 rounded-full shadow-sm"></div>
                        )}
                        
                        {/* Today indicator */}
                        {isDateToday(date) && !getDateStyles(date, selectedDate, bookedDates).includes('bg-blue-600') && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Calendar Legend</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2 shadow-sm"></div>
                    <span className="text-gray-700">Selected Date</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2 relative">
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Has Bookings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded mr-2 relative">
                      <div className="absolute top-0 right-0 w-1 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Today</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-200 border-2 border-amber-400 rounded mr-2"></div>
                    <span className="text-gray-700">Today + Booked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date-specific Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Daily Schedule for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                {isDateBooked(selectedDate, bookedDates) && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Booked Date
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {selectedDate && (
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Upcoming Events ({dateEvents.upcomingEvents?.length || 0})
                    </h3>
                    {dateEvents.upcomingEvents?.length > 0 ? (
                      <div className="space-y-3">
                        {dateEvents.upcomingEvents.map((event) => (
                          <div
                            key={event._id}
                            className={`border rounded-lg p-4 ${
                              (event.status === 'confirmed' || event.status === 'completed')
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                <p className="text-sm text-gray-600">{event.purpose}</p>
                                <p className="text-sm text-gray-500">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.meetingType} • {event.expectedParticipants} participants
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No upcoming events for this date</p>
                    )}
                  </div>

                  {/* Completed Events */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Completed Events ({dateEvents.completedEvents?.length || 0})
                    </h3>
                    {dateEvents.completedEvents?.length > 0 ? (
                      <div className="space-y-3">
                        {dateEvents.completedEvents.map((event) => (
                          <div
                            key={event._id}
                            className={`border rounded-lg p-4 ${
                              (event.status === 'confirmed' || event.status === 'completed')
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                <p className="text-sm text-gray-600">{event.purpose}</p>
                                <p className="text-sm text-gray-500">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.meetingType} • {event.expectedParticipants} participants
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No completed events for this date</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={filters.dateFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFilter: e.target.value, page: 1 }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{booking.name}</h4>
                          <p className="text-base text-gray-600 mt-1">{booking.user?.name} • {booking.user?.department}</p>
                        </div>
                        <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 text-base text-gray-600 mb-4">
                        <div>
                          <p className="mb-2"><strong>Date:</strong> {formatDate(booking.date)}</p>
                          <p><strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                        </div>
                        <div>
                          <p className="mb-2"><strong>Type:</strong> {booking.meetingType}</p>
                          <p><strong>Participants:</strong> {booking.expectedParticipants}</p>
                        </div>
                      </div>
                      
                      <p className="text-base text-gray-700 mb-4">{booking.purpose}</p>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No bookings found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceAdmin;
