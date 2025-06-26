import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Calendar, UserCircle, Heart, MessageCircle } from 'lucide-react';
import { logout } from '../../store/authSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a path is active
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Function to get navigation link classes
  const getNavLinkClasses = (path) => {
    const baseClasses = "font-medium transition-colors duration-200";
    if (isActivePath(path)) {
      return `${baseClasses} text-blue-600 border-b-2 border-blue-600`;
    }
    return `${baseClasses} text-gray-600 hover:text-blue-600`;
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogout = async () => {
      try{
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await userAxios.post('/logout/', {
            refresh: refreshToken
          });
        }
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
  
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login')
      }
    }
  const handleProfileClick = () => {
    navigate('/user-profile');
    setIsProfileMenuOpen(false);
  };


  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DOCNET
          </h1>
          <div className="hidden lg:flex items-center text-sm text-blue-600 ml-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Trusted by 2M+ patients worldwide</span>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className={getNavLinkClasses('/')}>Home</a>
          <a href="#services" className={getNavLinkClasses('/services')}>Services</a>
          <a href="/doctor-list" className={getNavLinkClasses('/doctor-list')}>Doctors</a>
          <a href="/about" className={getNavLinkClasses('/about')}>About</a>
          <a href="/contact" className={getNavLinkClasses('/contact')}>Contact</a>
          <a href="/blog" className={getNavLinkClasses('/blog')}>Blog</a>
        </div>
        
        {/* Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 relative profile-menu-container">
              {/* User Profile Section */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                      <User size={20} className="text-blue-600" />
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{user?.username || user?.name || "User"}</span>
                </button>
                
                {/* Message Button */}
                <button 
                 
                  className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                  title="Messages"
                >
                  <MessageCircle size={20} />
                </button>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <UserCircle size={18} />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/change-password');
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={handleLoginClick}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200 px-4 py-2"
              >
                Sign In
              </button>
              <button 
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="px-6 py-4 space-y-4">
              <a href="/" className={`block ${getNavLinkClasses('/')}`}>Home</a>
              <a href="#services" className={`block ${getNavLinkClasses('/services')}`}>Services</a>
              <a href="/doctor-list" className={`block ${getNavLinkClasses('/doctor-list')}`}>Doctors</a>
              <a href="/about" className={`block ${getNavLinkClasses('/about')}`}>About</a>
              <a href="/contact" className={`block ${getNavLinkClasses('/contact')}`}>Contact</a>
              <a href="/blog" className={`block ${getNavLinkClasses('/blog')}`}>Blog</a>
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{user?.username || user?.name || "User"}</span>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left text-gray-600 hover:text-blue-600 font-medium"
                  >
                    View Profile
                  </button>
                  <button
                  
                    className="block w-full text-left text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Messages
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button 
                    onClick={handleLoginClick}
                    className="block w-full text-left text-blue-600 font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleRegisterClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium w-full"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;