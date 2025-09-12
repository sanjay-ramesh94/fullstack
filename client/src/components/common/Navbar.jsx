import React from 'react';

const CollegeNavbar = () => {
  return (
    <nav className="bg-white p-4 shadow-lg">
      <div className="flex items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4 whitespace-nowrap">
          {/* Logo placeholder */}
          <img 
  src="/images/kec-logo.png" 
  alt="College Logo" 
  className="w-10 h-13 object-contain flex-shrink-0"
/>
          
          {/* College Information */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-2xl font-bold mb-0.5 tracking-wide whitespace-nowrap" style={{color: '#302b5b'}}>
              KONGU ENGINEERING COLLEGE (Autonomous)
            </h1>
            <div className="text-xs mb-0.5 whitespace-nowrap" style={{color: '#302b5b', opacity: 0.8}}>
              Affiliated to Anna University | Accredited by NAAC with A++ Grade
            </div>
            <div className="text-xs whitespace-nowrap" style={{color: '#302b5b', opacity: 0.7}}>
              Perundurai Erode - 638060 Tamilnadu India
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 1.125rem !important;
          }
          .text-xs {
            font-size: 0.625rem !important;
          }
        }

        @media (max-width: 480px) {
          .w-15 {
            width: 3.125rem !important;
            height: 3.125rem !important;
          }
          h1 {
            font-size: 1rem !important;
          }
          .text-xs {
            font-size: 0.5rem !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default CollegeNavbar;