import React from 'react';
import { Link } from 'react-router-dom';

const VideoConferenceDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src="/images/videoconferencinghall.jpeg"
              alt="Video Conference Hall"
              className="w-full h-64 md:h-80 object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Video Conference Hall</h1>
            <p className="text-gray-600 mb-8 text-lg">
              State-of-the-art video conferencing facility with modern technology for virtual meetings, online reviews, and interactive sessions.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Description</h2>
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                  The Video Conference Hall is designed for seamless online and hybrid communication, enabling departments to conduct project reviews,
                  viva-voce, guest lectures, and interactions with industry experts.
                </p>
                <div className="space-y-2 text-sm md:text-base text-gray-700">
                  <div><span className="font-semibold text-gray-800">Location:</span> CSE Block – First Floor, CC Lab Complex</div>
                  <div><span className="font-semibold text-gray-800">Hall In-charge:</span> Mr. R. Kumar, Assistant Professor (IT)</div>
                  <div><span className="font-semibold text-gray-800">Contact:</span> +91-98765 43210, vc_hall@kongu.edu</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hall Specifications</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm md:text-base">
                  <li>Capacity: 40–60 participants</li>
                  <li>High-speed wired and Wi-Fi internet connectivity</li>
                  <li>Large LED display with supporting projection system</li>
                  <li>HD cameras with wide-angle coverage and noise-canceling microphones</li>
                  <li>Dedicated console for video conferencing platforms (Zoom, Teams, etc.)</li>
                  <li>Air-conditioned environment with ergonomic seating</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                to="/user/video-conference-booking"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg text-sm md:text-base transition-colors"
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

export default VideoConferenceDetailsPage;
