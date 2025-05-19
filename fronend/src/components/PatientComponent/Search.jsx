import React from 'react';
import { Search } from 'lucide-react';

function SearchSection({ searchQuery, setSearchQuery }) {
  return (
    <section className="mb-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">SEARCH DOCTORS</h1>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Doctors"
            className="w-full p-3 border border-gray-300 rounded-md pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute top-3 left-3 text-gray-400" size={20} />
        </div>
        <button className="bg-teal-700 text-white py-3 px-6 rounded-md hover:bg-teal-800 transition-colors">
          search
        </button>
      </div>
    </section>
  );
}

export default SearchSection;