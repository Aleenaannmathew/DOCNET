import React, { useState, useEffect } from 'react';
import { Heart, Activity, Users, TrendingUp, Clock, MessageCircle, Share2, BookOpen, Search, Bell, User, Menu, X, Calendar, Eye, ThumbsUp } from 'lucide-react';
import Navbar from './Navbar';

const HealthcareBlog = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveStats, setLiveStats] = useState({
    patientsServed: 2847632,
    activeDoctors: 15420,
    consultationsToday: 8934,
    averageResponseTime: 4.2
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate real-time data updates
      setLiveStats(prev => ({
        patientsServed: prev.patientsServed + Math.floor(Math.random() * 3),
        activeDoctors: 15420 + Math.floor(Math.random() * 100 - 50),
        consultationsToday: prev.consultationsToday + Math.floor(Math.random() * 2),
        averageResponseTime: +(4.2 + (Math.random() * 0.6 - 0.3)).toFixed(1)
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "Revolutionary AI Diagnostics: The Future of Healthcare is Here",
      excerpt: "Discover how artificial intelligence is transforming medical diagnostics, reducing error rates by 40% and improving patient outcomes worldwide.",
      author: "Dr. Sarah Chen",
      date: "2025-06-19",
      readTime: "8 min read",
      views: 12543,
      likes: 892,
      comments: 67,
      category: "Technology",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
      featured: true
    },
    {
      id: 2,
      title: "Telemedicine: Breaking Barriers in Rural Healthcare Access",
      excerpt: "How digital health solutions are bringing specialist care to underserved communities, connecting patients with doctors across continents.",
      author: "Dr. Michael Rodriguez",
      date: "2025-06-18",
      readTime: "6 min read",
      views: 8921,
      likes: 634,
      comments: 43,
      category: "Digital Health",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Mental Health in the Digital Age: Apps vs. Traditional Therapy",
      excerpt: "Exploring the effectiveness of digital mental health interventions and their role in supplementing traditional therapeutic approaches.",
      author: "Dr. Emily Watson",
      date: "2025-06-17",
      readTime: "10 min read",
      views: 15782,
      likes: 1203,
      comments: 128,
      category: "Mental Health",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Personalized Medicine: Tailoring Treatment to Your DNA",
      excerpt: "The rise of genomic medicine and how genetic testing is revolutionizing treatment plans for cancer, cardiovascular disease, and rare conditions.",
      author: "Dr. James Liu",
      date: "2025-06-16",
      readTime: "12 min read",
      views: 9876,
      likes: 567,
      comments: 89,
      category: "Genomics",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop"
    }
  ];

  const categories = ["All", "Technology", "Digital Health", "Mental Health", "Genomics", "Research", "Policy"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar/>
      {/* Real-time Stats Bar */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <div className="hidden sm:block">
                {currentTime.toLocaleTimeString()} IST
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{liveStats.patientsServed.toLocaleString()}+ patients served</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>{liveStats.activeDoctors.toLocaleString()} doctors online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{liveStats.averageResponseTime}min avg response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Healthcare <span className="text-blue-600">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay informed with the latest breakthroughs in medical research, technology innovations, 
              and healthcare trends from leading experts worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{liveStats.consultationsToday.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Consultations Today</div>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
                <div className="text-2xl font-bold text-green-600">98.7%</div>
                <div className="text-sm text-gray-600">Patient Satisfaction</div>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">150+</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Featured Post */}
          {filteredPosts.find(post => post.featured) && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={filteredPosts.find(post => post.featured).image} 
                    alt={filteredPosts.find(post => post.featured).title}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {filteredPosts.find(post => post.featured).category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(filteredPosts.find(post => post.featured).date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{filteredPosts.find(post => post.featured).readTime}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {filteredPosts.find(post => post.featured).title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {filteredPosts.find(post => post.featured).excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {filteredPosts.find(post => post.featured).author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {filteredPosts.find(post => post.featured).author}
                        </div>
                        <div className="text-sm text-gray-500">Medical Expert</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{filteredPosts.find(post => post.featured).views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{filteredPosts.find(post => post.featured).likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{filteredPosts.find(post => post.featured).comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {["AI in Medicine", "Telemedicine Growth", "Mental Health Tech", "Precision Medicine", "Digital Therapeutics"].map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{topic}</span>
                    <span className="text-sm text-blue-600 font-medium">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Regular Posts Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.filter(post => !post.featured).map(post => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-xs">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{post.author}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{(post.views / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold">DOCNET</span>
              </div>
              <p className="text-gray-400 text-sm">
                Trusted by 2M+ patients worldwide for reliable healthcare information and services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white">About Us</a></div>
                <div><a href="#" className="hover:text-white">Services</a></div>
                <div><a href="#" className="hover:text-white">Doctors</a></div>
                <div><a href="#" className="hover:text-white">Contact</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white">Health Blog</a></div>
                <div><a href="#" className="hover:text-white">Research</a></div>
                <div><a href="#" className="hover:text-white">News</a></div>
                <div><a href="#" className="hover:text-white">Guidelines</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>24/7 Support Available</div>
                <div>HIPAA Compliant</div>
                <div>Global Coverage</div>
                <div>Emergency Care</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 DOCNET. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HealthcareBlog;