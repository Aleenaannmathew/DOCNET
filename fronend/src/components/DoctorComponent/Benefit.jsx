import React from 'react'
import { 
  FaCalendarAlt, 
  FaLaptopMedical, 
  FaMoneyBillWave, 
  FaUserClock,
  FaChartLine,
  FaFileAlt
} from 'react-icons/fa'

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <FaCalendarAlt className="h-6 w-6 text-blue-600" />,
      title: "Flexible Scheduling",
      description: "Set your own hours and maintain work-life balance. Practice medicine on your terms with no minimum hour requirements."
    },
    {
      icon: <FaLaptopMedical className="h-6 w-6 text-blue-600" />,
      title: "Seamless Technology",
      description: "Our intuitive platform requires minimal training. HD video, integrated EHR, and prescription services at your fingertips."
    },
    {
      icon: <FaMoneyBillWave className="h-6 w-6 text-blue-600" />,
      title: "Competitive Compensation",
      description: "Transparent fee structure with no hidden costs. Get paid for your time and expertise, not administrative tasks."
    },
    {
      icon: <FaUserClock className="h-6 w-6 text-blue-600" />,
      title: "Reduced Admin Burden",
      description: "Our team handles scheduling, billing, and patient acquisition so you can focus on providing quality care."
    },
    {
      icon: <FaChartLine className="h-6 w-6 text-blue-600" />,
      title: "Practice Growth",
      description: "Expand your practice without overhead costs. Reach more patients across multiple states with our licensing support."
    },
    {
      icon: <FaFileAlt className="h-6 w-6 text-blue-600" />,
      title: "Simplified Documentation",
      description: "AI-assisted note-taking and documentation tools that adapt to your specialty, saving valuable time."
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits For Medical Professionals</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join DOCNET and experience a new way to practice medicine - one that prioritizes your time, expertise, and well-being.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to transform your practice?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of physicians who have discovered the freedom and flexibility of telemedicine with DOCNET.
            </p>
            <a 
              href="/doctor/register" 
              className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Apply to Join Our Network
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection