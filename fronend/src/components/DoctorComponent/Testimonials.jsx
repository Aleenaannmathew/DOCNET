import React, { useState } from 'react'
import { 
  FaQuoteLeft, 
  FaChevronLeft, 
  FaChevronRight,
  FaStar,
  FaUserMd,
  FaStethoscope,
  FaHeart,
  FaBrain,
  FaEye
} from 'react-icons/fa'

const PremiumTestimonialsSection = () => {
  const testimonials = [
    {
      quote: "DOCNET has completely transformed my practice. I can now see patients from across the country while maintaining my own schedule. The platform is intuitive and their support team is exceptional. The AI-assisted documentation alone has saved me hours every week.",
      name: "Dr. Sarah Johnson",
      title: "Cardiologist",
      specialty: "Cardiology",
      specialtyIcon: <FaHeart className="h-5 w-5" />,
      rating: 5,
      avatar: "SJ",
      location: "San Francisco, CA",
      experience: "15+ years"
    },
    {
      quote: "As a specialist, I was concerned about the transition to telehealth. DOCNET made it seamless with their specialty-specific tools and exceptional patient matching. I've actually expanded my practice significantly and now serve patients I never could have reached before.",
      name: "Dr. Michael Chen",
      title: "Neurologist", 
      specialty: "Neurology",
      specialtyIcon: <FaBrain className="h-5 w-5" />,
      rating: 5,
      avatar: "MC",
      location: "Boston, MA",
      experience: "12+ years"
    },
    {
      quote: "The AI-assisted documentation has reduced my administrative time by 60%. I can focus on patient care instead of paperwork. The scheduling flexibility allows me to practice medicine on my own terms while maintaining the highest quality of care.",
      name: "Dr. Emily Rodriguez",
      title: "Family Physician",
      specialty: "Family Medicine",
      specialtyIcon: <FaUserMd className="h-5 w-5" />,
      rating: 5,
      avatar: "ER",
      location: "Austin, TX",
      experience: "8+ years"
    },
    {
      quote: "DOCNET's platform has revolutionized how I connect with patients. The virtual office feels as natural as my physical practice, and the integrated clinical tools make every consultation more effective. It's the future of healthcare delivery.",
      name: "Dr. James Wilson",
      title: "Ophthalmologist",
      specialty: "Ophthalmology", 
      specialtyIcon: <FaEye className="h-5 w-5" />,
      rating: 5,
      avatar: "JW",
      location: "Miami, FL",
      experience: "20+ years"
    }
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const currentDoc = testimonials[currentTestimonial]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mb-8">
            <span className="text-emerald-700 font-semibold text-lg">Success Stories</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-700 bg-clip-text text-transparent">
              Transforming Healthcare
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
              One Doctor at a Time
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Discover how leading physicians across the nation are revolutionizing their practice with DOCNET Professional.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
              <div className="bg-gradient-to-br from-emerald-500 via-blue-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-lg">{currentDoc.avatar}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{currentDoc.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-emerald-100">{currentDoc.specialtyIcon}</div>
                        <span className="text-emerald-100 font-medium">{currentDoc.specialty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <div className="flex items-center justify-end space-x-1 mb-1">
                      {[...Array(currentDoc.rating)].map((_, i) => (
                        <FaStar key={i} className="h-4 w-4 text-yellow-300" />
                      ))}
                    </div>
                    <p className="text-emerald-100 text-sm">{currentDoc.experience}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-12">
                <div className="mb-8">
                  <FaQuoteLeft className="h-12 w-12 text-emerald-500 mb-6 opacity-50" />
                  <p className="text-xl text-slate-700 leading-relaxed italic font-medium">
                    "{currentDoc.quote}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-emerald-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{currentDoc.name}</h4>
                    <p className="text-emerald-600 font-medium">{currentDoc.title}</p>
                    <p className="text-slate-500 text-sm">{currentDoc.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full">
                      <span className="text-emerald-700 font-semibold text-sm">Verified Doctor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center mt-12 space-x-8">
            <button 
              onClick={prevTestimonial}
              className="group w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-emerald-100"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            </button>
            
            <div className="flex space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 scale-125' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextTestimonial}
              className="group w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-emerald-100"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaUserMd className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-slate-800 mb-2">15,000+</h4>
              <p className="text-slate-600 font-medium">Active Physicians</p>
            </div>
            <div className="text-center group">
              <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaStar className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-slate-800 mb-2">4.9/5</h4>
              <p className="text-slate-600 font-medium">Average Rating</p>
            </div>
            <div className="text-center group">
              <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaStethoscope className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-slate-800 mb-2">150+</h4>
              <p className="text-slate-600 font-medium">Medical Specialties</p>
            </div>
            <div className="text-center group">
              <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaHeart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-slate-800 mb-2">99.2%</h4>
              <p className="text-slate-600 font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-12 text-white backdrop-blur-sm border border-emerald-500/30">
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-6">Join Our Growing Community</h3>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Experience the future of healthcare delivery and transform your practice today. Join thousands of physicians who trust DOCNET Professional.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">Apply Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="px-8 py-4 border-2 border-emerald-400 text-emerald-400 rounded-xl font-semibold text-lg hover:bg-emerald-400 hover:text-slate-800 transition-all duration-300">
                  Read More Stories
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PremiumTestimonialsSection