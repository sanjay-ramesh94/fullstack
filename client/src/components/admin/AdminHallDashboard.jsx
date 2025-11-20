// Hall-specific Admin Dashboard Component
// src/components/admin/AdminHallDashboard.jsx
import React from 'react';
import { Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard, useCalendarUtils } from '../../hooks/useAdminDashboard';

const AdminHallDashboard = () => {
  const { hallId } = useParams();
  const location = useLocation();
  const { admin, loading: authLoading } = useAuth();
  const hallName = location.state?.hallName || hallId;

  const {
    selectedDate,
    events,
    bookedDates,
    currentMonth,
    isLoading,
    loadingEvents,
    loadingBookedDates,
    error,
    totalEvents,
    hasEventsForSelectedDate,
    updateSelectedDate,
    navigateMonth,
    refreshData,
    clearError
  } = useAdminDashboard();

  const {
    monthNames,
    dayNames,
    calendarData,
    getDateStyles,
    isDateBooked,
    isDateToday
  } = useCalendarUtils(currentMonth);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin';
  };

  const handleDownloadReport = async (dateRange = 'all', status = 'all') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in as admin to download reports');
        return;
      }
      
      const hallTypeMap = {
        'Convention Center': 'convention-center',
        'MBA Seminar Hall': 'mba-seminar',
        'Laboratory': 'lab',
        'Video Conferencing Hall': 'video-conference'
      };
      
      const endpoint = hallId || hallTypeMap[hallName] || 'convention-center';
      const params = new URLSearchParams({ dateRange, status });
      const url = `/api/${endpoint}/admin/download-report?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to parse error as JSON first
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } else {
          throw new Error(`Failed to download report: ${response.status} ${response.statusText}`);
        }
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('pdf')) {
        const text = await response.text();
        console.error('Expected PDF but got:', contentType, text.substring(0, 200));
        throw new Error('Server returned invalid response. Expected PDF file.');
      }

      // Get the PDF content as blob
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Set filename with current date and hall name
      const currentDate = new Date().toISOString().split('T')[0];
      const hallNameForFile = hallName.toLowerCase().replace(/\s+/g, '-');
      link.download = `${hallNameForFile}-report-${dateRange}-${currentDate}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
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


  // Early returns
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link 
                to="/admin/dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Hall Selection"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{hallName}</h1>
                <p className="text-sm text-gray-600">Booking Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                  <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </div>
              )}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {/* Download Report Button */}
              <button
                onClick={() => handleDownloadReport('all', 'all')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow p-6 max-w-xs">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-800">{bookedDates.size}</p>
                <p className="text-gray-600">Booked Days This Month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar Section - Same as original but with hall context */}
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

          {/* Events Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {hallName} Events for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                {isDateBooked(selectedDate, bookedDates) && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Booked Date
                  </div>
                )}
              </div>

              {loadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading events...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div>
                    <h4 className="text-lg font-medium text-green-700 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Upcoming Events ({events.upcomingEvents.length})
                    </h4>
                    
                    {events.upcomingEvents.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {events.upcomingEvents.map(event => (
                          <EventCard 
                            key={event._id} 
                            event={event} 
                            type="upcoming"
                            selectedDate={selectedDate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">No upcoming events</p>
                        <p className="text-sm">No scheduled events for this date</p>
                      </div>
                    )}
                  </div>

                  {/* Completed Events */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Completed Events ({events.completedEvents.length})
                    </h4>
                    
                    {events.completedEvents.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {events.completedEvents.map(event => (
                          <EventCard 
                            key={event._id} 
                            event={event} 
                            type="completed"
                            selectedDate={selectedDate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">No completed events</p>
                        <p className="text-sm">No completed events for this date</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Summary for {selectedDate.toLocaleDateString()}
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {events.upcomingEvents.length}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Upcoming Events</div>
                  {events.upcomingEvents.length > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Next: {events.upcomingEvents[0]?.startTime}
                    </div>
                  )}
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    {events.completedEvents.length}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">Completed Events</div>
                  {events.completedEvents.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Last: {events.completedEvents[0]?.endTime}
                    </div>
                  )}
                </div>
              </div>
              
              {hasEventsForSelectedDate ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                      <span className="text-2xl font-bold text-blue-600">{totalEvents}</span>
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Total Events</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isDateBooked(selectedDate, bookedDates) ? 'Active booking day' : 'Events scheduled'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 text-center">
                  <div className="text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No events scheduled</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isDateBooked(selectedDate, bookedDates) ? 'Date is marked as booked' : 'Free day'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Card Component (reused from original)
const EventCard = React.memo(({ event, type, selectedDate }) => {
  const isUpcoming = type === 'upcoming';
  
  const getTimeStatus = () => {
    const now = new Date();
    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    
    const eventDateTime = new Date(selectedDate);
    eventDateTime.setHours(startHours, startMinutes, 0, 0);
    
    if (isUpcoming) {
      const timeDiff = eventDateTime.getTime() - now.getTime();
      const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (timeDiff > 0) {
        if (hoursLeft > 0) {
          return `Starts in ${hoursLeft}h ${minutesLeft}m`;
        } else if (minutesLeft > 0) {
          return `Starts in ${minutesLeft}m`;
        } else {
          return 'Starting now';
        }
      } else {
        const [endHours, endMinutes] = event.endTime.split(':').map(Number);
        const eventEndTime = new Date(selectedDate);
        eventEndTime.setHours(endHours, endMinutes, 0, 0);
        
        if (now.getTime() < eventEndTime.getTime()) {
          return 'In progress';
        } else {
          return 'Started';
        }
      }
    }
    return null;
  };

  const cardStyles = isUpcoming
    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100'
    : 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100';
  
  const timeStyles = isUpcoming
    ? 'bg-red-100 text-red-800 border border-red-200'
    : 'bg-green-100 text-green-800 border border-green-200';

  const statusStyles = isUpcoming ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`border ${cardStyles} rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${statusStyles}`}></div>
      
      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-gray-800 truncate text-lg">{event.name}</h5>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="mx-2">•</span>
            <span>{event.department}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-3">
          <span className={`${timeStyles} px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap`}>
            {event.startTime} - {event.endTime}
          </span>
          {isUpcoming && (
            <span className="text-xs text-green-600 font-medium mt-1">
              {getTimeStatus()}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 pl-2">
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Purpose:</span> {event.purpose}
            </p>
          </div>
        </div>
        
        {event.user?.email && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Contact:</span> {event.user.email}
            </p>
          </div>
        )}
        
        {event.user?.phone && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Phone:</span> {event.user.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default AdminHallDashboard;
