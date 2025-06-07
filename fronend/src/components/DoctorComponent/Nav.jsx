import React, { useState } from 'react'
import { FaBars, FaTimes, FaUserMd, FaColumns, FaStethoscope, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

const ProfessionalNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { token, user } = useSelector((state) => state.auth || { token: null, user: null })
  const isDoctorAuthenticated = token && user?.role === 'doctor'
  const isDoctorApproved = isDoctorAuthenticated && user?.doctor_profile?.is_approved
  const dashboardPath = isDoctorApproved ? '/doctor/dashboard' : '/doctor/pending-approval'

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' }) // Change this to your actual logout action
    navigate('/doctor/doctor-login')
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl sticky top-0 z-50 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/doctor/doctor-landing" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-blue-600 p-2 rounded-full">
                  <FaUserMd className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
                  DOCNET
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                    PROFESSIONAL
                  </span>
                  <FaStethoscope className="h-3 w-3 text-emerald-400" />
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {['About', 'Benefits', 'Features', 'Testimonials', 'FAQ'].map((item) => (
              <a key={item} href={`/doctor/${item.toLowerCase()}`} className="relative px-4 py-2 text-slate-300 hover:text-white font-medium transition-all duration-300 group">
                <span className="relative z-10">{item}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            ))}

            {isDoctorAuthenticated ? (
              <>
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="ml-4 px-3 py-2 text-white rounded-full hover:bg-slate-700/50 transition-colors"
                  title="Go to Dashboard"
                >
                  <FaUserCircle className="h-6 w-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-6 w-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <a href="/doctor/doctor-login" className="relative px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-medium hover:from-slate-600 hover:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Sign In
                </a>
                <a href="/doctor/doctor-register" className="relative px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transition-all duration-300 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <span className="relative z-10">Join DOCNET</span>
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 focus:outline-none transition-colors"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-2 bg-gradient-to-b from-slate-800 to-slate-900 border-t border-emerald-500/20">
          {['About', 'Benefits', 'Features', 'Testimonials', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`/doctor/${item.toLowerCase()}`}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 rounded-lg font-medium transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}

          <div className="pt-4 flex flex-col space-y-3">
            {isDoctorAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate(dashboardPath)
                  }}
                  className="w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white rounded-lg font-medium shadow-lg transition-all duration-300"
                >
                  <FaUserCircle className="inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium shadow-lg transition-all duration-300"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/doctor/doctor-login" className="w-full text-center px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-medium shadow-lg transition-all duration-300">
                  Sign In
                </a>
                <a href="/doctor/doctor-register" className="w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white rounded-lg font-medium shadow-lg transition-all duration-300">
                  Join DOCNET
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ProfessionalNav
