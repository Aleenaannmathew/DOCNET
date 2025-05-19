import React from 'react';
import { MapPin, Star, Calendar } from 'lucide-react';

function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col items-center">
        <img
          src={`/api/placeholder/150/150`}
          alt={doctor.name}
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
        <h3 className="font-bold text-gray-800">{doctor.name}</h3>
        <p className="text-gray-600 mb-1">{doctor.specialization}</p>
        <div className="flex items-center mb-2">
          <MapPin size={16} className="text-gray-500 mr-1" />
          <span className="text-gray-500">{doctor.country}</span>
        </div>
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className={index < doctor.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
      </div>
      <button className="mt-auto bg-teal-700 text-white py-2 px-4 hover:bg-teal-800 transition-colors mx-4 mb-4 rounded-md flex items-center justify-center">
        <Calendar size={16} className="mr-2" />
        Book Appointment
      </button>
    </div>
  );
}

export default DoctorCard;