import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const FAQSection = () => {
  const faqs = [
    {
      question: "What qualifications do I need to join DOCNET?",
      answer: "We accept board-certified physicians in all specialties. You must be licensed to practice medicine in at least one US state, have an active unrestricted medical license, and carry professional liability insurance. Additional state licenses can help expand your patient base."
    },
    {
      question: "How does scheduling work?",
      answer: "You have complete control over your schedule. Set your availability in our platform calendar, and patients can only book during your designated hours. You can block time off, set recurring availability, and adjust your schedule at any time."
    },
    {
      question: "How am I compensated for consultations?",
      answer: "DOCNET offers competitive compensation based on consultation duration and specialty. Physicians are paid on a per-visit basis, with payments processed twice monthly. We handle all billing and insurance details so you can focus on patient care."
    },
    {
      question: "What technology do I need to get started?",
      answer: "You'll need a computer with a webcam (or high-quality tablet), a reliable high-speed internet connection, and a quiet, private, well-lit space for consultations. Our platform works in modern browsers without requiring special software installation."
    },
    {
      question: "How does DOCNET handle malpractice insurance?",
      answer: "While DOCNET doesn't provide malpractice insurance, we partner with select carriers offering discounted rates for telemedicine coverage. You'll need to maintain your own professional liability insurance that covers telehealth services."
    },
    {
      question: "Can I prescribe medications through DOCNET?",
      answer: "Yes, you can prescribe medications through our integrated e-prescription system in accordance with state regulations. Controlled substances have additional restrictions per federal regulations and may not be available for prescription in all cases."
    },
    {
      question: "How does licensing work across multiple states?",
      answer: "You can practice in any state where you hold a valid medical license. DOCNET provides optional licensing support services to help you obtain licenses in additional states through the Interstate Medical Licensure Compact when eligible."
    },
    {
      question: "What support does DOCNET provide to physicians?",
      answer: "We offer 24/7 technical support, clinical and operational training, continuing education opportunities, and a dedicated physician success manager. Our physician community also provides peer support and networking."
    }
  ]

  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null)
    } else {
      setOpenFaq(index)
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about joining DOCNET as a healthcare provider.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center p-4 md:p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaq === index ? (
                  <FaChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <FaChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </button>
              
              {openFaq === index && (
                <div className="p-4 md:p-6 pt-0 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Don't see your question here?</p>
          <a 
            href="/doctor/contact" 
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Contact Our Physician Support Team
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQSection