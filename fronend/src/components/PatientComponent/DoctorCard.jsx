import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Phone, Mail, User, Heart, Clock } from 'lucide-react';

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

  const getAvailabilityBadge = () => {
  if (!doctor?.next_available_slot) {
    return {
      text: 'Loading availability...',
      className: 'bg-gray-500 text-white',
      icon: <Clock size={12} className="mr-2" />
    };
  }

  const slot = doctor.next_available_slot;
  
  if (slot.has_available_slots === false) {
    return {
      text: 'No Slots Available',
      className: 'bg-gray-500 text-white',
      icon: <Clock size={12} className="mr-2" />
    };
  }

  if (slot.is_today) {
    return {
      text: 'Available Today',
      className: 'bg-green-500 text-white',
      icon: <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
    };
  }

  if (slot.days_from_now === 1) {
    return {
      text: 'Available Tomorrow',
      className: 'bg-blue-500 text-white',
      icon: <Clock size={12} className="mr-2" />
    };
  }

  if (slot.days_from_now <= 7) {
    return {
      text: `Available in ${slot.days_from_now} days`,
      className: 'bg-yellow-500 text-white',
      icon: <Clock size={12} className="mr-2" />
    };
  }

  return {
    text: 'Available Soon',
    className: 'bg-orange-500 text-white',
    icon: <Clock size={12} className="mr-2" />
  };
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


  const getAvailabilityDisplayInfo = () => {
    if (doctor?.next_available_slot) {
      const slot = doctor.next_available_slot;
      
      if (slot.is_today) {
        return {
          text: getNextAvailableSlot(),
          className: 'bg-green-50 border-green-200 text-green-700',
          showAsAvailable: true
        };
      } else if (slot.days_from_now <= 7) {
        return {
          text: getNextAvailableSlot(),
          className: 'bg-blue-50 border-blue-200 text-blue-700',
          showAsAvailable: true
        };
      } else {
        return {
          text: getNextAvailableSlot(),
          className: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          showAsAvailable: true
        };
      }
    }
    
    return {
      text: 'Contact for availability',
      className: 'bg-gray-50 border-gray-200 text-gray-700',
      showAsAvailable: false
    };
  };

  const profileImageUrl = getProfileImageUrl(doctor?.profile_image);
  const availabilityBadge = getAvailabilityBadge();
  const availabilityInfo = getAvailabilityDisplayInfo();

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

        {/* Available indicator */}
        <div className="absolute top-4 left-4">
          <span className={`${availabilityBadge.className} text-xs px-3 py-1 rounded-full font-medium flex items-center`}>
            {availabilityBadge.icon}
            {availabilityBadge.text}
          </span>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
          <Heart size={18} className="text-gray-400 hover:text-red-500 transition-colors duration-200" />
        </button>
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

        {/* Rating */}
        {doctor?.rating && (
          <div className="flex items-center justify-center mb-4 bg-yellow-50 rounded-lg py-2">
            <div className="flex mr-2">
              {renderStars(doctor.rating)}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {doctor.rating} ({doctor.total_reviews || 0} reviews)
            </span>
          </div>
        )}

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

          {/* Next available slot - Always shown */}
          <div className={`${availabilityInfo.className} border rounded-lg p-3`}>
            <div className="text-sm font-semibold text-center">
              {availabilityInfo.showAsAvailable ? 'Next available: ' : ''}{availabilityInfo.text}
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex space-x-2 mb-4">
          {doctor?.phone && (
            <button className="flex-1 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center">
              <Phone size={18} />
            </button>
          )}
          {doctor?.email && (
            <button className="flex-1 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center">
              <Mail size={18} />
            </button>
          )}
          <button className="flex-1 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center">
            <Calendar size={18} />
          </button>
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