// src/components/user/BookingCalendar.jsx
import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

const BookingCalendar = ({ onDateSelect, selectedDate, hallType = 'video-conference' }) => {
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableDates();
  }, [hallType, currentMonth]);

  const fetchAvailableDates = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed
      const response = await api.get(`/${hallType}/available-dates?year=${year}&month=${month}`);
      setFullyBookedDates(response.data.fullyBookedDates || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching available dates:", error);
      setLoading(false);
    }
  };

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

  const isDateDisabled = (date) => {
    if (!date) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return true;

    const dateStr = date.toISOString().split("T")[0];
    return fullyBookedDates.includes(dateStr);
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth(currentMonth).map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                title={
                  date < new Date().setHours(0, 0, 0, 0) 
                    ? "Past Date" 
                    : fullyBookedDates.includes(date.toISOString().split("T")[0])
                    ? "Fully Booked - No Available Time Slots"
                    : "Available for Booking"
                }
                className={`
                  w-full h-full rounded-lg text-sm font-medium transition-colors relative
                  ${
                    isDateSelected(date)
                      ? "bg-blue-600 text-white shadow-lg"
                      : isDateDisabled(date)
                      ? date < new Date().setHours(0, 0, 0, 0)
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "bg-red-100 text-red-600 cursor-not-allowed border border-red-200"
                      : "hover:bg-blue-50 text-gray-700 border border-transparent hover:border-blue-200"
                  }
                `}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 rounded mr-2"></div>
            <span>Past Date</span>
          </div>
        </div>
        {fullyBookedDates.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-red-600 font-medium">
              {fullyBookedDates.length} fully booked date{fullyBookedDates.length > 1 ? 's' : ''} this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;