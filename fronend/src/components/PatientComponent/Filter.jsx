import React from 'react';
import { Calendar, ChevronDown, MapPin, Star, User } from 'lucide-react';

// Single filter dropdown component
function FilterOption({ label, options, value, onChange, icon }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <select
        className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl appearance-none bg-white focus:border-blue-500 focus:outline-none transition-all duration-200 font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute top-4 right-4 text-gray-400 pointer-events-none" size={20} />
    </div>
  );
}

function FilterSection({ activeFilters, setActiveFilters, onResetFilters }) {
  const specializations = ['Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Oncology'];
  const countries = ['Canada', 'United Kingdom', 'Australia', 'United States', 'Germany'];
  const ratings = ['5 Stars', '4+ Stars', '3+ Stars'];
  const availabilities = ['Available today', 'Next 3 days', 'This week'];

  const handleFilterChange = (filterName, value) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: value
    });
  };

  return (
    <section className="mb-12">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Doctor</h2>
          <button 
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FilterOption
            label="Specialization"
            options={specializations}
            value={activeFilters.specialization}
            onChange={(value) => handleFilterChange('specialization', value)}
            icon={<User size={18} />}
          />
          <FilterOption
            label="Country"
            options={countries}
            value={activeFilters.country}
            onChange={(value) => handleFilterChange('country', value)}
            icon={<MapPin size={18} />}
          />
          <FilterOption
            label="Rating"
            options={ratings}
            value={activeFilters.rating}
            onChange={(value) => handleFilterChange('rating', value)}
            icon={<Star size={18} />}
          />
          <FilterOption
            label="Availability"
            options={availabilities}
            value={activeFilters.availability}
            onChange={(value) => handleFilterChange('availability', value)}
            icon={<Calendar size={18} />}
          />
        </div>
      </div>
    </section>
  );
}
export default FilterSection;