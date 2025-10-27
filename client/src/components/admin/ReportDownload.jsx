// src/components/admin/ReportDownload.jsx
import React, { useState } from 'react';
import { adminService } from '../../services/admin';

const ReportDownload = ({ hallType = null }) => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    dateRange: 'all'
  });

  const handleExport = async (format) => {
    setLoading(true);
    try {
      if (hallType) {
        // Export hall-specific bookings
        await adminService.exportHallBookings(hallType, format, filters);
      } else {
        // Export all bookings
        await adminService.exportBookings(format, filters);
      }
      
      // Show success message
      const message = `${format.toUpperCase()} report downloaded successfully!`;
      if (window.alert) {
        alert(message);
      }
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error.message || 'Failed to download report. Please try again.';
      if (window.alert) {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Download Reports {hallType && `- ${hallType.replace('-', ' ').toUpperCase()}`}
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Downloading...' : 'Download CSV'}
        </button>
        
        <button
          onClick={() => handleExport('xlsx')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Downloading...' : 'Download Excel'}
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* Filter Summary */}
      {(filters.startDate || filters.endDate || filters.status !== 'all' || filters.dateRange !== 'all') && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {filters.startDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                To: {filters.endDate}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                Status: {filters.status}
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                Range: {filters.dateRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDownload;
