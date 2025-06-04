import React from 'react';
import { useState } from 'react';
import Navbar from '../../components/PatientComponent/Navbar';
import SearchSection from '../../components/PatientComponent/Search';
import FilterSection from '../../components/PatientComponent/Filter';
import DoctorsList from '../../components/PatientComponent/DoctorsLists';
import Footer from '../../components/PatientComponent/Footer';

function DoctorListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    specialization: '',
    country: '',
    rating: '',
    availability: '',
    gender: '',
    experience: ''
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilters({
      specialization: '',
      country: '',
      rating: '',
      availability: '',
      gender: '',
      experience: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <SearchSection
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <FilterSection 
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          onResetFilters={handleResetFilters}
        />
        
        <DoctorsList 
          activeFilters={activeFilters} 
          searchQuery={searchQuery}
        />
      </main>
      <Footer />
    </div>
  );
}

export default DoctorListingPage;