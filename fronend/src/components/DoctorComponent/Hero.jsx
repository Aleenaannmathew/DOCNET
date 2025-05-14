import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarCheck } from 'react-icons/fa'

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="absolute inset-0 bg-[url('/doctor-hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Expand Your Practice With Telehealth Excellence
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Join DOCNET's network of verified specialists and grow your practice through our state-of-the-art telehealth platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/doctor/register"
                className="bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center justify-center"
              >
                Join as Doctor <FaArrowRight className="ml-2" />
              </Link>
              <Link
                to="/doctor/demo"
                className="bg-transparent border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center justify-center"
              >
                Request Demo <FaCalendarCheck className="ml-2" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-md">
              <div className="bg-blue-50 p-6 rounded-lg text-blue-800">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-2xl">DOCNET Platform</h3>
                  <p className="text-blue-600">For Medical Professionals</p>
                </div>
                <ul className="space-y-3">
                  {[
                    'Serve patients nationwide',
                    'Flexible scheduling on your terms',
                    'Secure HIPAA-compliant platform',
                    'Streamlined documentation',
                    'Transparent compensation model',
                    'Professional community access'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection