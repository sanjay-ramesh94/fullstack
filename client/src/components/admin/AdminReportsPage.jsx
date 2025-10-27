// src/components/admin/AdminReportsPage.jsx
import React, { useState } from 'react';
import ReportDownload from './ReportDownload';

const AdminReportsPage = () => {
  const [selectedHall, setSelectedHall] = useState('all');

  const hallOptions = [
    { value: 'all', label: 'All Halls' },
    { value: 'convention-center', label: 'Convention Center' },
    { value: 'mba-seminar', label: 'MBA Seminar Hall' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'video-conference', label: 'Video Conference Hall' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Download booking reports and analytics data</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hallOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Report Download Section */}
          <div className="lg:col-span-2">
            <ReportDownload hallType={selectedHall === 'all' ? null : selectedHall} />
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-blue-600">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-green-600">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-semibold text-green-600">89</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Export Formats</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">CSV Format</p>
                    <p className="text-sm text-gray-600">Spreadsheet compatible</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Excel Format</p>
                    <p className="text-sm text-gray-600">Advanced formatting</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">PDF Format</p>
                    <p className="text-sm text-gray-600">Professional reports</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Downloads</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">convention-center-2025-01-15.csv</span>
                  <span className="text-gray-400">2 hrs ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">all-bookings-2025-01-14.xlsx</span>
                  <span className="text-gray-400">1 day ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">lab-report-2025-01-13.pdf</span>
                  <span className="text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
