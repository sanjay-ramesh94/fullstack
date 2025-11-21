// src/services/admin.js
import { api } from './api';

class AdminService {
  // Get events for a specific date
  async getEventsForDate(date) {
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/admin/events/${dateStr}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events for date' };
    }
  }

  // Get all bookings with pagination
  async getAllBookings(page = 1, limit = 10, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await api.get(`/admin/all-bookings?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.patch(`/admin/booking/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update booking status' };
    }
  }

  // Delete/Cancel booking
  async deleteBooking(bookingId) {
    try {
      const response = await api.delete(`/admin/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete booking' };
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard statistics' };
    }
  }

  // Get booking analytics
  async getBookingAnalytics(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
        endDate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate
      });
      
      const response = await api.get(`/admin/analytics?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch analytics' };
    }
  }

  // Export bookings data
  async exportBookings(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await api.get(`/admin/export-bookings?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `bookings-export-${timestamp}.${format}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export bookings' };
    }
  }

  async exportAnalyticsBookings(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await api.get(`/admin/export-bookings?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics-bookings-export-${timestamp}.${format}`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      // Normalize error so callers get a readable message, not a raw Blob
      if (error.response) {
        const status = error.response.status;
        throw {
          message:
            (error.response.data && error.response.data.message) ||
            `Export failed with status ${status}`
        };
      }
      throw { message: 'Failed to export analytics bookings' };
    }
  }

  // Export hall-specific bookings
  async exportHallBookings(hallType, format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await api.get(`/${hallType}/admin/export-bookings?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format and hall type
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${hallType}-bookings-${timestamp}.${format}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export hall bookings' };
    }
  }

  // Get user details
  async getUserDetails(userId) {
    try {
      const response = await api.get(`/admin/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user details' };
    }
  }

  // Get all users
  async getAllUsers(page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  }

  // Toggle user status (active/inactive)
  async toggleUserStatus(userId) {
    try {
      const response = await api.patch(`/admin/user/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle user status' };
    }
  }

  // Send notification to user
  async sendNotification(userId, notification) {
    try {
      const response = await api.post(`/admin/user/${userId}/notification`, notification);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send notification' };
    }
  }

  // Get monthly booking report
  async getMonthlyReport(year, month) {
    try {
      const response = await api.get(`/admin/reports/monthly/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch monthly report' };
    }
  }

  // Categorize events by time - FIXED
  categorizeEvents(events, referenceDate = new Date()) {
    const completedEvents = [];
    const upcomingEvents = [];

    events.forEach(event => {
      // Use startTime to determine if event is upcoming or completed
      // If the event hasn't started yet, it's upcoming
      // If the event has started (even if still ongoing), consider it as completed for admin view
      const eventStartDateTime = new Date(`${event.date.split('T')[0]}T${event.startTime}`);
      
      if (eventStartDateTime > referenceDate) {
        upcomingEvents.push(event);
      } else {
        completedEvents.push(event);
      }
    });

    return { completedEvents, upcomingEvents };
  }

  // Alternative categorization that includes "ongoing" status
  categorizeEventsDetailed(events, referenceDate = new Date()) {
    const completedEvents = [];
    const upcomingEvents = [];
    const ongoingEvents = [];

    events.forEach(event => {
      const eventStartDateTime = new Date(`${event.date.split('T')[0]}T${event.startTime}`);
      const eventEndDateTime = new Date(`${event.date.split('T')[0]}T${event.endTime}`);
      
      if (eventEndDateTime < referenceDate) {
        // Event has completely finished
        completedEvents.push(event);
      } else if (eventStartDateTime > referenceDate) {
        // Event hasn't started yet
        upcomingEvents.push(event);
      } else {
        // Event is currently ongoing
        ongoingEvents.push(event);
      }
    });

    return { completedEvents, upcomingEvents, ongoingEvents };
  }

  // Format event data for display
  formatEventForDisplay(event) {
    return {
      ...event,
      formattedDate: this.formatDate(event.date),
      formattedStartTime: this.formatTime(event.startTime),
      formattedEndTime: this.formatTime(event.endTime),
      duration: this.calculateDuration(event.startTime, event.endTime)
    };
  }

  // Calculate duration between times
  calculateDuration(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes} minutes`;
    } else if (diffMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  }

  // Format date for display
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format time for display
  formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get event status - UPDATED
  getEventStatus(event, referenceDate = new Date()) {
    const eventDate = new Date(event.date);
    const eventStartTime = new Date(`${event.date.split('T')[0]}T${event.startTime}`);
    const eventEndTime = new Date(`${event.date.split('T')[0]}T${event.endTime}`);

    if (eventEndTime < referenceDate) {
      return 'completed';
    } else if (eventStartTime <= referenceDate && referenceDate < eventEndTime) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }
}

export const adminService = new AdminService();