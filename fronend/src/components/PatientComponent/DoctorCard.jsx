import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, User } from 'lucide-react';

function DoctorCard({ doctor, onViewDetails }) {
  const navigate = useNavigate();

  if (!doctor) {
    return (
      <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;

    if (profileImage.startsWith('http')) {
      return profileImage;
    }

    if (profileImage.startsWith('/')) {
      return `${window.location.origin}${profileImage}`;
    }

    return `${window.location.origin}/media/${profileImage}`;
  };


  const getNextAvailableSlot = () => {
    if (doctor?.next_available_slot) {
      const slot = doctor.next_available_slot;
      if (slot.date && slot.time) {
        if (slot.is_today) {
          return `Today ${slot.time}`;
        } else {
          const date = new Date(slot.date);
          return `${date.toLocaleDateString()} ${slot.time}`;
        }
      }
      if (slot.has_available_slots === false) {
        return 'No available slots';
      }
    }
    return 'Check for availability';
  };




  const profileImageUrl = getProfileImageUrl(doctor?.profile_image);


  const handleViewDetails = () => {
    navigate(`/doctor-details/${doctor.slug}`);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Large Doctor Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`Dr. ${doctor.username}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback avatar */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}
        >
          {doctor?.username ? (
            <span className="text-blue-600 font-bold text-4xl">
              {doctor.username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={60} className="text-blue-600" />
          )}
        </div>



      </div>

      {/* Doctor Information */}
      <div className="p-6">
        {/* Name and Specialization */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-1">
            {`Dr. ${doctor?.username || 'Unknown Doctor'}`}
          </h3>
          <p className="text-blue-600 font-semibold text-base">
            {doctor?.specialization || 'General Practitioner'}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          {doctor?.hospital && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <span className="truncate font-medium">{doctor.hospital}</span>
            </div>
          )}

          {doctor?.experience && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                <Calendar size={16} className="text-green-600" />
              </div>
              <span className="font-medium">{doctor.experience} years experience</span>
            </div>
          )}

          {doctor?.languages && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                <User size={16} className="text-purple-600" />
              </div>
              <span className="font-medium truncate">Languages: {doctor.languages}</span>
            </div>
          )}

        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div>Reg ID: {doctor?.registration_id || 'N/A'}</div>
          <div className="flex items-center space-x-2">
            {doctor?.age && <span>Age: {doctor.age}</span>}
            {doctor?.gender && (
              <>
                {doctor?.age && <span>•</span>}
                <span>{doctor.gender}</span>
              </>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default DoctorCard;