import React from 'react';
import docImg from '../../assets/bc.jpg'
import docImg2 from '../../assets/doc2.jpg'

const AboutSection = () => {

  
  return (
    <section className="py-16 px-6 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Image container with positioning */}
        <div className="w-full md:w-1/2 relative h-96 md:h-auto">
          <div className="h-full max-w-md mx-auto md:mx-0">
            {/* Background image */}
            <img
              src={docImg}
              alt="Doctor"
              className="w-full h-auto rounded-xl shadow-md object-cover"
            />
            {/* Foreground overlapping image */}
            <img
              src={docImg2}
              alt="Doctor consultation"
              className="w-3/5 h-auto rounded-xl shadow-lg absolute top-1/2 left-0 md:-left-10 transform -translate-y-1/2 z-10 hidden sm:block"
            />
          </div>
        </div>
        
        {/* Text content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
            Virtual Care And Better Health Solutions For Our Patients
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              We value every human life placed in our hands and constantly work
              towards meeting the expectations of our patients.
            </p>
            <p>
              Our telehealth platform connects patients with board-certified
              healthcare providers for virtual consultations, prescriptions, and
              follow-ups. We're committed to making healthcare accessible,
              convenient, and personalized.
            </p>
            <p>
              With state-of-the-art technology and a team of dedicated specialists,
              we provide comprehensive care across multiple medical disciplines,
              ensuring you receive the attention you deserve without leaving your
              home.
            </p>
          </div>
          <button className="mt-8 bg-teal-700 hover:bg-teal-800 text-white py-3 px-6 rounded-lg transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;