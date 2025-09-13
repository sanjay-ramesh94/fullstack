import React from 'react';
import { Link } from 'react-router-dom';

// Main Homepage Component
const HomePage = () => {

  // Hall data
  const halls = [
    {
      name: "Video Conference Hall",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: "State-of-the-art video conferencing facility with modern technology for virtual meetings and conferences.",
      link: "/user/video-conference-booking",
      color: "blue"
    },
    {
      name: "Convention Center",
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: "Spacious convention center for large gatherings, seminars, and academic conferences with flexible arrangements.",
      link: "/user/convention-center-booking",
      color: "purple"
    },
    {
      name: "Laboratory",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      description: "Advanced laboratory equipped with cutting-edge tools for research, experiments, and technical training.",
      link: "/user/lab-booking",
      color: "green"
    },
    {
      name: "MBA Seminar Hall",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: "Elegant seminar hall for MBA programs, guest lectures, and professional training with modern amenities.",
      link: "/user/mba-seminar-booking",
      color: "indigo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              KEC Hall Booking System
            </h1>
            <p className="text-xl text-gray-600">
              Book your preferred hall for meetings, conferences, labs, and seminars
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Halls</h2>
            <p className="text-gray-600 mb-8">
              Choose from our state-of-the-art facilities designed for various academic and professional needs
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {halls.map((hall, index) => {
                const colorClasses = {
                  blue: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
                  purple: 'bg-purple-100 hover:bg-purple-200 border-purple-200',
                  green: 'bg-green-100 hover:bg-green-200 border-green-200',
                  indigo: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-200'
                };
                
                return (
                  <Link 
                    key={index}
                    to={hall.link}
                    className={`${colorClasses[hall.color]} rounded-xl shadow-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2 block`}
                  >
                    <div className="flex items-center justify-center mb-4">
                      {hall.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{hall.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{hall.description}</p>
                    <div className="mt-4">
                      <span className={`inline-block bg-gradient-to-r from-${hall.color}-600 to-${hall.color}-700 text-white font-medium py-2 px-4 rounded-lg text-sm`}>
                        Book Now →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Contact our support team for assistance with bookings or technical issues
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-blue-600 font-medium">📧 support@kec.edu</span>
              <span className="text-blue-600 font-medium">📞 +91-XXX-XXX-XXXX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;