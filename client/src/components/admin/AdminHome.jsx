// client/src/components/admin/AdminHome.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* College Logo in Top Left Corner */}
      <div className="absolute top-4 left-4 z-10">
        <a 
          href="https://kongu.ac.in/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg hover:bg-white transition-all duration-300"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">KEC</span>
        </a>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Admin Panel
              </h1>
              <p className="text-xl text-gray-600">
                Manage video conference hall bookings and view system analytics
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Access Dashboard</h2>
              <p className="text-gray-600 mb-8">
                Login to access the administrative dashboard and manage hall bookings
              </p>
              
              <Link 
                to="/admin/login"
                className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Admin Login
              </Link>
            </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0L6 7m6 0l6 0m-6 0v6m0-6L12 1m0 6l4 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Management</h3>
              <p className="text-gray-600 text-sm">View and manage all hall bookings, update status, and handle cancellations</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600 text-sm">Access detailed statistics, usage reports, and booking trends</p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              to="/user"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to User Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminHome;