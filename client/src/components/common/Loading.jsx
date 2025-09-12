// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ 
  message = "Loading...", 
  size = "medium", 
  overlay = false, 
  fullScreen = false 
}) => {
  // Size configurations
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Spinner component
  const Spinner = () => (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200`}
      >
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  // Alternative spinner designs
  const PulseSpinner = () => (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  );

  const WaveSpinner = () => (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-8 bg-blue-600 rounded animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );

  // Content component
  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Spinner />
      {message && (
        <p className={`${textSizes[size]} text-gray-600 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingContent />
        </div>
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <LoadingContent />
        </div>
      </div>
    );
  }

  // Default inline loading
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingContent />
    </div>
  );
};

// Specialized loading components for different use cases
export const ButtonLoading = ({ size = "small" }) => (
  <div className="flex items-center justify-center">
    <div 
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white border-t-transparent`}
    ></div>
  </div>
);

export const InlineLoading = ({ message = "Loading..." }) => (
  <div className="flex items-center space-x-3 p-4">
    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
    <span className="text-gray-600 text-sm">{message}</span>
  </div>
);

export const TableLoading = ({ rows = 3, columns = 4 }) => (
  <div className="animate-pulse">
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b">
        {[...Array(columns)].map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded flex-1"
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export const CardLoading = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const CalendarLoading = () => (
  <div className="animate-pulse p-6">
    <div className="h-8 bg-gray-200 rounded w-48 mb-6 mx-auto"></div>
    <div className="grid grid-cols-7 gap-2 mb-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

// Loading with progress bar
export const ProgressLoading = ({ progress = 0, message = "Loading..." }) => (
  <div className="w-full max-w-md mx-auto p-6">
    <div className="text-center mb-4">
      <div className="w-12 h-12 mx-auto mb-4">
        <div className="w-12 h-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
    
    {progress > 0 && (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    )}
    
    {progress > 0 && (
      <p className="text-center text-sm text-gray-500 mt-2">
        {Math.round(progress)}% complete
      </p>
    )}
  </div>
);

// Error state with retry
export const ErrorLoading = ({ message = "Something went wrong", onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg 
        className="w-8 h-8 text-red-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops!</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

export default Loading;