import React from 'react'
import { 
  FaCalendarAlt, 
  FaLaptopMedical, 
  FaMoneyBillWave, 
  FaUserClock,
  FaChartLine,
  FaFileAlt,
  FaArrowRight
} from 'react-icons/fa'

const ProfessionalBenefitsSection = () => {
  const benefits = [
    {
      icon: <FaCalendarAlt className="h-8 w-8" />,
      title: "Ultimate Scheduling Flexibility",
      description: "Design your perfect work-life balance with complete control over your schedule. No minimum hours, no rigid requirements—just professional freedom.",
      gradient: "from-emerald-500 to-blue-600"
    },
    {
      icon: <FaLaptopMedical className="h-8 w-8" />,
      title: "Next-Generation Technology",
      description: "Experience seamless healthcare delivery with our intuitive platform featuring 4K video, AI-powered EHR integration, and advanced clinical tools.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <FaMoneyBillWave className="h-8 w-8" />,
      title: "Premium Compensation Model",
      description: "Transparent, competitive rates with immediate payment processing. Earn what you deserve for your expertise without hidden fees or deductions.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <FaUserClock className="h-8 w-8" />,
      title: "Zero Administrative Burden",
      description: "Focus exclusively on patient care while our dedicated team manages scheduling, billing, insurance verification, and patient acquisition.",
      gradient: "from-pink-500 to-red-600"
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: "Exponential Practice Growth",
      description: "Scale your practice nationwide without overhead costs. Multi-state licensing support and patient matching algorithms fuel your growth.",
      gradient: "from-red-500 to-orange-600"
    },
    {
      icon: <FaFileAlt className="h-8 w-8" />,
      title: "Intelligent Documentation",
      description: "Revolutionary AI-powered clinical documentation that learns your preferences, reducing paperwork by up to 70% while maintaining accuracy.",
      gradient: "from-orange-500 to-emerald-600"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full border border-emerald-500/30 mb-8">
            <span className="text-emerald-300 font-semibold text-lg">Professional Advantages</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
              Revolutionize Your
            </span>
            <br />
            <span className="text-white">Medical Practice</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Discover why leading healthcare professionals choose DOCNET to advance their careers and transform patient care through innovative technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`inline-block p-4 bg-gradient-to-r ${benefit.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {benefit.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-200 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-12 border border-emerald-500/30 backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Practice?
              </h3>
              <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join over 15,000 physicians who have discovered the freedom, flexibility, and financial rewards of practicing with DOCNET's professional platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a 
                  href="/doctor/register" 
                  className="group relative px-10 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <span className="relative z-10 mr-3">Apply to Join Our Elite Network</span>
                  <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="/doctor/demo" 
                  className="group px-10 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-emerald-500/30 text-white rounded-xl font-semibold hover:bg-slate-700/50 hover:border-emerald-400/50 transition-all duration-300 flex items-center justify-center"
                >
                  Schedule Personal Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfessionalBenefitsSection