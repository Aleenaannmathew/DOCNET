import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa'

const ProfessionalFAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: "What are the requirements to join DOCNET as a physician?",
      answer: "To join DOCNET, you must be a licensed physician in good standing with your state medical board, have completed residency training, maintain current malpractice insurance, and have experience in clinical practice. We welcome physicians from all specialties and career stages."
    },
    {
      question: "How does the application and onboarding process work?",
      answer: "Our streamlined process includes: 1) Online application with credential verification, 2) Virtual interview with our medical team, 3) Technical platform training (2-3 hours), 4) Practice sessions with mock patients, and 5) Go-live support. Most physicians are seeing patients within 7-10 business days of approval."
    },
    {
      question: "What technology do I need to practice on DOCNET?",
      answer: "You need a computer or tablet with HD camera and microphone, reliable high-speed internet (minimum 10 Mbps), and a quiet, private space for consultations. We provide all software, training, and technical support. The platform works on Windows, Mac, iOS, and Android devices."
    },
    {
      question: "How much can I earn and when do I get paid?",
      answer: "Compensation varies by specialty and consultation type, with transparent rates disclosed upfront. Most physicians earn $100-300+ per consultation. Payments are processed weekly via direct deposit, with detailed earnings statements provided through your dashboard."
    },
    {
      question: "What types of patients and conditions can I treat?",
      answer: "You can treat a wide range of conditions appropriate for telemedicine within your specialty and scope of practice. This includes follow-up care, medication management, preventive care, chronic disease management, and many acute conditions. Our platform provides guidelines for appropriate telemedicine cases."
    },
    {
      question: "Do you provide malpractice insurance coverage?",
      answer: "DOCNET provides comprehensive malpractice insurance coverage for all telehealth consultations conducted through our platform at no cost to physicians. This coverage is in addition to your existing malpractice insurance and provides peace of mind for remote consultations."
    },
    {
      question: "Can I practice across state lines?",
      answer: "Yes, with proper licensing. We support multi-state practice through compact state agreements and can assist with licensing in additional states. Our compliance team ensures you're always practicing within legal boundaries and helps streamline the multi-state licensing process."
    },
    {
      question: "How flexible is the schedule? Are there minimum hour requirements?",
      answer: "DOCNET offers complete scheduling flexibility with absolutely no minimum hour requirements. You can work as little or as much as you want, set your own availability, take breaks whenever needed, and even practice seasonally. Many physicians use our platform to supplement their existing practice."
    },
    {
      question: "What support is available for technical issues or clinical questions?",
      answer: "We provide 24/7 technical support, dedicated clinical support team, peer consultation network, continuing education resources, and regular platform updates. Our support team includes both technical experts and experienced physicians who understand the unique challenges of telemedicine."
    },
    {
      question: "How does prescription management work?",
      answer: "Our platform integrates with major pharmacy networks and e-prescribing systems. You can send prescriptions directly to the patient's preferred pharmacy, access prescription history, check drug interactions, and manage controlled substance prescriptions in compliance with state and federal regulations."
    }
  ]

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mb-8">
            <span className="text-emerald-700 font-semibold text-lg flex items-center">
              <FaQuestionCircle className="mr-2" />
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-700 bg-clip-text text-transparent">
              Everything You Need to Know
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Get answers to the most common questions about joining DOCNET as a healthcare professional.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300"
              >
                <span className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700">
                  {faq.question}
                </span>
                <div className={`ml-4 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                  {activeIndex === index ? (
                    <FaChevronUp className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <FaChevronDown className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-500 ${
                activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-6">
                  <div className="pt-2 border-t border-emerald-100">
                    <p className="text-slate-600 leading-relaxed mt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl p-10 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
              Our physician support team is here to help you every step of the way. Get personalized answers to your specific questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/doctor/contact" 
                className="group px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center"
              >
                Contact Support Team
              </a>
              <a 
                href="/doctor/demo" 
                className="group px-8 py-4 bg-emerald-600/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-emerald-600/30 transition-all duration-300 flex items-center justify-center"
              >
                Schedule 1-on-1 Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfessionalFAQSection