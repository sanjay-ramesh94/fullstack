// Admin Analytics Dashboard Component
// src/components/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  // Mock data for demonstration (replace with actual API calls)
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      const mockData = {
        hallStats: [
          { name: 'Video Conferencing Hall', bookings: 45, utilization: 78, color: '#302b5b' },
          { name: 'Convention Center', bookings: 38, utilization: 65, color: '#4a4570' },
          { name: 'Lab', bookings: 52, utilization: 89, color: '#605785' },
          { name: 'MBA Seminar Hall', bookings: 31, utilization: 54, color: '#76699a' }
        ],
        monthlyTrends: [
          { month: 'Jan', bookings: 42, growth: -5.2, events: 38 },
          { month: 'Feb', bookings: 38, growth: -9.5, events: 35 },
          { month: 'Mar', bookings: 55, growth: 44.7, events: 52 },
          { month: 'Apr', bookings: 48, growth: -12.7, events: 45 },
          { month: 'May', bookings: 62, growth: 29.2, events: 58 },
          { month: 'Jun', bookings: 58, growth: -6.5, events: 54 }
        ],
        weeklyPatterns: [
          { day: 'Mon', '9-12': 8, '12-15': 12, '15-18': 10 },
          { day: 'Tue', '9-12': 10, '12-15': 15, '15-18': 8 },
          { day: 'Wed', '9-12': 12, '12-15': 18, '15-18': 14 },
          { day: 'Thu', '9-12': 9, '12-15': 16, '15-18': 11 },
          { day: 'Fri', '9-12': 7, '12-15': 13, '15-18': 9 }
        ],
        totalBookings: 166,
        activeHalls: 4,
        utilizationRate: 71.5
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin';
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
                      {analyticsData.monthlyTrends.find(m => m.bookings === Math.max(...analyticsData.monthlyTrends.map(month => month.bookings)))?.month}
                    </div>
                    <div className="text-sm text-blue-500">
                      {Math.max(...analyticsData.monthlyTrends.map(m => m.bookings))} bookings
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
                    <div className="text-xl font-bold text-green-600">2-4 PM</div>
                    <div className="text-sm text-green-500">85% utilization</div>
                  </div>
                  <div className="text-2xl">⏰</div>
                </div>
              </div>

              {/* Busiest Day */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Busiest Day</div>
                    <div className="text-xl font-bold text-purple-600">Wednesday</div>
                    <div className="text-sm text-purple-500">18 avg bookings</div>
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center">
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
