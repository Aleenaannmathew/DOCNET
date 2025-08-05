import React from 'react';
import ServiceCard from './ServiceCard';

// Using FontAwesome icons - you'll need to install the package or use another icon library
// For this example, let's create placeholder icon components
const HeartbeatIcon = () => <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">❤️</div>;
const BrainIcon = () => <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">🧠</div>;
const BoneIcon = () => <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">🦴</div>;
const BabyIcon = () => <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">👶</div>;
const DoctorIcon = () => <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">👨‍⚕️</div>;

const ServicesSection = () => {
  const services = [
    { 
      name: 'Cardiology', 
      icon: <HeartbeatIcon />, 
      description: 'Expert heart specialists for your cardiovascular needs.' 
    },
    { 
      name: 'Neurology', 
      icon: <BrainIcon />, 
      description: 'Specialized care for neurological conditions and disorders.' 
    },
    { 
      name: 'Orthopaedic', 
      icon: <BoneIcon />, 
      description: 'Advanced treatment for bones, joints, and muscular issues.' 
    },
    { 
      name: 'Gynecology', 
      icon: <BabyIcon />, 
      description: 'Comprehensive womens health and prenatal care.' 
    },
    { 
      name: 'Dermatology', 
      icon: <DoctorIcon />, 
      description: 'Specialized treatment for all skin conditions and concerns.' 
    },
  ];

  return (
    <section id="services" className="py-16 px-6 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
          Services of Clinical Excellence
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Our specialized departments are staffed with experienced professionals dedicated to your health.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service) => (
            <ServiceCard 
              key={service.name}
              name={service.name}
              icon={service.icon}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
