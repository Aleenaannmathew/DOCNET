import React from 'react';
import { Heart, Shield, Clock, Users, Award, Globe, CheckCircle, Star } from 'lucide-react';
import Navbar from './Navbar';

const About = () => {
  const stats = [
    { icon: Users, value: '2M+', label: 'Trusted Patients' },
    { icon: Award, value: '15K+', label: 'Medical Professionals' },
    { icon: Heart, value: '98%', label: 'Patient Satisfaction' },
    { icon: Clock, value: '24/7', label: 'Available Support' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'HIPAA-compliant platform with end-to-end encryption ensuring your medical data remains completely secure and confidential.'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Connecting patients worldwide with certified healthcare professionals, breaking down geographical barriers to quality care.'
    },
    {
      icon: Clock,
      title: 'Real-Time Care',
      description: 'Instant consultations, live monitoring, and immediate medical support whenever you need it most.'
    },
    {
      icon: Heart,
      title: 'Patient-Centered',
      description: 'Every feature designed with patient comfort, convenience, and health outcomes as our primary focus.'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'DOCNET was established with a vision to revolutionize healthcare accessibility.' },
    { year: '2021', title: 'First 100K Patients', description: 'Reached our first major milestone during the global health crisis.' },
    { year: '2022', title: 'AI Integration', description: 'Launched AI-powered diagnostic assistance and symptom analysis.' },
    { year: '2023', title: '1M+ Consultations', description: 'Completed over one million successful patient consultations.' },
    { year: '2024', title: 'Global Expansion', description: 'Extended services to 50+ countries with 24/7 multilingual support.' }
  ];

  const certifications = [
    'HIPAA Compliant',
    'ISO 27001 Certified',
    'FDA Approved Devices',
    'GDPR Compliant',
    'SOC 2 Type II'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar/>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">DOCNET</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              We're revolutionizing healthcare by making quality medical consultations accessible to everyone, 
              anywhere, anytime. Our AI-powered platform connects patients with certified healthcare professionals 
              for comprehensive, secure, and personalized medical care.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map((cert, index) => (
                <span key={index} className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl leading-relaxed mb-8 text-blue-100">
                To democratize healthcare by providing instant access to quality medical consultations, 
                breaking down barriers of distance, time, and cost that prevent people from receiving 
                the care they deserve.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">Accessible healthcare for everyone</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">AI-powered diagnostic assistance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">24/7 medical support worldwide</span>
                </div>
              </div>
            </div>
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
              <p className="text-xl leading-relaxed mb-8 text-blue-100">
                To create a world where geography, time zones, and economic barriers never prevent 
                someone from accessing life-saving medical care and expert health guidance.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" />
                  <span className="font-semibold">Patient Testimonial</span>
                </div>
                <p className="text-blue-100 italic">
                  "DOCNET saved my life. When I couldn't reach a doctor during the pandemic, 
                  their platform connected me with a specialist who diagnosed my condition immediately."
                </p>
                <p className="text-sm text-blue-200 mt-2">- Sarah M., California</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything we do is guided by these fundamental principles that ensure the best possible 
              healthcare experience for our patients and partners.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border group">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From a small startup to a global healthcare platform trusted by millions
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-purple-600"></div>
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'} ml-16 md:ml-0`}>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Healthcare Reimagined?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join millions of patients who trust DOCNET for their healthcare needs. 
            Get started with your first consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center">
              <Heart className="w-5 h-5 mr-2" />
              Book Consultation
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
              Watch Demo
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center space-x-8 text-gray-400">
            <span className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              HIPAA Compliant
            </span>
            <span className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              24/7 Support
            </span>
            <span className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certified Doctors
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;