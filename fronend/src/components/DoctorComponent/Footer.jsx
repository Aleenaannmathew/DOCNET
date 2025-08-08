import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FaFacebookSquare, 
  FaTwitterSquare, 
  FaLinkedin, 
  FaYoutubeSquare,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <FaUserMd className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">DOCNET</span>
              <span className="text-xs ml-1 mt-1 bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full">MD</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting physicians to patients nationwide through our innovative telehealth platform.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaFacebookSquare size={24} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaTwitterSquare size={24} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaLinkedin size={24} />
              </a>
              <a href="https://youtube.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaYoutubeSquare size={24} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/doctor/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/doctor/how-it-works" className="text-gray-400 hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/doctor/specialties" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Specialties
                </Link>
              </li>
              <li>
                <Link to="/doctor/testimonials" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/doctor/faq" className="text-gray-400 hover:text-blue-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/doctor/blog" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Join & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Join & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/doctor/register" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Apply to Join
                </Link>
              </li>
              <li>
                <Link to="/doctor/login" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/doctor/resources" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Provider Resources
                </Link>
              </li>
              <li>
                <Link to="/doctor/support" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link to="/doctor/platform-updates" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Platform Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <span className="text-gray-400">
                  123 Medical Center Drive<br />
                  Suite 500<br />
                  San Francisco, CA 94107
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="h-5 w-5 text-blue-400 mr-3" />
                <a href="tel:+18005551234" className="text-gray-400 hover:text-blue-400 transition-colors">
                  1-800-555-1234
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-blue-400 mr-3" />
                <a href="mailto:doctors@docnet.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                  doctors@docnet.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; {currentYear} DOCNET Medical Network. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <Link to="/doctor/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/doctor/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/doctor/accessibility" className="hover:text-blue-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer