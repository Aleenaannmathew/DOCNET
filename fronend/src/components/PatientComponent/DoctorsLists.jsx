import React, { useEffect, useState } from 'react';
import { Filter, Loader } from 'lucide-react';
import DoctorCard from './DoctorCard';
import { userAxios } from '../../axios/UserAxios';

function DoctorsList({ activeFilters, searchQuery }) {  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('-experience');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        
        // Add search query
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        // Add filters
        if (activeFilters.specialization) {
          params.append('specialization', activeFilters.specialization);
        }

        if (activeFilters.country) {
          params.append('country', activeFilters.country);
        }

        if (activeFilters.gender) {
          params.append('gender', activeFilters.gender);
        }

        if (activeFilters.experience) {
          params.append('experience', activeFilters.experience);
        }

        if (activeFilters.availability) {
          params.append('availability', activeFilters.availability);
        }

        params.append('only_available', 'true');

        // Add sorting
        if (sortBy) {
          params.append('ordering', sortBy);
        }

        const response = await userAxios.get(`/doctors-list/?${params.toString()}`);
        setDoctors(response.data.results || response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctors');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchQuery, activeFilters, sortBy]);

  // Client-side filtering for complex filters like rating
  const filteredDoctors = doctors.filter(doctor => {
    // Rating filter 
    if (activeFilters.rating) {
      const requiredRating = parseInt(activeFilters.rating.split(' ')[0]);
      if (doctor.rating && doctor.rating < requiredRating) return false;
    }
    
    return true;
  });

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const resetFilters = () => {
   
    if (window.confirm('Reset all filters?')) {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <section className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-teal-700" size={32} />
        <span className="ml-2 text-gray-600">Loading doctors...</span>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-700">Error loading doctors: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 font-medium hover:text-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-700">
          {filteredDoctors.length} active doctors found
        </h2>
        <div className="flex items-center">
          <Filter size={16} className="mr-2" />
          <span className="mr-2">Sort by:</span>
          <select 
            className="border border-gray-300 rounded-md p-2"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="-experience">Most Experienced</option>
            <option value="experience">Least Experienced</option>
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
          </select>
        </div>
      </div>

      {/* Reduced gap from gap-6 to gap-4 and removed max-width constraint */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-500 mb-4">
              No active doctors found matching your criteria.
            </p>
            <button 
              onClick={resetFilters}
              className="text-teal-700 font-medium hover:text-teal-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DoctorsList;