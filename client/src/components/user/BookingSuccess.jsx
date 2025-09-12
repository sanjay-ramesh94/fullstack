// src/components/user/BookingSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookingSuccess = ({ bookingDetails, onNewBooking }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            Your video conference hall booking has been successfully confirmed.
          </p>
        </div>

        {/* Booking Details */}
        {bookingDetails && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-800">
                  {bookingDetails.name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-800">
                  {bookingDetails.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-800">
                  {bookingDetails.startTime} - {bookingDetails.endTime}
                </span>
              </div>
              <div className="pt-2 border-t">
                <span className="text-gray-600">Purpose:</span>
                <p className="font-medium text-gray-800 mt-1">
                  {bookingDetails.purpose}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg 
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div>
              <h4 className="text-blue-800 font-medium mb-1">What's Next?</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• You will receive a confirmation email shortly</li>
                <li>• Please arrive 15 minutes before your scheduled time</li>
                <li>• Bring your student ID for verification</li>
                <li>• Contact admin if you need to make changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Make Another Booking
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/user"
              className="text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
            
            <button
              onClick={() => window.print()}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Print Details
            </button>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Need help? Contact us at{' '}
            <a 
              href="mailto:support@hallbooking.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support@hallbooking.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;