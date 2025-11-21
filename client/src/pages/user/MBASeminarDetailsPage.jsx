import React from 'react';
import { Link } from 'react-router-dom';

const MBASeminarDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src="/images/mbaseminarhall.jpg"
              alt="MBA Seminar Hall"
              className="w-full h-64 md:h-80 object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">MBA Seminar Hall</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Elegant seminar hall for MBA programs, management talks, and professional training sessions with modern amenities and a focused ambience.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Description</h2>
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                  The MBA Seminar Hall is tailored for interactive sessions, guest lectures, corporate interactions, and student presentations,
                  providing a formal environment suited for management education.
                </p>
                <div className="space-y-2 text-sm md:text-base text-gray-700">
                  <div><span className="font-semibold text-gray-800">Location:</span> MBA Block – Second Floor, Seminar Hall</div>
                  <div><span className="font-semibold text-gray-800">Hall In-charge:</span> Dr. S. Meena, Professor (MBA)</div>
                  <div><span className="font-semibold text-gray-800">Contact:</span> +91-98765 43240, mba_seminar@kongu.edu</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hall Specifications</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm md:text-base">
                  <li>Capacity: 80–120 participants</li>
                  <li>Comfortable theatre-style seating with writing pads</li>
                  <li>Ceiling-mounted projector and sound system</li>
                  <li>Podium with microphone for speakers</li>
                  <li>Air-conditioned and acoustically treated hall</li>
                  <li>Ideal for seminars, placement training, and review meetings</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                to="/user/mba-seminar-booking"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg text-sm md:text-base transition-colors"
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

export default MBASeminarDetailsPage;
