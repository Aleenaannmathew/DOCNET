import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Edit, Trash2, Save, X, User, Video, Phone, MapPin, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { doctorAxios } from '../../axios/DoctorAxios';
import { logout } from '../../store/authSlice';
import DocnetLoading from '../Constants/Loading';

const DoctorSlots = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Availability');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Slots state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slots, setSlots] = useState({});

  // Sidebar menu items specific to doctors
  const sidebarItems = [
    { name: 'Profile Information', icon: '👤' },
    { name: 'Change Password', icon: '🔒' },
    { name: 'Availability', icon: '📅' },
    { name: 'Appointments', icon: '🩺' },
    { name: 'Patient Records', icon: '📋' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Help & Support', icon: '❓' },
    { name: 'Logout', icon: '🚪', color: 'text-red-500' }
  ];

  // Time slots available (24-hour format)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const consultationTypes = [
    { id: 'video', label: 'Video Call', icon: Video, color: 'bg-blue-500' },
    { id: 'audio', label: 'Audio Call', icon: Phone, color: 'bg-green-500' },
  ];

  // Get week dates
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Slot management
  const addOrUpdateSlot = (slotData) => {
    const dateKey = formatDateKey(selectedDate);
    const slotId = editingSlot?.id || `slot_${Date.now()}`;
    
    setSlots(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [slotId]: {
          id: slotId,
          ...slotData,
          createdAt: editingSlot?.createdAt || new Date().toISOString()
        }
      }
    }));
    
    setShowSlotModal(false);
    setEditingSlot(null);
  };

  const deleteSlot = (date, slotId) => {
    const dateKey = formatDateKey(date);
    setSlots(prev => {
      const newSlots = { ...prev };
      if (newSlots[dateKey]) {
        delete newSlots[dateKey][slotId];
        if (Object.keys(newSlots[dateKey]).length === 0) {
          delete newSlots[dateKey];
        }
      }
      return newSlots;
    });
  };

  const getSlotsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return slots[dateKey] ? Object.values(slots[dateKey]).sort((a, b) => a.time.localeCompare(b.time)) : [];
  };

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Change Password') {
      navigate('/doctor/change-password', {
        state: {
          isDoctor: true,
          email: user.email
        },
        replace: true
      });
    } else if (tab === 'Profile Information') {
      navigate('/doctor/settings');
    } else {
      setActiveTab(tab);
      setMobileSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await doctorAxios.post('/doctor-logout/', {
        refresh_token: refreshToken
      });
      dispatch(logout());
      navigate('/doctor-login/');
    } catch (error) {
      console.error('Logout error: ', error);
    }
  };

  const SlotModal = () => {
    const [formData, setFormData] = useState({
      time: editingSlot?.time || '',
      duration: editingSlot?.duration || '30',
      type: editingSlot?.type || 'video',
      maxPatients: editingSlot?.maxPatients || '1',
      fee: editingSlot?.fee || '',
      notes: editingSlot?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.time || !formData.fee) return;
      addOrUpdateSlot(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingSlot ? 'Edit Slot' : 'Add New Slot'}
            </h3>
            <button
              onClick={() => {setShowSlotModal(false); setEditingSlot(null);}}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Date: {formatDate(selectedDate)}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxPatients}
                  onChange={(e) => setFormData({...formData, maxPatients: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
              <div className="grid grid-cols-3 gap-2">
                {consultationTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.id})}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-all ${
                        formData.type === type.id 
                          ? `${type.color} text-white border-transparent` 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <IconComponent size={18} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData({...formData, fee: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter fee"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Add any special instructions..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {setShowSlotModal(false); setEditingSlot(null);}}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>{editingSlot ? 'Update' : 'Add'} Slot</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SlotCard = ({ slot, date }) => {
    const consultationType = consultationTypes.find(t => t.id === slot.type);
    const IconComponent = consultationType?.icon || Video;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${consultationType?.color} rounded-full flex items-center justify-center`}>
              <IconComponent size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{slot.time}</div>
              <div className="text-xs text-gray-500">{slot.duration} min</div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setEditingSlot(slot);
                setSelectedDate(date);
                setShowSlotModal(true);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => deleteSlot(date, slot.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium text-green-600">${slot.fee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Max:</span>
            <span className="text-gray-900">{slot.maxPatients} patient(s)</span>
          </div>
          {slot.notes && (
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              {slot.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <p className="mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DocnetLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-600">DOCNET</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Dr. {user.username}</span>
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.username} 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static z-30 w-64 h-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Profile Summary */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user?.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-100">
                      <span className="text-lg font-bold text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'D'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Dr. {user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleTabClick(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.name 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${item.color || ''}`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {activeTab === item.name ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="relative mr-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-100">
                      <Calendar size={24} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Manage Your Availability</h2>
                    <p className="text-gray-600">Set your consultation slots for patients to book</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </h2>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const daySlots = getSlotsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                const isPast = date < new Date().setHours(0,0,0,0);
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-lg border-2 p-4 min-h-[300px] ${
                      isToday ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                    } ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">
                          {dayNames[index]}
                        </div>
                        <div className={`text-lg font-semibold ${
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                      {!isPast && (
                        <button
                          onClick={() => {
                            setSelectedDate(date);
                            setShowSlotModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Add slot"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {daySlots.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Clock size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No slots available</p>
                        </div>
                      ) : (
                        daySlots.map(slot => (
                          <SlotCard key={slot.id} slot={slot} date={date} />
                        ))
                      )}
                    </div>

                    {daySlots.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 text-center">
                          {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} scheduled
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(slots).reduce((acc, dateSlots) => acc + Object.keys(dateSlots).length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Slots</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Video size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(slots).reduce((acc, dateSlots) => 
                        acc + Object.values(dateSlots).filter(slot => slot.type === 'video').length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Video Calls</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(slots).reduce((acc, dateSlots) => 
                        acc + Object.values(dateSlots).filter(slot => slot.type === 'audio').length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Audio Calls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showSlotModal && <SlotModal />}
    </div>
  );
};

export default DoctorSlots;