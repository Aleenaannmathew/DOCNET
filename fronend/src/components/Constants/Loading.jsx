import React from 'react';

export default function DocnetLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-teal-700 font-bold text-4xl">DOCNET</h1>
        <p className="text-gray-600 mt-2">Your health journey in progress...</p>
      </div>
      
      {/* Loading spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 border-4 border-teal-100 rounded-full"></div>
        
        {/* Spinning element */}
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-700 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* Loading text */}
      <div className="mt-6 text-gray-700">
        <p className="text-center">Loading your medical information...</p>
      </div>
    </div>
  );
}