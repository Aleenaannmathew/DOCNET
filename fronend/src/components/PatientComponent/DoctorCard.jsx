import React from 'react';

const DoctorCard = ({ name, specialty, imageUrl }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <img
        src={imageUrl}
        alt={`Dr. ${name}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-600 text-sm">{specialty}</p>
        <div className="mt-4 flex justify-center">
          <button className="text-teal-700 border border-teal-700 hover:bg-teal-50 font-medium px-4 py-2 rounded-md text-sm transition-colors duration-300">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;