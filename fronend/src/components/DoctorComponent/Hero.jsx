import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarCheck, FaStethoscope } from 'react-icons/fa'

const ProfessionalHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl animate-ping"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full border border-emerald-500/30">
                <span className="text-emerald-300 font-medium">Advance Your Medical Career</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                  Transform Healthcare
                </span>
                <br />
                <span className="text-white">Through Innovation</span>
              </h1>
            </div>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              Join DOCNET's elite network of healthcare professionals and revolutionize patient care through our cutting-edge telehealth platform designed for medical excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/doctor/register" className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative z-10 mr-2">Join as Professional</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/doctor/demo" className="group px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-emerald-500/30 text-white rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center">
                <FaCalendarCheck className="mr-2" />
                Request Demo
              </a>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 p-8 rounded-2xl shadow-2xl border border-emerald-500/20 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-xl text-slate-800">
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mb-4">
                      <FaStethoscope className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      DOCNET PROFESSIONAL
                    </h3>
                    <p className="text-slate-600 font-medium">Advanced Healthcare Platform</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      'Global Patient Network Access',
                      'AI-Powered Clinical Tools',
                      'Seamless EHR Integration',
                      'Advanced Telemedicine Suite',
                      'Professional Development Hub',
                      'Specialized Consultation Tools'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center group">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></div>
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfessionalHero