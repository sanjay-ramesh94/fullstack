// Admin Analytics Dashboard Component
// src/components/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    hallStats: [],
    monthlyTrends: [],
    weeklyPatterns: [],
    totalBookings: 0,
    activeHalls: 4,
    utilizationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  // Fetch analytics data from backend API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        const now = new Date();
        const endDate = new Date(now);
        const startDate = new Date(now);

        switch (selectedTimeframe) {
          case '1month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case '6months':
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        }

        const data = await adminService.getBookingAnalytics(startDate, endDate);

        setAnalyticsData({
          hallStats: data.hallStats || [],
          monthlyTrends: data.monthlyTrends || [],
          weeklyPatterns: data.weeklyPatterns || [],
          totalBookings: data.totalBookings || 0,
          activeHalls:
            typeof data.activeHalls === 'number' ? data.activeHalls : 4,
          utilizationRate: data.utilizationRate || 0
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData((prev) => ({
          ...prev,
          hallStats: prev.hallStats || [],
          monthlyTrends: prev.monthlyTrends || [],
          weeklyPatterns: prev.weeklyPatterns || [],
          totalBookings: prev.totalBookings || 0,
          activeHalls: prev.activeHalls || 4,
          utilizationRate: prev.utilizationRate || 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin';
  };

  const handleExport = async () => {
    try {
      const now = new Date();
      const endDate = new Date(now);
      const startDate = new Date(now);

      switch (selectedTimeframe) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 6);
          break;
      }

      await adminService.exportAnalyticsBookings('csv', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'all'
      });
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      window.alert(
        error?.message || 'Failed to export report. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const hasMonthlyTrends = analyticsData.monthlyTrends && analyticsData.monthlyTrends.length > 0;
  const peakMonthlyBookings = hasMonthlyTrends
    ? Math.max(...analyticsData.monthlyTrends.map((m) => m.bookings))
    : 0;
  const peakMonthEntry = hasMonthlyTrends
    ? analyticsData.monthlyTrends.find((m) => m.bookings === peakMonthlyBookings)
    : null;

  const hasWeeklyPatterns = analyticsData.weeklyPatterns && analyticsData.weeklyPatterns.length > 0;

  let peakHourLabel = 'N/A';
  let peakHourBookings = 0;
  let busiestDayLabel = 'N/A';
  let busiestDayBookings = 0;

  if (hasWeeklyPatterns) {
    // Find peak hour slot across all days
    let maxSlotCount = 0;
    let maxSlot = null;
    let maxDayForSlot = null;

    analyticsData.weeklyPatterns.forEach((dayEntry) => {
      ['9-12', '12-15', '15-18'].forEach((slot) => {
        const count = dayEntry[slot] || 0;
        if (count > maxSlotCount) {
          maxSlotCount = count;
          maxSlot = slot;
          maxDayForSlot = dayEntry.day;
        }
      });
    });

    if (maxSlot) {
      peakHourLabel = `${maxSlot} (${maxDayForSlot})`;
      peakHourBookings = maxSlotCount;
    }

    // Find busiest day by total bookings
    let maxDayTotal = 0;
    let maxDayLabel = null;

    analyticsData.weeklyPatterns.forEach((dayEntry) => {
      const total = (dayEntry['9-12'] || 0) + (dayEntry['12-15'] || 0) + (dayEntry['15-18'] || 0);
      if (total > maxDayTotal) {
        maxDayTotal = total;
        maxDayLabel = dayEntry.day;
      }
    });

    if (maxDayLabel) {
      busiestDayLabel = maxDayLabel;
      busiestDayBookings = maxDayTotal;
    }
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
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Booking insights and hall utilization reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
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
        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{analyticsData.totalBookings}</p>
                <p className="text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{analyticsData.activeHalls}</p>
                <p className="text-gray-600">Active Halls</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-800">{analyticsData.utilizationRate}%</p>
                <p className="text-gray-600">Utilization Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hall Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Hall Performance</h3>
            
            <div className="space-y-4">
              {analyticsData.hallStats.map((hall, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: hall.color }}
                    ></div>
                    <div>
                      <span className="font-medium text-gray-800">{hall.name}</span>
                      <div className="text-sm text-gray-500">{hall.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{hall.utilization}%</div>
                    <div className="text-xs text-gray-500">utilization</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Periods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Peak Periods</h3>
            
            <div className="space-y-4">
              {/* Peak Month */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Peak Month</div>
                    <div className="text-xl font-bold text-blue-600">
                      {peakMonthEntry ? peakMonthEntry.month : 'N/A'}
                    </div>
                    <div className="text-sm text-blue-500">
                      {hasMonthlyTrends ? `${peakMonthlyBookings} bookings` : 'No data'}
                    </div>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>
              </div>

              {/* Peak Hours */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Peak Hours</div>
                    <div className="text-xl font-bold text-green-600">
                      {hasWeeklyPatterns ? peakHourLabel : 'N/A'}
                    </div>
                    <div className="text-sm text-green-500">
                      {hasWeeklyPatterns ? `${peakHourBookings} bookings` : 'No data'}
                    </div>
                  </div>
                  <div className="text-2xl">⏰</div>
                </div>
              </div>

              {/* Busiest Day */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Busiest Day</div>
                    <div className="text-xl font-bold text-purple-600">
                      {hasWeeklyPatterns ? busiestDayLabel : 'N/A'}
                    </div>
                    <div className="text-sm text-purple-500">
                      {hasWeeklyPatterns ? `${busiestDayBookings} bookings` : 'No data'}
                    </div>
                  </div>
                  <div className="text-2xl">📅</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-4">
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <Link 
              to="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Back to Halls
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
