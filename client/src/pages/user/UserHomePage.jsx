import React from 'react';
import { Link } from 'react-router-dom';

// Main Homepage Component
const HomePage = () => {
  // Handle Book Now button click for specific halls
  const handleBookNow = (hallType) => {
    // Redirect to specific booking page based on hall type
    switch(hallType) {
      case 'video-conference':
        window.location.href = '/user/video-conference-booking';
        break;
      case 'convention-center':
        window.location.href = '/user/convention-center-booking';
        break;
      case 'lab':
        window.location.href = '/user/lab-booking';
        break;
      case 'mba-seminar':
        window.location.href = '/user/mba-seminar-booking';
        break;
      default:
        window.location.href = '/user/login';
    }
  };

  // Hall data
  const halls = [
    {
      name: "Video Conference Hall",
      type: "video-conference",
      image: "/images/videoconferencinghall.jpeg",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: "State-of-the-art video conferencing facility with modern technology for virtual meetings and conferences.",
      color: "blue",
      detailsLink: "/user/video-conference-details"
    },
    {
      name: "Convention Center",
      type: "convention-center",
      image: "/images/conventioncenter.jpg",
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: "Spacious convention center for large gatherings, seminars, and academic conferences with flexible arrangements.",
      color: "purple",
      detailsLink: "/user/convention-center-details"
    },
    {
      name: "Laboratory",
      type: "lab",
      image: "/images/laboratory.jpeg",
      icon: (
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      description: "Advanced laboratory equipped with cutting-edge tools for research, experiments, and technical training.",
      color: "green",
      detailsLink: "/user/lab-details"
    },
    {
      name: "MBA Seminar Hall",
      type: "mba-seminar",
      image: "/images/mbaseminarhall.jpg",
      icon: (
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: "Elegant seminar hall for MBA programs, guest lectures, and professional training with modern amenities.",
      color: "indigo",
      detailsLink: "/user/mba-seminar-details"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                KEC Hall Booking System
              </h1>
              <p className="text-lg text-gray-600">
                Book your preferred hall for meetings, conferences, labs, and seminars
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-16 mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-10">Available Halls</h2>
              <p className="text-xl text-gray-600 mb-16">
                Choose from our state-of-the-art facilities designed for various academic and professional needs
              </p>
              
              <div className="grid md:grid-cols-2 gap-12">
              {halls.map((hall, index) => {
                const colorClasses = {
                  blue: 'bg-blue-50 hover:bg-blue-100 border-blue-300',
                  purple: 'bg-purple-50 hover:bg-purple-100 border-purple-300',
                  green: 'bg-green-50 hover:bg-green-100 border-green-300',
                  indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300'
                };
                
                return (
                  <div 
                    key={index}
                    className={`${colorClasses[hall.color]} rounded-3xl shadow-xl p-10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2`}
                  >
                    <div className="mb-8">
                      <img
                        src={hall.image}
                        alt={hall.name}
                        className="w-full h-56 object-cover rounded-2xl mb-6"
                      />
                      <div className="flex items-center justify-center mb-6">
                        {hall.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{hall.name}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{hall.description}</p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                      <button
                        onClick={() => handleBookNow(hall.type)}
                        className={`inline-flex items-center justify-center bg-gradient-to-r from-${hall.color}-600 to-${hall.color}-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg transition-colors`}
                      >
                        Book Now →
                      </button>
                      <Link
                        to={hall.detailsLink}
                        className={`inline-flex items-center justify-center bg-white font-semibold py-4 px-8 rounded-2xl text-lg border shadow-md text-${hall.color}-700 border-${hall.color}-300 hover:bg-${hall.color}-50 hover:text-${hall.color}-800 transition-colors`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-base mb-6">
                Contact our support team for assistance with bookings or technical issues
              </p>
              <div className="flex justify-center space-x-6 text-base">
                <span className="text-blue-600 font-medium">📧 support@kongu.edu</span>
                <span className="text-blue-600 font-medium">📞 +91-1800-646-266</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;