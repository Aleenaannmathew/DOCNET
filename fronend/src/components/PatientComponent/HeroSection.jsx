import React from 'react';
import landingImg from '../../assets/landing_page.jpg';

const HeroSection = () => {
  // In a real app, you would import this or use a proper image URL
  
  
  return (
    <section 
      className="bg-cover bg-center h-[70vh] flex items-center justify-center text-white p-6 md:p-16"
      style={{ backgroundImage: `url(${landingImg})` }}
    >
      <div className="text-center max-w-4xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          Most Trusted Health Partner For Your Life
        </h1>
        <p className="text-lg md:text-xl mb-8">
          We connect you to the best doctors anytime, anywhere.
        </p>
        <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 shadow-lg">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;