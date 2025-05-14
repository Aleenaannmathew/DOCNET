import React from 'react'
import { Tab } from '@headlessui/react'
import { 
  FaDesktop, 
  FaClipboardList, 
  FaUserMd, 
  FaStethoscope,
  FaBriefcaseMedical 
} from 'react-icons/fa'

// Note: Headless UI might need to be installed in your project
// This is a simplified version that can be adjusted based on your UI library availability

const FeatureSection = () => {
  const features = [
    {
      name: "Virtual Office",
      icon: <FaDesktop className="h-6 w-6" />,
      description: "Fully equipped digital workspace with HD video conferencing, screen sharing, and digital whiteboard capabilities.",
      image: "/features/virtual-office.jpg",
      highlights: [
        "High-definition video conferencing",
        "Multiple device compatibility",
        "Waiting room management",
        "Patient education tools"
      ]
    },
    {
      name: "Clinical Tools",
      icon: <FaStethoscope className="h-6 w-6" />,
      description: "Specialty-specific clinical tools and resources to support your diagnostic and treatment decisions.",
      image: "/features/clinical-tools.jpg",
      highlights: [
        "Reference materials integration",
        "Specialty-specific templates",
        "Follow-up scheduling",
        "Condition-specific assessments"
      ]
    },
    {
      name: "Documentation",
      icon: <FaClipboardList className="h-6 w-6" />,
      description: "AI-assisted documentation that helps you capture patient information efficiently while maintaining eye contact.",
      image: "/features/documentation.jpg",
      highlights: [
        "Voice-to-text dictation",
        "AI-assisted note completion",
        "Template library",
        "Customizable workflows"
      ]
    },
    {
      name: "Patient Management",
      icon: <FaUserMd className="h-6 w-6" />,
      description: "Comprehensive tools to manage your patient relationships before, during, and after consultations.",
      image: "/features/patient-management.jpg",
      highlights: [
        "Patient history access",
        "Secure messaging",
        "Prescription management",
        "Follow-up coordination"
      ]
    },
    {
      name: "Practice Growth",
      icon: <FaBriefcaseMedical className="h-6 w-6" />,
      description: "Tools and resources to help you expand your practice and grow your professional network.",
      image: "/features/practice-growth.jpg",
      highlights: [
        "Patient matching algorithm",
        "Multi-state licensing support",
        "Practice analytics",
        "Referral network"
      ]
    }
  ]

  // This is a simplified tab implementation - in a real project, you'd use a library like @headlessui/react
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools empowers physicians to deliver exceptional care through telehealth.
          </p>
        </div>

        <div className="mt-8">
          <Tab.Group>
            <Tab.List className="flex flex-wrap justify-center space-x-1 rounded-xl bg-blue-50 p-1">
              {features.map((feature) => (
                <Tab
                  key={feature.name}
                  className={({ selected }) =>
                    `w-full max-w-xs rounded-lg py-3 px-4 text-sm font-medium leading-5 
                    ${selected 
                      ? 'bg-white shadow text-blue-700' 
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                    }`
                  }
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      {feature.icon}
                    </div>
                    <span>{feature.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-8">
              {features.map((feature, idx) => (
                <Tab.Panel
                  key={idx}
                  className="rounded-xl bg-white p-3 shadow-lg ring-1 ring-blue-50 ring-opacity-60"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/2">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.name}</h3>
                      <p className="text-gray-600 mb-6">{feature.description}</p>
                      
                      <ul className="space-y-3">
                        {feature.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:w-1/2">
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        {/* In a real implementation, you'd have actual images */}
                        <div className="bg-gray-200 h-64 w-full flex items-center justify-center">
                          <span className="text-gray-600">Feature Preview Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </section>
  )
}

export default FeatureSection