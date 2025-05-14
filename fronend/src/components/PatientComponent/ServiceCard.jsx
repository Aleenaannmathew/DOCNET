import React from 'react';

const ServiceCard = ({ name, icon, description }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-4 text-center">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{name}</h3>
      <p className="text-gray-600 text-center text-sm">{description}</p>
    </div>
  );
};

export default ServiceCard;
