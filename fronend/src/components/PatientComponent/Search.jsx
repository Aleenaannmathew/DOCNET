import React from 'react';
import { Calendar, Heart, Play, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SearchSection({ searchQuery, setSearchQuery }) {

  const navigate = useNavigate();

  const handleEmergencyClick = () => {
    navigate('/emergency-consultation');
  };
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Find the Right <span className="text-blue-600">Doctor</span> for You
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with qualified healthcare professionals in your area.
                Book appointments, read reviews, and get the care you deserve.
              </p>
            </div>

            {/* Search Bar */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for doctors, specializations, or symptoms..."
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-white hover:shadow-md transition-all duration-200">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Book Appointment</span>
                </button>
                <button
                  onClick={handleEmergencyClick}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-white hover:shadow-md transition-all duration-200">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Emergency Care</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full hover:bg-white hover:shadow-md transition-all duration-200">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Find Specialist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white ml-1" />
              </div>

              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick Consultation</h3>
                      <p className="text-sm text-gray-600">Get advice in 15 minutes</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-purple-400 rounded-full opacity-40"></div>
            <div className="absolute top-1/2 -left-8 w-6 h-6 bg-pink-400 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;