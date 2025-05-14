import React from 'react'
import { FaUserMd, FaGlobe, FaShieldAlt } from 'react-icons/fa'

const AboutSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About DOCNET</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            DOCNET is revolutionizing healthcare delivery by connecting qualified physicians with patients nationwide through our innovative telehealth platform.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-center">
          {/* Left: Image Side */}
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/doctor-about.jpg" 
                alt="Doctor using DOCNET platform" 
                className="w-full h-auto object-cover" 
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">5000+</p>
                  <p className="text-sm">Active Doctors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">98%</p>
                  <p className="text-sm">Satisfaction</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">50+</p>
                  <p className="text-sm">Specialties</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm">Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content Side */}
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Our Mission for Medical Professionals
            </h3>
            <p className="text-gray-600 mb-6">
              Founded by healthcare professionals, DOCNET empowers physicians by removing administrative burdens and connecting them directly with patients who need their expertise. We believe in creating a sustainable healthcare ecosystem where doctors can practice medicine on their own terms.
            </p>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <FaUserMd className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Doctor-Centric Design</h4>
                  <p className="mt-2 text-gray-600">
                    Our platform is built with physician input at every stage, ensuring it supports your workflow rather than disrupting it.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <FaGlobe className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Borderless Practice</h4>
                  <p className="mt-2 text-gray-600">
                    Expand your reach beyond geographic limitations and provide care to patients across the country.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <FaShieldAlt className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Compliance & Security</h4>
                  <p className="mt-2 text-gray-600">
                    Our HIPAA-compliant platform ensures that all patient interactions and data are secure and meet regulatory requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Stats - Only visible on mobile */}
        <div className="grid grid-cols-2 gap-4 mt-10 md:hidden bg-gray-50 p-6 rounded-lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">5000+</p>
            <p className="text-sm text-gray-600">Active Doctors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">98%</p>
            <p className="text-sm text-gray-600">Satisfaction</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">50+</p>
            <p className="text-sm text-gray-600">Specialties</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">24/7</p>
            <p className="text-sm text-gray-600">Support</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection