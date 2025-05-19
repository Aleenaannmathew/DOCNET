import React from 'react';
import { Filter } from 'lucide-react';
import DoctorCard from './DoctorCard';

function DoctorsList({ activeFilters }) {
  // Mock data - in real app this would be fetched from an API
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Thomson',
      specialization: 'Cardiology',
      country: 'Canada',
      rating: 5,
    },
    {
      id: 2,
      name: 'Dr. James Wilson',
      specialization: 'Dermatology',
      country: 'Australia',
      rating: 4,
    },
    {
      id: 3,
      name: 'Dr. Emily Jobson',
      specialization: 'Pediatrics',
      country: 'United Kingdom',
      rating: 5,
    },
    {
      id: 4,
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      country: 'Canada',
      rating: 4,
    },
    {
      id: 5,
      name: 'Dr. Sophia Rodriguez',
      specialization: 'Cardiology',
      country: 'United States',
      rating: 5,
    },
    {
      id: 6,
      name: 'Dr. Robert Kim',
      specialization: 'Oncology',
      country: 'Australia',
      rating: 3,
    },
  ];

  // Filter doctors based on active filters
  const filteredDoctors = doctors.filter(doctor => {
    if (activeFilters.specialization && doctor.specialization !== activeFilters.specialization) return false;
    if (activeFilters.country && doctor.country !== activeFilters.country) return false;
    if (activeFilters.rating) {
      const requiredRating = parseInt(activeFilters.rating.split(' ')[0]);
      if (doctor.rating < requiredRating) return false;
    }
    return true;
  });

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-700">
          {filteredDoctors.length} doctors found
        </h2>
        <div className="flex items-center">
          <Filter size={16} className="mr-2" />
          <span className="mr-2">Sort by:</span>
          <select className="border border-gray-300 rounded-md p-2">
            <option>Highest Rated</option>
            <option>Nearest</option>
            <option>Earliest Available</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
          <button className="mt-4 text-teal-700 font-medium">Reset Filters</button>
        </div>
      )}
    </section>
  );
}

export default DoctorsList;