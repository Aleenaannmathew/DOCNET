// Updated React Component Code - Database-only Emergency Status

import {
  Calendar,
  Home,
  Lock,
  LogOut,
  Settings,
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
import { logout } from '../../store/authSlice' // Removed updateEmergencyStatus import
import { doctorAxios } from '../../axios/DoctorAxios';

function DocSidebar() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isEmergencyAvailable, setIsEmergencyAvailable] = useState(false)
  const [isUpdatingEmergency, setIsUpdatingEmergency] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Fetch current emergency status from database
  const fetchEmergencyStatus = async () => {
    if (!user?.doctor_profile?.prefer_24hr_consultation) {
      setIsLoadingStatus(false)
      return
    }

    try {
      setIsLoadingStatus(true)
      console.log('Fetching emergency status from:', 'doctor-emergency-status/')
      const response = await doctorAxios.get('doctor-emergency-status/')
      const dbStatus = response.data.emergency_status || false
      setIsEmergencyAvailable(dbStatus)
      
      console.log('Fetched emergency status from DB:', dbStatus)
    } catch (err) {
      console.error('Failed to fetch emergency status:', err)
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      })
      // Don't fallback to user data, keep current state or set to false
      setIsEmergencyAvailable(false)
    } finally {
      setIsLoadingStatus(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    console.log("Doctor Profile:", user?.doctor_profile)
    if (user?.doctor_profile?.prefer_24hr_consultation) {
      fetchEmergencyStatus()
    } else {
      setIsLoadingStatus(false)
    }
  }, [user])

  // Fetch status when component becomes visible (after refresh/navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.doctor_profile?.prefer_24hr_consultation) {
        fetchEmergencyStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  // Refresh status when navigating back to this component
  useEffect(() => {
    if (user?.doctor_profile?.prefer_24hr_consultation) {
      fetchEmergencyStatus()
    }
  }, [location.pathname])

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setActiveTab('Dashboard')
    else if (path.includes('/patients')) setActiveTab('Patients')
    else if (path.includes('/doctor-appointments')) setActiveTab('Appointments')
    else if (path.includes('/analytics')) setActiveTab('Analytics')
    else if (path.includes('/doctor-wallet')) setActiveTab('Wallet')
    else if (path.includes('/settings')) setActiveTab('Settings')
    else if (path.includes('/change-password')) setActiveTab('Change Password')
    else if (path.includes('/slots')) setActiveTab('Availability')
  }, [location.pathname])

  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`
  }

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout()
    } else if (tab === 'Change Password') {
      navigate('/doctor/change-password', {
        state: { isDoctor: true, email: user.email }, replace: true
      })
    } else if (tab === 'Availability') {
      navigate('/doctor/slots')
    } else if (tab === 'Dashboard') {
      navigate('/doctor/dashboard')
    } else if (tab === 'Wallet') {
      navigate('/doctor/doctor-wallet')
    } else if (tab === 'Patient Records') {
      navigate('/doctor/patient-records')
    } else if (tab === 'Settings') {
      navigate('/doctor/settings')
    } else if (tab === 'Appointments') {
      navigate('/doctor/doctor-appointments')
    } else if (tab === 'Notifications') {
      navigate('/doctor/notifications')
    } else if (tab === 'Help & Support') {
      navigate('/doctor/help-support')
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      dispatch(logout())
      navigate('/doctor-login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleEmergencyToggle = async (e) => {
    const newStatus = e.target.checked
    setIsUpdatingEmergency(true)
    
    try {
      const response = await doctorAxios.post('doctor-emergency-status/', {
        emergency_status: newStatus
      })

      // Update state only after successful API call
      const confirmedStatus = response.data.emergency_status
      setIsEmergencyAvailable(confirmedStatus)
      
      console.log('Emergency status updated successfully:', response.data.message)
      
    } catch (err) {
      console.error('Failed to update emergency status:', err)
      
      // Don't change the toggle state on error - keep current database state
      // The toggle will remain in its previous position
      
      // Show error message to user
      const errorMessage = err.response?.data?.detail || 'Failed to update emergency status'
      alert(errorMessage) // Replace with your preferred notification system
      
    } finally {
      setIsUpdatingEmergency(false)
    }
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Change Password', icon: Lock },
    { name: 'Appointments', icon: Stethoscope },
    { name: 'Wallet', icon: Wallet },
    { name: 'Patient Records', icon: Clipboard },
    { name: 'Notifications', icon: Bell },
    { name: 'Help & Support', icon: HelpCircle },
    { name: 'Settings', icon: Settings },
    { name: 'Logout', icon: LogOut },
  ]

  return (
    <div>
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-white"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 w-72 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          {/* Profile Info */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img src={getProfileImageUrl()} alt={user?.username} className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800" />
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
              {/* Emergency Toggle - Database Only */}
              {user?.doctor_profile?.prefer_24hr_consultation ? (
                <li className="px-4 py-3 flex items-center justify-between bg-slate-700 text-white rounded-xl my-2">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-emerald-400 mr-3" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Emergency Available</span>
                      {(isUpdatingEmergency || isLoadingStatus) && (
                        <span className="text-xs text-slate-400">
                          {isLoadingStatus ? 'Loading...' : 'Updating...'}
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isEmergencyAvailable}
                      onChange={handleEmergencyToggle}
                      disabled={isUpdatingEmergency || isLoadingStatus}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer transition-colors duration-200 ${
                      isEmergencyAvailable ? 'peer-checked:bg-emerald-500' : ''
                    } ${(isUpdatingEmergency || isLoadingStatus) ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ${
                        isEmergencyAvailable ? 'translate-x-full border-white' : ''
                      }`}></div>
                    </div>
                  </label>
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => handleTabClick('Availability')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      activeTab === 'Availability'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 bg-purple-500/10">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="font-medium">Availability</span>
                    {activeTab === 'Availability' && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                </li>
              )}

              {/* Other Sidebar Items */}
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleTabClick(item.name)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        activeTab === item.name
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 bg-white/5`}>
                        <Icon className={`w-5 h-5 ${activeTab === item.name ? 'text-white' : 'text-emerald-400'}`} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {activeTab === item.name && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export default DocSidebar