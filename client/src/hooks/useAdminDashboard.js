// Custom Hooks for Admin Dashboard
// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

// Custom hook for managing admin dashboard state
export const useAdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({ completedEvents: [], upcomingEvents: [] });
  const [bookedDates, setBookedDates] = useState(new Set());
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  // Fetch events for selected date with proper filtering for upcoming events
  const fetchEventsForDate = useCallback(async (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    setLoadingEvents(true);
    setError(null);

    try {
      const response = await api.get(`/admin/events/${dateStr}`);
      const { completedEvents = [], upcomingEvents = [] } = response.data;
      
      // Get current date and time for comparison
      const now = new Date();
      const currentTime = now.getTime();
      const isToday = date.toDateString() === now.toDateString();
      const isPastDate = date < now.setHours(0, 0, 0, 0);
      const isFutureDate = date > new Date().setHours(23, 59, 59, 999);
      
      let filteredUpcomingEvents = [];
      let filteredCompletedEvents = [];

      if (isPastDate) {
        // For past dates, all events should be completed
        filteredCompletedEvents = [...completedEvents, ...upcomingEvents];
        filteredUpcomingEvents = [];
      } else if (isFutureDate) {
        // For future dates, all events should be upcoming
        filteredUpcomingEvents = [...upcomingEvents, ...completedEvents];
        filteredCompletedEvents = [];
      } else if (isToday) {
        // For today, filter based on current time vs event time
        const allEvents = [...completedEvents, ...upcomingEvents];
        
        allEvents.forEach(event => {
          const [hours, minutes] = event.startTime.split(':').map(Number);
          const eventDateTime = new Date(date);
          eventDateTime.setHours(hours, minutes, 0, 0);
          
          if (eventDateTime.getTime() > currentTime) {
            filteredUpcomingEvents.push(event);
          } else {
            filteredCompletedEvents.push(event);
          }
        });
      }

      // Sort upcoming events by start time (earliest first)
      filteredUpcomingEvents.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });

      // Sort completed events by start time (most recent first)
      filteredCompletedEvents.sort((a, b) => {
        return b.startTime.localeCompare(a.startTime);
      });

      setEvents({
        completedEvents: filteredCompletedEvents,
        upcomingEvents: filteredUpcomingEvents
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
      setEvents({ completedEvents: [], upcomingEvents: [] });
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // Fetch booked dates for current month with enhanced data
  const fetchBookedDatesForMonth = useCallback(async (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    setLoadingBookedDates(true);
    setError(null);

    try {
      const response = await api.get(`/admin/booked-dates?startDate=${startDate}&endDate=${endDate}`);
      
      // Handle both array of date strings and array of objects
      let bookedDatesSet;
      if (Array.isArray(response.data)) {
        bookedDatesSet = new Set(response.data);
      } else if (response.data.bookedDates) {
        bookedDatesSet = new Set(response.data.bookedDates);
      } else if (response.data.dates) {
        bookedDatesSet = new Set(response.data.dates);
      } else {
        bookedDatesSet = new Set();
      }
      
      setBookedDates(bookedDatesSet);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      setError('Failed to load booked dates');
      setBookedDates(new Set());
    } finally {
      setLoadingBookedDates(false);
    }
  }, []);

  // Navigate to different month
  const navigateMonth = useCallback((direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  }, []);

  // Update selected date
  const updateSelectedDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  // Refresh data for current selections
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchEventsForDate(selectedDate),
      fetchBookedDatesForMonth(currentMonth)
    ]);
  }, [selectedDate, currentMonth, fetchEventsForDate, fetchBookedDatesForMonth]);

  // Effects
  useEffect(() => {
    if (selectedDate) {
      fetchEventsForDate(selectedDate);
    }
  }, [selectedDate, fetchEventsForDate]);

  useEffect(() => {
    fetchBookedDatesForMonth(currentMonth);
  }, [currentMonth, fetchBookedDatesForMonth]);

  // Auto-refresh upcoming events every minute to keep status current
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      if (selectedDate.toDateString() === today.toDateString()) {
        fetchEventsForDate(selectedDate);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [selectedDate, fetchEventsForDate]);

  // Memoized values
  const isLoading = loadingEvents || loadingBookedDates;
  const totalEvents = events.completedEvents.length + events.upcomingEvents.length;
  const hasEventsForSelectedDate = totalEvents > 0;

  return {
    // State
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
    
    // Actions
    updateSelectedDate,
    navigateMonth,
    fetchEventsForDate,
    fetchBookedDatesForMonth,
    refreshData,
    
    // Reset functions
    clearError: useCallback(() => setError(null), [])
  };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

// Hook for calendar utilities with enhanced date checking
export const useCalendarUtils = (currentMonth) => {
  return useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };

    const isDateSelected = (date, selectedDate) => {
      if (!date || !selectedDate) return false;
      return date.toDateString() === selectedDate.toDateString();
    };

    const isDateBooked = (date, bookedDates) => {
      if (!date || !bookedDates) return false;
      const dateStr = date.toISOString().split('T')[0];
      return bookedDates.has(dateStr);
    };

    const isDateToday = (date) => {
      if (!date) return false;
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const isDatePast = (date) => {
      if (!date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate < today;
    };

    const isDateFuture = (date) => {
      if (!date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate > today;
    };

    // Enhanced function to get calendar styling for dates
    const getDateStyles = (date, selectedDate, bookedDates) => {
      if (!date) return '';

      const selected = isDateSelected(date, selectedDate);
      const booked = isDateBooked(date, bookedDates);
      const today = isDateToday(date);
      const past = isDatePast(date);
      const future = isDateFuture(date);

      // Priority order: Selected > Today+Booked > Booked > Today > Default
      if (selected) {
        return 'bg-blue-600 text-white shadow-lg transform scale-105 ring-2 ring-blue-300';
      }
      
      if (today && booked) {
        return 'bg-amber-200 text-amber-900 border-2 border-amber-400 hover:bg-amber-300 font-semibold';
      }
      
      if (booked) {
        if (past) {
          return 'bg-green-200 text-green-800 border border-green-400 hover:bg-green-300';
        } else if (future) {
          return 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 font-medium';
        } else {
          return 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200';
        }
      }
      
      if (today) {
        return 'bg-blue-50 text-blue-700 border-2 border-blue-300 hover:bg-blue-100 font-medium';
      }
      
      if (past) {
        return 'text-gray-400 hover:bg-gray-50';
      }
      
      return 'hover:bg-gray-100 text-gray-700';
    };

    return {
      monthNames,
      dayNames,
      getDaysInMonth,
      isDateSelected,
      isDateBooked,
      isDateToday,
      isDatePast,
      isDateFuture,
      getDateStyles,
      calendarData: getDaysInMonth(currentMonth)
    };
  }, [currentMonth]);
};