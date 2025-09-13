// src/components/user/VideoConferenceBookingForm.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const VideoConferenceBookingForm = ({ selectedDate, existingBookings, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    purpose: '',
    startTime: '',
    endTime: '',
    meetingType: 'internal',
    expectedParticipants: '',
    requiresRecording: false,
    technicalRequirements: ''
  });
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if selected date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Check if a time is in the past for today
  const isTimeInPast = (timeString) => {
    if (!isToday(selectedDate)) return false;
    
    const currentTime = getCurrentTime();
    return timeString <= currentTime;
  };

  // Generate all possible time slots (9:00 AM to 4:30 PM, 30-minute intervals)
  const generateAllTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 16; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        if (hour === 16 && minutes > 30) break; // Stop at 4:30 PM
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Skip past times if selected date is today
        if (isTimeInPast(timeSlot)) continue;
        
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  // Check if a time slot conflicts with existing bookings
  const isTimeSlotAvailable = (startTime, endTime) => {
    return !existingBookings.some(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      
      // Check if there's any overlap
      return (startTime < bookingEnd && endTime > bookingStart);
    });
  };

  // Filter available start times
  const getAvailableStartTimes = () => {
    const allSlots = generateAllTimeSlots();
    return allSlots.filter(startTime => {
      // Check if this start time can accommodate at least a 30-minute slot
      const minEndTime = addMinutes(startTime, 30);
      return isTimeSlotAvailable(startTime, minEndTime);
    });
  };

  // Filter available end times based on selected start time
  const getAvailableEndTimes = (selectedStartTime) => {
    if (!selectedStartTime) return [];
    
    const allSlots = generateAllTimeSlots();
    const startIndex = allSlots.indexOf(selectedStartTime);
    
    if (startIndex === -1) return [];
    
    const availableEndTimes = [];
    
    // Check each possible end time after the start time
    for (let i = startIndex + 1; i < allSlots.length; i++) {
      const endTime = allSlots[i];
      
      // Check if the entire duration from start to this end time is available
      if (isTimeSlotAvailable(selectedStartTime, endTime)) {
        availableEndTimes.push(endTime);
      } else {
        // If we hit a conflict, we can't use any later end times
        break;
      }
    }
    
    return availableEndTimes;
  };

  // Helper function to add minutes to a time string
  const addMinutes = (timeString, minutes) => {
    const [hours, mins] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return date.toTimeString().slice(0, 5);
  };

  // Update available times when existingBookings change or selectedDate changes
  useEffect(() => {
    const availableStarts = getAvailableStartTimes();
    setAvailableStartTimes(availableStarts);
    
    // Reset form when bookings change or date changes
    if (formData.startTime && !availableStarts.includes(formData.startTime)) {
      setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
    }
  }, [existingBookings, selectedDate]);

  // Update available end times when start time changes
  useEffect(() => {
    if (formData.startTime) {
      const availableEnds = getAvailableEndTimes(formData.startTime);
      setAvailableEndTimes(availableEnds);
      
      // Reset end time if it's no longer available
      if (formData.endTime && !availableEnds.includes(formData.endTime)) {
        setFormData(prev => ({ ...prev, endTime: '' }));
      }
    } else {
      setAvailableEndTimes([]);
    }
  }, [formData.startTime, existingBookings, selectedDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department || !formData.purpose || 
        !formData.startTime || !formData.endTime || !formData.expectedParticipants) {
      setError('Please fill in all required fields');
      return;
    }

    // Final validation - ensure the selected time slot is still available
    if (!isTimeSlotAvailable(formData.startTime, formData.endTime)) {
      setError('Selected time slot is no longer available. Please choose another time.');
      return;
    }

    // Additional validation for today - ensure start time is not in the past
    if (isTimeInPast(formData.startTime)) {
      setError('Cannot book a time slot that has already passed. Please select a future time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        ...formData,
        date: selectedDate.toISOString().split('T')[0],
        expectedParticipants: parseInt(formData.expectedParticipants)
      };

      await api.post('/video-conference', bookingData);
      onBookingSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create video conference booking');
    }
    
    setLoading(false);
  };

  // Format time for display
  const formatTimeForDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get message for no available slots
  const getNoSlotsMessage = () => {
    if (isToday(selectedDate)) {
      const currentTime = getCurrentTime();
      const current12Hour = formatTimeForDisplay(currentTime);
      return `All remaining time slots for today are fully booked. Current time: ${current12Hour}`;
    }
    return 'All time slots for this date are fully booked. Please select another date.';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Book Video Conference Hall</h3>
      
      {isToday(selectedDate) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-800 text-sm">
              Today's booking - only future time slots are shown (Current time: {formatTimeForDisplay(getCurrentTime())})
            </p>
          </div>
        </div>
      )}
      
      {availableStartTimes.length === 0 && !loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-red-800 mb-2">No Available Slots</h4>
          <p className="text-red-600">{getNoSlotsMessage()}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your department"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Meeting *
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the purpose of your video conference"
            />
          </div>

          {/* Video Conference Specific Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type *
              </label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal Meeting</option>
                <option value="external">External Meeting</option>
                <option value="international">International Meeting</option>
              </select>
            </div>

            <div>
              <label htmlFor="expectedParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Participants *
              </label>
              <input
                type="number"
                id="expectedParticipants"
                name="expectedParticipants"
                value={formData.expectedParticipants}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of participants"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresRecording"
              name="requiresRecording"
              checked={formData.requiresRecording}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresRecording" className="ml-2 block text-sm text-gray-700">
              Recording Required
            </label>
          </div>

          <div>
            <label htmlFor="technicalRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Technical Requirements
            </label>
            <textarea
              id="technicalRequirements"
              name="technicalRequirements"
              value={formData.technicalRequirements}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special technical requirements or setup needed"
            />
          </div>

          {/* Time Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select start time</option>
                {availableStartTimes.map(time => (
                  <option key={time} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
              {availableStartTimes.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {availableStartTimes.length} available start time{availableStartTimes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.startTime}
              >
                <option value="">
                  {formData.startTime ? 'Select end time' : 'Select start time first'}
                </option>
                {availableEndTimes.map(time => (
                  <option key={time} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
              {formData.startTime && availableEndTimes.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {availableEndTimes.length} available end time{availableEndTimes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || availableStartTimes.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Booking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Video Conference Booking
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default VideoConferenceBookingForm;
