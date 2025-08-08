import React from 'react';
import { useState } from 'react';
import Navbar from '../../components/PatientComponent/Navbar';
import SearchSection from '../../components/PatientComponent/Search';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <main>
        <SearchSection
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          
          <DoctorsList 
            activeFilters={activeFilters} 
            searchQuery={searchQuery}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default DoctorListingPage;