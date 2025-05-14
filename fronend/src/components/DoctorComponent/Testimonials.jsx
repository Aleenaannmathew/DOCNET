import React, { useState } from 'react'
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "DOCNET has completely transformed my practice. I can now see patients from across the country while maintaining my own schedule. The platform is intuitive and their support team is exceptional.",
      name: "Dr. Sarah Johnson",
      title: "Cardiologist",
      specialty: "Cardiology",
      avatar: "/avatars/doctor1.jpg"
    },
    {
      quote: "As a specialist, I was concerned about the transition to telehealth. DOCNET made it seamless with their specialty-specific tools and exceptional patient matching. I've actually expanded my practice significantly.",
      name: "Dr. Michael Chen",
      title: "Neurologist",
      specialty: "Neurology",
      avatar: "/avatars/doctor2.jpg"
    },
    {
      quote: "The AI-assisted documentation has reduced my administrative time by 60%. I can focus on patient care instead of paperwork. The scheduling flexibility allows me to practice medicine on my own terms.",
      name: "Dr. Emily Rodriguez",
      title: "Family Physician",
      specialty: "Family Medicine",
      avatar: "/avatars/doctor3.jpg"
    }
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Doctors Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from physicians who have transformed their practice with DOCNET.
          </p>
        </div>

        <div className="relative">
          {/* Testimonial Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                  {/* In a real implementation, you'd use an actual image */}
                  <span className="text-blue-800 font-bold text-xl">
                    {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-blue-600 mb-4">
                  <FaQuoteLeft size={24} />
                </div>
                <p className="text-gray-800 text-lg mb-6 italic">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-blue-600">
                    {testimonials[currentTestimonial].title} • {testimonials[currentTestimonial].specialty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={prevTestimonial}
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-50 transition-colors duration-200"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-blue-600" />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-50 transition-colors duration-200"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-blue-600" />
            </button>
          </div>
        </div>

        {/* Join Banner */}
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-8 mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Join Thousands of Satisfied Physicians</h3>
          <p className="mb-6 max-w-3xl mx-auto">
            Experience the future of healthcare delivery and transform your practice today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/doctor/register" 
              className="bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              Apply Now
            </a>
            <a 
              href="/doctor/testimonials" 
              className="bg-transparent border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition duration-300"
            >
              Read More Testimonials
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection