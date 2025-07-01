import React, { useState, useEffect } from 'react';
import { Search, Heart, Clock, Phone, AlertCircle } from 'lucide-react';
import EmergencyDoctorCard from './EmergencyCard';
import Navbar from './Navbar';
import Footer from './Footer';
import { userAxios } from '../../axios/UserAxios';

function EmergencyConsultationPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    gender: '',
  });

  // ✅ Fetch function using internal state
  const fetchEmergencyDoctors = async () => {
    setLoading(true);
    setError(null);

    try {

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (filters.specialization) {
        params.append('specialization', filters.specialization);
      }

      if (filters.gender) {
        params.append('gender', filters.gender);
      }
      const response = await userAxios.get('/emergency-doctors/');
      setDoctors(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong');
      console.error('Error fetching emergency doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Call fetch on initial load and whenever filters/search change
  useEffect(() => {
    fetchEmergencyDoctors();
  }, [searchQuery, filters]);

  const handlePaymentSuccess = (paymentData) => {
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      specialization: '',
      gender: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading emergency doctors...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      <Navbar />

      {/* Emergency Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart size={32} className="text-white" />
            <h1 className="text-4xl font-bold">Emergency Consultation</h1>
          </div>
          <p className="text-xl text-red-100 mb-6">
            Get immediate medical assistance from qualified doctors available 24/7
          </p>

          <div className="flex justify-center gap-8 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <Clock size={24} className="mx-auto mb-2" />
              <div className="font-semibold">2-5 min</div>
              <div className="text-sm text-red-100">Response Time</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Phone size={24} className="mx-auto mb-2" />
              <div className="font-semibold">24/7</div>
              <div className="text-sm text-red-100">Available</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Heart size={24} className="mx-auto mb-2" />
              <div className="font-semibold">{doctors.length}</div>
              <div className="text-sm text-red-100">Online Doctors</div>
            </div>
          </div>
        </div>
      </section>


      {/* Emergency Notice */}
      <section className="py-4 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800">
            <strong>Emergency Notice:</strong> For life-threatening emergencies, please call your local emergency services immediately.
          </p>
        </div>
      </section>

      {/* Doctors List */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 mb-4">Error loading emergency doctors: {error}</p>
                <button
                  onClick={fetchEmergencyDoctors}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {doctors.length} Emergency Doctors Available
                </h2>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">All doctors online now</span>
                </div>
              </div>

              {doctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {doctors.map((doctor) => (
                    <EmergencyDoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Emergency Doctors Available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No doctors match your current search criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EmergencyConsultationPage;
