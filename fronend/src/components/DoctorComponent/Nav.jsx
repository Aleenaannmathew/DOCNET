import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserMd, FaColumns } from 'react-icons/fa'
import { useSelector } from 'react-redux'

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { token, user } = useSelector(state => state.auth)
  
  // Check if user is authenticated as a doctor
  const isDoctorAuthenticated = token && user?.role === 'doctor'
  // Check if doctor is approved
  const isDoctorApproved = isDoctorAuthenticated && user?.doctor_profile?.is_approved
  
  // Determine dashboard redirect path based on approval status
  const dashboardPath = isDoctorApproved 
    ? '/doctor/dashboard' 
    : '/doctor/pending-approval'

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/doctor/doctor-landing" className="flex items-center">
              <FaUserMd className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-blue-800">DOCNET</span>
              <span className="text-xs ml-1 mt-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">MD</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/doctor/about" className="text-gray-700 hover:text-blue-600 font-medium">
              About
            </Link>
            <Link to="/doctor/benefits" className="text-gray-700 hover:text-blue-600 font-medium">
              Benefits
            </Link>
            <Link to="/doctor/features" className="text-gray-700 hover:text-blue-600 font-medium">
              Features
            </Link>
            <Link to="/doctor/testimonials" className="text-gray-700 hover:text-blue-600 font-medium">
              Testimonials
            </Link>
            <Link to="/doctor/faq" className="text-gray-700 hover:text-blue-600 font-medium">
              FAQ
            </Link>
            
            {/* Conditional rendering based on authentication status */}
            {isDoctorAuthenticated ? (
              <Link 
                to={dashboardPath} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
              >
                <FaColumns className="mr-2" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/doctor/doctor-login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  to="/doctor/doctor-register" 
                  className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-300"
                >
                  Join DOCNET
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/doctor/about"
            className="block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/doctor/benefits"
            className="block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Benefits
          </Link>
          <Link
            to="/doctor/features"
            className="block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            to="/doctor/testimonials"
            className="block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Testimonials
          </Link>
          <Link
            to="/doctor/faq"
            className="block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
          
          {/* Conditional rendering for mobile view */}
          <div className="mt-4 flex flex-col space-y-2">
            {isDoctorAuthenticated ? (
              <Link
                to={dashboardPath}
                className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaColumns className="mr-2" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/doctor/doctor-login"
                  className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/doctor/doctor-register"
                  className="w-full text-center bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join DOCNET
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav