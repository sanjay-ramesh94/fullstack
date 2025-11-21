import React from 'react';
import { Link } from 'react-router-dom';

const ConventionCenterDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src="/images/conventioncenter.jpg"
              alt="Convention Center"
              className="w-full h-64 md:h-80 object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Convention Center</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Spacious convention center for large gatherings, seminars, conferences, and institute-level functions with flexible seating and stage setups.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Description</h2>
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                  The Convention Center is ideal for major academic events, symposiums, graduation-related activities, and high-profile meetings,
                  providing a professional ambience and robust infrastructure.
                </p>
                <div className="space-y-2 text-sm md:text-base text-gray-700">
                  <div><span className="font-semibold text-gray-800">Location:</span> Main Campus, Convention Block – Ground Floor</div>
                  <div><span className="font-semibold text-gray-800">Hall In-charge:</span> Mr. S. Prakash, PRO</div>
                  <div><span className="font-semibold text-gray-800">Contact:</span> +91-98765 43220, convention@kongu.edu</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hall Specifications</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm md:text-base">
                  <li>Capacity: 300–500 participants depending on layout</li>
                  <li>Raised stage with podium and wireless microphones</li>
                  <li>High-lumen projector and large screen</li>
                  <li>Professional audio system with surround speakers</li>
                  <li>Flexible seating (theatre / classroom / cluster)</li>
                  <li>Backup power and climate control for long events</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                to="/user/convention-center-booking"
                className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg text-sm md:text-base transition-colors"
              >
                Book Now
              </Link>
              <Link
                to="/user"
                className="inline-flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-8 rounded-2xl border border-gray-300 shadow-sm hover:bg-gray-50 text-sm md:text-base transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConventionCenterDetailsPage;
