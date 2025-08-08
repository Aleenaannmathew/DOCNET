import React from 'react';
import DoctorCard from './DoctorCard';
import cardiologistImg from "../../assets/doctor1.jpg";
import dermatologistImg from "../../assets/doc.jpg";
import neurologistImg from "../../assets/doc2.jpg";
import pediatricianImg from "../../assets/doc3.jpg";

const DoctorsSection = () => {
  const doctors = [
    {
    name: 'Dr. Jacob John',
    specialty: 'Cardiologist',
    imageUrl: cardiologistImg
  },
  {
    name: 'Dr. Maria Smith',
    specialty: 'Dermatologist',
    imageUrl: neurologistImg
  },
  {
    name: 'Dr. Alex Wong',
    specialty: 'Neurologist',
    imageUrl: dermatologistImg
  },
  {
    name: 'Dr. Priya Verma',
    specialty: 'Pediatrician',
    imageUrl: pediatricianImg
  }
  ];

  return (
    <section id="doctors" className="py-16 px-6 md:px-10 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
          Meet Our Expert Doctors
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Our team of experienced medical professionals is dedicated to providing you with the best care possible.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard 
              key={doctor.name}
              name={doctor.name}
              specialty={doctor.specialty}
              imageUrl={doctor.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;