// src/pages/admin/AdminHomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Admin Portal
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Manage video conference hall bookings, view schedules, and oversee facility utilization. 
            Access comprehensive booking management tools and analytics.
          </p>
          
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto mb-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Management Dashboard</h2>
              <p className="text-gray-600">
                View and manage all hall bookings with advanced administrative tools
              </p>
            </div>
            
            <Link 
              to="/admin/login"
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 inline-block text-center text-lg"
            >
              Access Dashboard
            </Link>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0L6 7m6 0l6 0m-6 0v6m0-6L12 1m0 6l4 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Overview</h3>
              <p className="text-gray-600">View all bookings by date with detailed information</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Schedule Management</h3>
              <p className="text-gray-600">Track completed and upcoming events</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600">Monitor facility usage and generate reports</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Administrative Features</h3>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-600 mb-2">📅</div>
                  <h4 className="font-medium text-gray-800">Event Calendar</h4>
                  <p className="text-sm text-gray-600">Interactive calendar view</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-600 mb-2">👥</div>
                  <h4 className="font-medium text-gray-800">User Management</h4>
                  <p className="text-sm text-gray-600">Track user bookings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-600 mb-2">⚡</div>
                  <h4 className="font-medium text-gray-800">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">Live booking status</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-600 mb-2">📊</div>
                  <h4 className="font-medium text-gray-800">Usage Statistics</h4>
                  <p className="text-sm text-gray-600">Detailed analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12">
            <Link 
              to="/user" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Switch to User Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;