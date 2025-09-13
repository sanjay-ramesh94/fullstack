// Admin Hall Selection Component
// src/components/admin/AdminHallSelection.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminHallSelection = () => {
  const navigate = useNavigate();

  // Hall data matching the user homepage
  const halls = [
    {
      id: 'video-conferencing-hall',
      name: "Video Conferencing Hall",
      image: "/images/vchall.webp",
      description: "State-of-the-art video conferencing facility equipped with modern technology for seamless virtual meetings and conferences. Perfect for corporate events, academic presentations, and international collaborations.",
      color: '#302b5b'
    },
    {
      id: 'convention-center',
      name: "Convention Center",
      image: "/images/cclab.jpg",
      description: "Spacious convention center perfect for large gatherings, seminars, cultural events, and academic conferences. Features modern amenities and flexible seating arrangements for various event types.",
      color: '#4a4570'
    },
    {
      id: 'lab',
      name: "Lab",
      image: "/images/lab.jpeg",
      description: "Advanced laboratory equipped with cutting-edge tools for research and experiments. Ideal for scientific studies, workshops, and technical training sessions.",
      color: '#605785'
    },
    {
      id: 'mba-seminar-hall',
      name: "MBA Seminar Hall",
      image: "/images/ablock.jpg",
      description: "Elegant seminar hall designed for MBA programs, guest lectures, and professional training. Offers comfortable seating and audio-visual equipment for interactive sessions.",
      color: '#76699a'
    }
  ];

  const handleHallClick = (hallId, hallName) => {
    navigate(`/admin/dashboard/${hallId}`, { 
      state: { hallName, hallId } 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Select a hall to view booking details</p>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Main heading */}
      <div className="text-center py-12">
        <h1 
          className="text-6xl font-bold tracking-wider"
          style={{color: '#302b5b'}}
        >
          HALL MANAGEMENT
        </h1>
        <p className="text-xl text-gray-600 mt-4">Click on any hall to view its booking details</p>
      </div>

      {/* Halls Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col items-center">
          {halls.map((hall, index) => (
            <div
              key={hall.id}
              className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} w-full cursor-pointer group transition-all duration-300 hover:scale-105`}
              onClick={() => handleHallClick(hall.id, hall.name)}
            >
              <div className="w-1/2 p-4">
                <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src={hall.image}
                    alt={hall.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-1/2 p-4 text-center">
                <h2 
                  className="text-4xl font-bold mb-4 group-hover:text-opacity-80 transition-all duration-300"
                  style={{color: hall.color}}
                >
                  {hall.name}
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-xl mx-auto">
                  {hall.description}
                </p>
                <div 
                  className="inline-flex items-center px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all duration-300 text-lg group-hover:shadow-lg"
                  style={{backgroundColor: hall.color}}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Bookings
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics CTA Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Discover Booking Insights</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Get powerful analytics and visual reports on hall utilization, booking trends, and peak usage patterns. 
              Make data-driven decisions with our comprehensive analytics dashboard.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Usage Trends</h4>
              <p className="text-gray-600 text-sm">Monthly and weekly booking patterns</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Hall Performance</h4>
              <p className="text-gray-600 text-sm">Compare utilization across all halls</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Peak Hours</h4>
              <p className="text-gray-600 text-sm">Identify busiest times and days</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link 
              to="/admin/analytics"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics Dashboard
            </Link>
            <p className="text-gray-500 text-sm">Interactive charts • Real-time data • Export reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHallSelection;
