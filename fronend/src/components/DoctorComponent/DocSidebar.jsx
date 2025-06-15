import { 
  Activity, 
  Calendar, 
  Home, 
  Lock, 
  LogOut, 
  Settings, 
  Users, 
  Wallet,
  Stethoscope,
  Clipboard,
  Bell,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../store/authSlice';
// Import your axios instance
// import { doctorAxios } from '../../api/doctorAxios'; // Uncomment and adjust path as needed

const SidebarItem = ({ icon, text, active, onClick, badge }) => {
  return (
    <li 
      className={`relative group cursor-pointer transition-all duration-200 ${
        active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-700'
      } rounded-xl mx-2 my-1`}
      onClick={onClick}
    >
      <div className="flex items-center px-4 py-3">
        <span className="mr-3 flex-shrink-0">{icon}</span>
        <span className="font-medium">{text}</span>
        {badge && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </div>
      {active && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </li>
  );
};

function DocSidebar() {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Helper function to get profile image URL
    const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`;
  };

    // Update active tab based on current route
    useEffect(() => {
      const path = location.pathname;
      if (path.includes('/dashboard')) {
        setActiveTab('Dashboard');
      } else if (path.includes('/patients')) {
        setActiveTab('Patients');
      } else if (path.includes('/doctor-appointments')) {
        setActiveTab('Appointments');
      } else if (path.includes('/analytics')) {
        setActiveTab('Analytics');
      } else if (path.includes('/doctor-wallet')) {
        setActiveTab('Wallet');
      } else if (path.includes('/settings')) {
        setActiveTab('Settings');
      } else if (path.includes('/change-password')) {
        setActiveTab('Change Password');
      } else if (path.includes('/slots')) {
        setActiveTab('Availability');
      }
    }, [location.pathname]);

    const handleTabClick = (tab) => {
      if (tab === 'Logout') {
        handleLogout();
      } else if (tab === 'Change Password'){
        navigate('/doctor/change-password', {
          state: {
            isDoctor: true,
            email: user.email
          },
          replace: true
        });
      } else if (tab === 'Availability'){
        navigate('/doctor/slots');
      } else if (tab === 'Dashboard'){
        navigate('/doctor/dashboard')
      } else if (tab === 'Wallet'){
        navigate('/doctor/doctor-wallet')
      } else if (tab === 'Patient Records'){
        navigate('/doctor/patient-records') // Added a route for patient records
      } else if (tab === 'Settings'){
        navigate('/doctor/settings')
      } else if (tab === 'Appointments'){
        navigate('/doctor/doctor-appointments')
      } else if (tab === 'Notifications'){
        navigate('/doctor/notifications') // Added route for notifications
      } else if (tab === 'Help & Support'){
        navigate('/doctor/help-support') // Added route for help & support
      } else {
        setActiveTab(tab);
        setMobileSidebarOpen(false);
      }
    };

    const handleLogout = async () => {
      try{
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Uncomment when doctorAxios is available
          // await doctorAxios.post('/logout/', {
          //   refresh: refreshToken
          // });
        }
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/doctor-login');
      } catch (error) {
        console.error('Logout error:', error);
        
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/doctor-login')
      }
    }

    
    
    const sidebarItems = [
      { name: 'Dashboard', icon: Home, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
      { name: 'Change Password', icon: Lock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
      { name: 'Availability', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
      { name: 'Appointments', icon: Stethoscope, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
      { name: 'Wallet', icon: Wallet, color: 'text-white-400', bgColor: 'bg-white-500/10' },
      { name: 'Patient Records', icon: Clipboard, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
      { name: 'Notifications', icon: Bell, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
      { name: 'Help & Support', icon: HelpCircle, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
      { name: 'Settings', icon: Settings, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10'},
      { name: 'Logout', icon: LogOut, color: 'text-red-400', bgColor: 'bg-red-500/10' }
    ];

  return (
    <div>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-white"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Modern Dark Sidebar */}
      <aside className={`fixed lg:static z-40 w-72 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Profile Summary */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={getProfileImageUrl()} 
                  alt={user?.username} 
                  className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Dr. {user?.username}</h3>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                  <span className="text-emerald-400 text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleTabClick(item.name)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        activeTab === item.name 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                        activeTab === item.name ? 'bg-white/20' : item.bgColor
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          activeTab === item.name ? 'text-white' : item.color
                        }`} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {activeTab === item.name && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export default DocSidebar