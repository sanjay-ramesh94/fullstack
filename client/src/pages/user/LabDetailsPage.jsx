import React from 'react';
import { Link } from 'react-router-dom';

const LabDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src="/images/laboratory.jpeg"
              alt="Laboratory"
              className="w-full h-64 md:h-80 object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Laboratory</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Advanced computing laboratory equipped for practical sessions, project development, and research-oriented activities.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Description</h2>
                <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                  The laboratory supports regular academic labs, mini-projects, and advanced research experiments, providing a safe and
                  well-managed environment for students and faculty.
                </p>
                <div className="space-y-2 text-sm md:text-base text-gray-700">
                  <div><span className="font-semibold text-gray-800">Location:</span> CSE Block – Ground Floor, CC Lab</div>
                  <div><span className="font-semibold text-gray-800">Lab In-charge:</span> Mrs. P. Anitha, Assistant Professor (CSE)</div>
                  <div><span className="font-semibold text-gray-800">Contact:</span> +91-98765 43230, cclab@kongu.edu</div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hall Specifications</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm md:text-base">
                  <li>Capacity: 30–40 systems with individual seating</li>
                  <li>Latest configuration desktop systems with licensed software</li>
                  <li>High-speed internet and intranet connectivity</li>
                  <li>Centralized UPS power backup</li>
                  <li>Ceiling-mounted projector and audio system for demonstrations</li>
                  <li>Adherence to lab safety and usage guidelines</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                to="/user/lab-booking"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg text-sm md:text-base transition-colors"
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

export default LabDetailsPage;
