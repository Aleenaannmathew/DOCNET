import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Phone, Mail, User, Heart } from 'lucide-react';

function DoctorCard({ doctor, onViewDetails }) {
  const navigate = useNavigate();

  if (!doctor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">Loading doctor information...</div>
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

  const profileImageUrl = getProfileImageUrl(doctor?.profile_image);

  const handleViewDetails = () => {
    navigate(`/doctor-details/${doctor.slug}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full relative">
   

      {/* Large Doctor Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`Dr. ${doctor.username}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback avatar */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}
          style={{ display: profileImageUrl ? 'none' : 'flex' }}
        >
          {doctor?.username ? (
            <span className="text-teal-700 font-bold text-6xl">
              {doctor.username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={80} className="text-teal-700" />
          )}
        </div>

        {/* Available indicator */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Available Today
          </span>
        </div>
      </div>

      {/* Doctor Information */}
      <div className="p-4">
        {/* Name and Specialization */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {`Dr. ${doctor?.username || 'Unknown Doctor'}`}
          </h3>
          <p className="text-teal-600 font-medium text-base">
            {doctor?.specialization || 'General Practitioner'}
          </p>
        </div>

        {/* Rating */}
        {doctor?.rating && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex mr-2">
              {renderStars(doctor.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {doctor.rating} ({doctor.total_reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {doctor?.hospital && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-3 text-teal-600 flex-shrink-0" />
              <span className="truncate">{doctor.hospital}</span>
            </div>
          )}
          
          {doctor?.experience && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-3 text-teal-600 flex-shrink-0" />
              <span>{doctor.experience} years experience</span>
            </div>
          )}

          {doctor?.languages && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Languages:</span> {doctor.languages}
            </div>
          )}

          {/* Next available slot */}
          <div className="text-sm text-green-600 font-medium">
            Next available: Today 2:00 PM
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex items-center justify-center space-x-3 mb-3">
          {doctor?.phone && (
            <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
              <Phone size={18} />
            </button>
          )}
          {doctor?.email && (
            <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
              <Mail size={18} />
            </button>
          )}
          <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
            <User size={18} />
          </button>
          <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
            <MapPin size={18} />
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 text-center mb-3">
          <span>Reg ID: {doctor?.registration_id || 'N/A'}</span>
          {doctor?.age && <span> • Age: {doctor.age}</span>}
          {doctor?.gender && <span> • {doctor.gender}</span>}
        </div>

        {/* View Details Button */}
        <button 
          onClick={handleViewDetails}
          className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-semibold text-center"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default DoctorCard;