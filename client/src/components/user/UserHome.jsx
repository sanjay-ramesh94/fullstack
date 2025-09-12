import React from 'react';

// Main Homepage Component
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  // Sample carousel images (replace with your actual images)
  const carouselImages = [
    "https://via.placeholder.com/800x400/302b5b/ffffff?text=Hall+1",
    "https://via.placeholder.com/800x400/4a4570/ffffff?text=Hall+2", 
    "https://via.placeholder.com/800x400/605785/ffffff?text=Hall+3",
    "https://via.placeholder.com/800x400/76699a/ffffff?text=Hall+4"
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hall data
  const halls = [
    {
      name: "Video Conferencing Hall",
      image: "https://via.placeholder.com/800x400/302b5b/ffffff?text=Video+Conference+Hall",
      description: "State-of-the-art video conferencing facility equipped with modern technology for seamless virtual meetings and conferences. Perfect for corporate events, academic presentations, and international collaborations."
    },
    {
      name: "Convention Center",
      image: "https://via.placeholder.com/800x400/4a4570/ffffff?text=Convention+Center",
      description: "Spacious convention center perfect for large gatherings, seminars, cultural events, and academic conferences. Features modern amenities and flexible seating arrangements for various event types."
    },
    {
      name: "Lab",
      image: "https://via.placeholder.com/800x400/605785/ffffff?text=Lab",
      description: "Advanced laboratory equipped with cutting-edge tools for research and experiments. Ideal for scientific studies, workshops, and technical training sessions."
    },
    {
      name: "MBA Seminar Hall",
      image: "https://via.placeholder.com/800x400/76699a/ffffff?text=MBA+Seminar+Hall",
      description: "Elegant seminar hall designed for MBA programs, guest lectures, and professional training. Offers comfortable seating and audio-visual equipment for interactive sessions."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main heading at top */}
      <div className="text-center py-12">
        <h1 
          className="text-6xl font-bold tracking-wider"
          style={{color: '#302b5b'}}
        >
          KEC HALL BOOKING
        </h1>
      </div>

      {/* Image Carousel */}
      <div className="max-w-4xl mx-auto mb-16 px-4">
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Hall ${index + 1}`}
                className="w-full h-96 object-cover flex-shrink-0"
              />
            ))}
          </div>
          
          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="max-w-6xl mx-auto mb-8">
        <hr className="border-gray-300" />
      </div>

      {/* Split Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col items-center">
          {halls.map((hall, index) => (
            <div
              key={index}
              className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} w-full`}
            >
              <div className="w-1/2 p-4">
                <img
                  src={hall.image}
                  alt={hall.name}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="w-1/2 p-4 text-center">
                <h2 
                  className="text-4xl font-bold mb-4"
                  style={{color: '#302b5b'}}
                >
                  {hall.name}
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-xl mx-auto">
                  {hall.description}
                </p>
                <button 
                  className="px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity text-lg"
                  style={{backgroundColor: '#302b5b'}}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;