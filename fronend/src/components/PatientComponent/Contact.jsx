import React, { useState } from 'react';
import { Heart, Mail, MapPin, Clock, MessageCircle, Shield, Users, Headphones, Send, CheckCircle, Globe, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import { userAxios } from '../../axios/UserAxios';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await userAxios.post("/contact/", formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      console.error("Unexpected response:", response);
      alert("Form submission failed. Please try again.");
    }
  } catch (error) {
    console.error("Submission error:", error.response?.data || error);
    alert("An error occurred. Please check your form and try again.");
  }
};

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get detailed responses to your queries',
      contact: 'support@docnet.com',
      subtext: 'Response within 2-4 hours',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant support for urgent matters',
      contact: 'Available 24/7',
      subtext: 'Average response: 2 minutes',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Headphones,
      title: 'Video Support',
      description: 'Face-to-face technical assistance',
      contact: 'Schedule a call',
      subtext: 'Available Mon-Fri, 9AM-6PM PST',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const supportCategories = [
    {
      icon: Users,
      title: 'Patient Support',
      description: 'Help with consultations, appointments, and medical records',
      email: 'patients@docnet.com'
    },
    {
      icon: Shield,
      title: 'Technical Support',
      description: 'Platform issues, connectivity, and technical troubleshooting',
      email: 'tech@docnet.com'
    },
    {
      icon: Heart,
      title: 'Medical Inquiries',
      description: 'Questions about treatments, prescriptions, and medical advice',
      email: 'medical@docnet.com'
    },
    {
      icon: Globe,
      title: 'Partnership',
      description: 'Healthcare providers, institutions, and business partnerships',
      email: 'partnerships@docnet.com'
    }
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      address: '123 Healthcare Ave, Suite 400',
      zipcode: 'CA 94105, USA',
      isHeadquarters: true
    },
    {
      city: 'New York',
      address: '456 Medical Plaza, Floor 12',
      zipcode: 'NY 10001, USA',
      isHeadquarters: false
    },
    {
      city: 'London',
      address: '789 Wellness Street, Unit 5',
      zipcode: 'SW1A 1AA, UK',
      isHeadquarters: false
    },
    {
      city: 'Singapore',
      address: '321 Health Hub, Level 8',
      zipcode: '018956, Singapore',
      isHeadquarters: false
    }
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
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Our dedicated support team is here to help you 24/7. Whether you need technical assistance, 
              medical guidance, or have questions about our services, we're just a message away.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                <span>HIPAA Compliant Communications</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-500" />
                <span>Global Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help You?</h2>
            <p className="text-lg text-gray-600">Choose the support method that works best for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border group cursor-pointer">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="text-lg font-semibold text-blue-600 mb-2">{method.contact}</div>
                  <div className="text-sm text-gray-500">{method.subtext}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Support Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="patient">Patient Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="medical">Medical Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Please describe your inquiry in detail..."
                    required
                  ></textarea>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Medical Emergency Notice</p>
                      <p>If you're experiencing a medical emergency, please call your local emergency services immediately. This form is not monitored for urgent medical situations.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message Sent Successfully!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Support Categories */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Specialized Support</h2>
              <p className="text-gray-600 mb-8">
                Connect directly with our specialized teams for faster, more targeted assistance.
              </p>
              <div className="space-y-6">
                {supportCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border group">
                      <div className="flex items-start">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                          <p className="text-gray-600 mb-3">{category.description}</p>
                          <a 
                            href={`mailto:${category.email}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            {category.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Global Presence</h2>
            <p className="text-lg text-gray-600">We're here to serve you from multiple locations worldwide</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4 group-hover:shadow-lg transition-shadow border">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {office.city}
                    {office.isHeadquarters && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">HQ</span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {office.address}<br />
                    {office.zipcode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Still Have Questions?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Check out our comprehensive FAQ section or start a live chat with our support team. 
            We're committed to providing you with the answers you need, when you need them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              View FAQ
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Live Chat
            </button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">&lt; 2 min</div>
              <div className="text-blue-100">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Support Availability</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;