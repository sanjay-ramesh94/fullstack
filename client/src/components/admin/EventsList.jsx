// client/src/components/admin/EventsList.jsx
import React from 'react';

const EventsList = ({ events, loading, selectedDate }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Events for {selectedDate ? selectedDate.toDateString() : 'Selected Date'}
        </h3>
        
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div>
            <h4 className="text-lg font-medium text-green-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upcoming Events ({events?.upcomingEvents?.length || 0})
            </h4>
            
            {events?.upcomingEvents?.length > 0 ? (
              <div className="space-y-3">
                {events.upcomingEvents.map(event => (
                  <div key={event._id} className="border border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 hover:border-green-300 transition-all duration-200 transform hover:-translate-y-0.5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-800">{event.name}</h5>
                        <p className="text-sm text-gray-600">
                           - {event.department}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      <strong>Purpose:</strong> {event.purpose}
                    </p>
                    {event.user?.email && (
                      <p className="text-gray-600 text-xs">
                        Contact: {event.user.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic py-4">No upcoming events for this date</p>
            )}
          </div>

          {/* Completed Events */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed Events ({events?.completedEvents?.length || 0})
            </h4>
            
            {events?.completedEvents?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {events.completedEvents.map(event => (
                  <div key={event._id} className="border border-gray-200 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-800">{event.name}</h5>
                        <p className="text-sm text-gray-600">
                           - {event.department}
                        </p>
                      </div>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      <strong>Purpose:</strong> {event.purpose}
                    </p>
                    {event.user?.email && (
                      <p className="text-gray-600 text-xs">
                        Contact: {event.user.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic py-4">No completed events for this date</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Day Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <div className="text-2xl font-bold text-blue-600">
              {events?.upcomingEvents?.length || 0}
            </div>
            <div className="text-sm text-blue-700">Upcoming</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <div className="text-2xl font-bold text-green-600">
              {events?.completedEvents?.length || 0}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsList;