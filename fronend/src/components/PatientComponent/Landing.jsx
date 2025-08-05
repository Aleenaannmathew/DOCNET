import React, { useState, useEffect } from 'react';
import {
  Play,
  Shield,
  Clock,
  Users,
  Heart,
  Brain,
  Activity,
  Star,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Video,
  MessageCircle,
  Stethoscope,
  Award,
  TrendingUp,
  Globe,
  Smartphone
} from 'lucide-react';
import consultationVideo from "../../assets/consultation.mp4";
import Navbar from './Navbar';
import Footer from './Footer';
import { userAxios } from '../../axios/UserAxios';

const TelehealthLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [doctors, setDoctors] = useState([]);


  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await userAxios.get('active-doctors/');
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const testimonials = [
    {
      text: "As a busy executive, having access to top specialists without travel time is invaluable. The AI health insights are incredibly accurate.",
      author: "Michael Chen",
      role: "Executive",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      text: "The virtual reality therapy sessions helped me overcome my anxiety. The technology feels like the future of mental healthcare.",
      author: "Emma Rodriguez",
      role: "Mental Health Patient",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "2M+", label: "Patients Served", icon: <Users className="w-6 h-6" /> },
    { number: "15K+", label: "Medical Professionals", icon: <Stethoscope className="w-6 h-6" /> },
    { number: "98%", label: "Patient Satisfaction", icon: <Heart className="w-6 h-6" /> },
    { number: "24/7", label: "Support Available", icon: <Clock className="w-6 h-6" /> }
  ];

  const services = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Virtual Consultations",
      description: "Connect with board-certified doctors via HD video calls from anywhere in the world"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Health Insights",
      description: "Advanced AI analyzes your health data to provide personalized recommendations"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Remote Monitoring",
      description: "Continuous health tracking with IoT devices and real-time alerts"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Instant Messaging",
      description: "Secure chat with healthcare providers for quick questions and follow-ups"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "AI-powered appointment scheduling that adapts to your lifestyle"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "HIPAA Compliant",
      description: "Military-grade encryption ensures your health data remains private and secure"
    }
  ];

  const specialties = [
    { name: "Cardiology", color: "from-red-500 to-pink-500", icon: <Heart className="w-6 h-6" /> },
    { name: "Neurology", color: "from-purple-500 to-indigo-500", icon: <Brain className="w-6 h-6" /> },
    { name: "Dermatology", color: "from-yellow-500 to-orange-500", icon: <Activity className="w-6 h-6" /> },
    { name: "Mental Health", color: "from-green-500 to-teal-500", icon: <Users className="w-6 h-6" /> },
    { name: "Pediatrics", color: "from-blue-500 to-cyan-500", icon: <Star className="w-6 h-6" /> },
    { name: "General Medicine", color: "from-gray-500 to-slate-500", icon: <Stethoscope className="w-6 h-6" /> }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Award className="w-4 h-4" />
                  <span>Trusted by 2M+ patients worldwide</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Healthcare
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the future of healthcare with AI-powered consultations,
                  real-time monitoring, and world-class medical professionals available 24/7.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Book Consultation</span>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2 text-blue-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Main Hero Image */}
              <div className="relative z-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                <video
                  className="w-full h-80 object-cover rounded-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={consultationVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Consultation</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-500">Heart Rate</div>
                      <div className="text-lg font-bold text-gray-900">72 BPM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Decorations */}
              <div className="absolute top-10 -left-10 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered diagnostics to virtual reality therapy, we offer cutting-edge
              medical services designed for the digital age.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>

                {/* Hover effect decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Medical Specialties
            </h2>
            <p className="text-xl text-gray-600">
              Connect with specialists across all major medical fields
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`bg-gradient-to-r ${specialty.color} p-6 rounded-2xl text-white text-center transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <div className="flex justify-center mb-3">
                    {specialty.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{specialty.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Top-Rated Specialists
            </h2>
            <p className="text-xl text-gray-600">
              Board-certified doctors with decades of experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="relative mb-6">
                  {doctor.profile_image ? (
                    <img
                      src={doctor.profile_image}
                      alt={`Dr. ${doctor.username}`}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.initials-fallback').style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-24 h-24 rounded-full mx-auto bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300 initials-fallback ${doctor.profile_image ? 'hidden' : 'flex'}`}
                  >
                    <span className="text-2xl font-bold text-blue-600">
                      {doctor.username.split(' ').map(name => name[0]).join('')}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Dr. {doctor.username}</h3>
                  <p className="text-blue-600 font-medium mb-1">{doctor.specialization}</p>
                  {doctor.hospital && (
                    <p className="text-sm text-gray-500 mb-3">{doctor.hospital}</p>
                  )}

                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">4.9</span>
                    </div>
                    <div className="text-sm text-gray-500">{doctor.experience}+ years</div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-full font-medium hover:shadow-lg transition-all duration-200">
                    Book Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Patient Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real patients
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].text}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {testimonials[activeTestimonial].author}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeTestimonial
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join millions of patients who have chosen DOCNET for better,
              more accessible healthcare. Your health journey starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Download App</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Try Web App</span>
              </button>
            </div>

            <div className="mt-8 text-blue-100 text-sm">
              ✓ No setup fees  ✓ Cancel anytime  ✓ 30-day money back guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TelehealthLanding;
