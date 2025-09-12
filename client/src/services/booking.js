// src/services/booking.js
import { api } from './api';

class BookingService {
  // Get available dates
  async getAvailableDates() {
    try {
      const response = await api.get('/booking/available-dates');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available dates' };
    }
  }

  // Get bookings for a specific date
  async getBookingsForDate(date) {
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/booking/date/${dateStr}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings for date' };
    }
  }

  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/booking/create', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create booking' };
    }
  }

  // Get user's own bookings
  async getMyBookings() {
    try {
      const response = await api.get('/booking/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your bookings' };
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId) {
    try {
      const response = await api.patch(`/booking/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  }

  // Check for time conflicts
  checkTimeConflict(startTime1, endTime1, startTime2, endTime2) {
    const start1 = new Date(`1970-01-01T${startTime1}`);
    const end1 = new Date(`1970-01-01T${endTime1}`);
    const start2 = new Date(`1970-01-01T${startTime2}`);
    const end2 = new Date(`1970-01-01T${endTime2}`);

    return (start1 < end2 && start2 < end1);
  }

  // Validate booking time
  validateBookingTime(startTime, endTime, existingBookings = []) {
    // Check if end time is after start time
    if (startTime >= endTime) {
      return { isValid: false, message: 'End time must be after start time' };
    }

    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => 
      this.checkTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasConflict) {
      return { isValid: false, message: 'Time slot conflicts with existing booking' };
    }

    // Check if booking is within allowed hours (9:00 AM to 4:30 PM)
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const minTime = new Date('1970-01-01T09:00');
    const maxTime = new Date('1970-01-01T16:30');

    if (start < minTime || end > maxTime) {
      return { 
        isValid: false, 
        message: 'Booking must be between 9:00 AM and 4:30 PM' 
      };
    }

    return { isValid: true };
  }

  // Generate time slots
  generateTimeSlots(startHour = 9, endHour = 16, interval = 30) {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        if (hour === endHour && minutes > 30) break; // Stop at 4:30 PM
        
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  }

  // Format date for display
  formatDate(date) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  // Format time for display
  formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get booking status
  getBookingStatus(booking) {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const bookingEndTime = new Date(`${booking.date.split('T')[0]}T${booking.endTime}`);

    if (bookingEndTime < now) {
      return 'completed';
    } else if (bookingDate.toDateString() === now.toDateString()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  }
}

export const bookingService = new BookingService();