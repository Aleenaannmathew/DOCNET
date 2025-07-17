import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  History, 
  FileText, 
  Bell, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { logout } from '../../store/authSlice';

const PatientSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { name: 'Profile Information', icon: User },
    { name: 'Change Password', icon: Lock },
    { name: 'Booking History', icon: History },
    { name: 'Medical Records', icon: FileText },
    { name: 'Notifications', icon: Bell },
    { name: 'Logout', icon: LogOut }
  ];

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Profile Information') {
      navigate('/user-profile');
    } else if (tab === 'Change Password') {
      navigate('/new-password');
    } else if (tab === 'Booking History') {
      navigate('/booking-history');
    } else if (tab === 'Medical Records') {
      navigate('/medical-records');
    } else if (tab === 'Notifications') {
      navigate('/notifications');
    } else {
      setActiveTab(tab);
    }
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

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="lg:hidden mb-6">
        <select 
          className="w-full p-4 bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={activeTab}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {sidebarItems.map((item) => (
            <option key={item.name} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`flex items-center space-x-3 px-6 py-4 cursor-pointer transition-all duration-200 ${
                activeTab === item.name 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              } ${item.name === 'Logout' ? 'border-t border-gray-200' : ''}`}
              onClick={() => handleTabClick(item.name)}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PatientSidebar;