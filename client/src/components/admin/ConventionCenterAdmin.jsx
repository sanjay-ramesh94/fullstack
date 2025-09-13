// src/components/admin/ConventionCenterAdmin.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ConventionCenterAdmin = () => {
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
    
    let classes = 'hover:bg-purple-100 ';
    
    if (!isCurrentMonth) {
      classes += 'text-gray-400 ';
    }
    
    if (isSelected) {
      classes += 'bg-purple-600 text-white shadow-lg ';
    } else if (isToday && isBooked) {
      classes += 'bg-amber-200 border-2 border-amber-400 text-amber-800 font-bold ';
    } else if (isToday) {
      classes += 'bg-purple-50 border-2 border-purple-300 text-purple-700 font-semibold ';
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
    fetchBookings();
    fetchStats();
    fetchBookedDates();
  }, [filters]);

  useEffect(() => {
    fetchBookedDates();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchDateEvents();
    }
  }, [selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFilter !== 'all' && { dateFilter: filters.dateFilter })
      });

      const response = await api.get(`/convention-center/admin/bookings?${params}`);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching convention center bookings:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/convention-center/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching convention center stats:', error);
    }
  };

  const fetchBookedDates = async () => {
    setLoadingBookedDates(true);
    try {
      const response = await api.get(`/convention-center/admin/bookings?dateFilter=all&limit=1000`);
      
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
      console.error('Error fetching booked dates:', error);
    }
    setLoadingBookedDates(false);
  };

  const fetchDateEvents = async () => {
    try {
      const dateString = selectedDate instanceof Date ? 
        selectedDate.toISOString().split('T')[0] : 
        selectedDate;
      const response = await api.get(`/convention-center/admin/events/${dateString}`);
      setDateEvents(response.data);
    } catch (error) {
      console.error('Error fetching date events:', error);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/convention-center/${bookingId}/status`, { status: newStatus });
      fetchBookings();
      fetchDateEvents();
      fetchStats();
    } catch (error) {
      console.error('Error updating booking status:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Convention Center Admin</h1>
          <p className="text-gray-600">Manage convention center bookings and view analytics</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Events</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-purple-600 mt-1">Loading booked dates...</p>
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
                        {isDateBooked(date, bookedDates) && !getDateStyles(date, selectedDate, bookedDates).includes('bg-purple-600') && (
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-600 rounded-full shadow-sm"></div>
                        )}
                        
                        {/* Today indicator */}
                        {isDateToday(date) && !getDateStyles(date, selectedDate, bookedDates).includes('bg-purple-600') && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
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
                    <div className="w-4 h-4 bg-purple-600 rounded mr-2 shadow-sm"></div>
                    <span className="text-gray-700">Selected Date</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2 relative">
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Has Bookings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-50 border-2 border-purple-300 rounded mr-2 relative">
                      <div className="absolute top-0 right-0 w-1 h-1 bg-purple-500 rounded-full"></div>
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
                          <div key={event._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                <p className="text-sm text-gray-600">{event.purpose}</p>
                                <p className="text-sm text-gray-500">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.eventType} • {event.expectedAttendees} attendees • {event.seatingArrangement}
                                </p>
                                {event.cateringRequired && (
                                  <p className="text-xs text-purple-600">Catering Required</p>
                                )}
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
                          <div key={event._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                <p className="text-sm text-gray-600">{event.purpose}</p>
                                <p className="text-sm text-gray-500">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.eventType} • {event.expectedAttendees} attendees • {event.seatingArrangement}
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.name}</h4>
                          <p className="text-sm text-gray-600">{booking.user?.name} • {booking.user?.department}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                          <p><strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                        </div>
                        <div>
                          <p><strong>Event Type:</strong> {booking.eventType}</p>
                          <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                          <p><strong>Seating:</strong> {booking.seatingArrangement}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{booking.purpose}</p>
                      
                      {booking.audioVisualNeeds?.length > 0 && (
                        <p className="text-xs text-blue-600 mb-2">
                          AV Needs: {booking.audioVisualNeeds.join(', ')}
                        </p>
                      )}
                      
                      {booking.cateringRequired && (
                        <p className="text-xs text-purple-600 mb-2">Catering Required</p>
                      )}
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
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

export default ConventionCenterAdmin;
