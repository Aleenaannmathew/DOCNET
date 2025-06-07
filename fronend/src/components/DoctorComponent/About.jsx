import React from 'react'
import { 
  FaGlobe,
  FaShieldAlt,
  FaDesktop,
  FaUserMd,
  FaStethoscope,
  FaAward,
  FaUsers,
  FaChartLine
} from 'react-icons/fa'

// Complete Professional About Section
const CompleteProfessionalAbout = () => {
  const achievements = [
    { number: "15,000+", label: "Active Professionals", icon: <FaUsers className="h-6 w-6" /> },
    { number: "99.2%", label: "Satisfaction Rate", icon: <FaAward className="h-6 w-6" /> },
    { number: "150+", label: "Medical Specialties", icon: <FaStethoscope className="h-6 w-6" /> },
    { number: "24/7", label: "Global Support", icon: <FaGlobe className="h-6 w-6" /> }
  ]

  const keyFeatures = [
    {
      icon: <FaGlobe className="h-8 w-8" />,
      title: "Global Healthcare Network",
      description: "Connect with patients worldwide through our secure, HIPAA-compliant platform that breaks down geographical barriers while maintaining the highest standards of medical care.",
      gradient: "from-emerald-500 to-blue-600"
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Enterprise-Grade Security",
      description: "Built with military-grade encryption and comprehensive compliance frameworks including HIPAA, SOC 2, and international privacy standards for complete peace of mind.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <FaDesktop className="h-8 w-8" />,
      title: "Intuitive Clinical Interface",
      description: "Experience seamless workflow integration with AI-powered tools designed specifically for healthcare professionals, featuring specialty-specific templates and smart documentation.",
      gradient: "from-purple-500 to-pink-600"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mb-8">
            <span className="text-emerald-700 font-semibold text-lg">About DOCNET Professional</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-700 bg-clip-text text-transparent">
              Pioneering the Future
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
              of Healthcare
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            DOCNET Professional represents the evolution of medical practice, where cutting-edge technology meets clinical excellence to create unprecedented opportunities for healthcare professionals worldwide.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center mb-20">
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
              <div className="bg-gradient-to-br from-emerald-500 via-blue-600 to-emerald-600 p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="text-center group">
                      <div className="inline-block p-3 bg-white/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white">
                          {achievement.icon}
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-1">{achievement.number}</p>
                      <p className="text-emerald-100 text-sm font-medium">{achievement.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-72 bg-gradient-to-br from-slate-100 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block p-6 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                    <FaUserMd className="h-16 w-16 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">Professional Excellence</h4>
                  <p className="text-slate-600 font-medium">Transforming Healthcare Delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-8">
            <h3 className="text-4xl font-bold text-slate-800 leading-tight">
              Empowering Healthcare Professionals Through Innovation
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Since our founding, DOCNET has been at the forefront of healthcare technology innovation. We've built a comprehensive platform that not only meets the current needs of medical professionals but anticipates the future of healthcare delivery.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our mission extends beyond providing technology—we're creating a global community of healthcare professionals who share our vision of accessible, high-quality medical care for everyone, everywhere.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Advanced Clinical Integration</h4>
                  <p className="text-slate-600">Seamlessly integrate with existing workflows and EHR systems</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Continuous Innovation</h4>
                  <p className="text-slate-600">Regular platform updates based on physician feedback and industry trends</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Professional Development</h4>
                  <p className="text-slate-600">Ongoing education and skill enhancement opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center text-slate-800 mb-16">
            What Sets DOCNET Apart
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className={`inline-block p-4 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </h4>
                  
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Statement */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-12 text-white backdrop-blur-sm border border-emerald-500/30">
            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mb-8">
                <FaChartLine className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold mb-6">Our Vision for Healthcare</h3>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
                We envision a world where exceptional healthcare is accessible to everyone, regardless of location or circumstance. Through DOCNET Professional, we're building the infrastructure that makes this vision a reality, one consultation at a time.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-emerald-300 mb-2">Innovation</h4>
                  <p className="text-slate-300">Continuously advancing healthcare technology</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-300 mb-2">Excellence</h4>
                  <p className="text-slate-300">Maintaining the highest standards of care</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-emerald-300 mb-2">Accessibility</h4>
                  <p className="text-slate-300">Making quality healthcare universally available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompleteProfessionalAbout