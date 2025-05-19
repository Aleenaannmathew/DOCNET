import React from 'react';
import { ChevronDown } from 'lucide-react';

// Single filter dropdown component
function FilterOption({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select
        className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white"
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
      <ChevronDown className="absolute top-3 right-3 text-gray-400" size={20} />
    </div>
  );
}

function FilterSection({ activeFilters, setActiveFilters }) {
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
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <FilterOption
          label="Specialization"
          options={specializations}
          value={activeFilters.specialization}
          onChange={(value) => handleFilterChange('specialization', value)}
        />
        <FilterOption
          label="Country"
          options={countries}
          value={activeFilters.country}
          onChange={(value) => handleFilterChange('country', value)}
        />
        <FilterOption
          label="Rating"
          options={ratings}
          value={activeFilters.rating}
          onChange={(value) => handleFilterChange('rating', value)}
        />
        <FilterOption
          label="Availability"
          options={availabilities}
          value={activeFilters.availability}
          onChange={(value) => handleFilterChange('availability', value)}
        />
      </div>
    </section>
  );
}

export default FilterSection;