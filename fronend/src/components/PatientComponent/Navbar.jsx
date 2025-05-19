import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Calendar, UserCircle } from 'lucide-react';
import { logout } from '../../store/authSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Get auth state from Redux
  const { token, user } = useSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Handle navigation to login page
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Handle navigation to register page
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  // Stop propagation to prevent menu from closing when clicking menu items
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-teal-700 font-bold text-2xl">DOCNET</h1>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <NavLink href="/" label="Home" />
          <NavLink href="#services" label="Services" />
          <NavLink href="/doctor-list" label="Doctors" />
          <NavLink href="#about" label="About" />
          <NavLink href="#contact" label="Contact" />
          <NavLink href="#blog" label="Blog" />
        </div>
        
        {/* Login/Register buttons or User Profile Icon */}
        <div className="hidden md:flex space-x-4">
          {isAuthenticated ? (
            <div className="relative" onClick={handleMenuClick}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(user?.role === 'doctor' ? '/doctor/dashboard' : '/user-profile');
                }}
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-700"
              >
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User size={18} className="text-teal-700" />
                  </div>
                )}
                <span className="font-medium">{user?.username || "User"}</span>
              </button>
              
              {/* Profile Dropdown */}
              {isProfileMenuOpen && (Show("User", user, handleLogout))}
            </div>
          ) : (
            <>
              <button 
                onClick={handleLoginClick} 
                className="text-teal-700 px-4 py-2 rounded-md font-medium hover:bg-teal-50 transition"
              >
                Login
              </button>
              <button 
                onClick={handleRegisterClick}
                className="bg-teal-700 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-800 transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <div className="flex flex-col space-y-3 mt-2">
            <MobileNavLink href="/" label="Home" />
            <MobileNavLink href="#doctors" label="Doctors" />
            <MobileNavLink href="#about" label="About" />
            <MobileNavLink href="#contact" label="Contact" />
            <MobileNavLink href="#blog" label="Blog" />
            <hr className="my-2" />
            
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    {user?.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border-2 border-teal-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <User size={18} className="text-teal-700" />
                      </div>
                    )}
                    <span className="font-medium">{user?.username || "User"}</span>
                  </div>
                </div>
                <MobileNavLink href="/user-profile" label="Profile" />
                <MobileNavLink href="/appointments" label="My Appointments" />
                <MobileNavLink href="/settings" label="Settings" />
                <button 
                  onClick={handleLogout}
                  className="text-left text-red-600 font-medium px-4 py-2 hover:bg-gray-100 rounded-md block w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleLoginClick}
                  className="text-teal-700 px-4 py-2 rounded-md font-medium hover:bg-teal-50 transition"
                >
                  Login
                </button>
                <button 
                  onClick={handleRegisterClick}
                  className="bg-teal-700 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-800 transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Generate appropriate dropdown menu based on user role
const Show = (role, user, handleLogout) => {
  const navigate = useNavigate();
  
  // Doctor-specific menu items
  if (user?.role === "doctor") {
    return (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
        <NavDropdownItem 
          icon={<UserCircle size={16} />} 
          label="Doctor Profile" 
          href="/doctor/profile" 
        />
        <NavDropdownItem 
          icon={<Calendar size={16} />} 
          label="Appointments" 
          href="/doctor/appointments" 
        />
        <NavDropdownItem 
          icon={<Settings size={16} />} 
          label="Settings" 
          href="/doctor/settings" 
        />
        <button 
          onClick={handleLogout}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </button>
      </div>
    );
  }
  
  // Default (patient) menu items
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
      <NavDropdownItem 
        icon={<UserCircle size={16} />} 
        label="Profile" 
        href="/user-profile" 
      />
      <NavDropdownItem 
        icon={<Calendar size={16} />} 
        label="My Appointments" 
        href="/appointments" 
      />
      <NavDropdownItem 
        icon={<Settings size={16} />} 
        label="Settings" 
        href="/settings" 
      />
      <button 
        onClick={handleLogout}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        <LogOut size={16} className="mr-2" />
        Logout
      </button>
    </div>
  );
};

const NavLink = ({ href, label }) => (
  <a 
    href={href} 
    className="text-gray-700 font-medium hover:text-teal-700 transition"
  >
    {label}
  </a>
);

const MobileNavLink = ({ href, label }) => (
  <a 
    href={href} 
    className="text-gray-700 font-medium px-4 py-2 hover:bg-gray-100 rounded-md block"
  >
    {label}
  </a>
);

const NavDropdownItem = ({ icon, label, href }) => {
  const navigate = useNavigate();
  
  return (
    <a 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </a>
  );
};

export default Navbar;