import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Edit, Trash2, Save, X, Video, MessageCircle, ChevronLeft, ChevronRight, ChevronDown, Eye, DollarSign, Users } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { doctorAxios } from '../../axios/DoctorAxios';
import { logout } from '../../store/authSlice';
import DocnetLoading from '../Constants/Loading';

const DoctorSlots = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Availability');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Slots state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showSlotDetailsModal, setShowSlotDetailsModal] = useState(false);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slots, setSlots] = useState({});
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Sidebar menu items
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

  // Time slots available
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30','12:00',
    '12:30', '13:00', '13:30','14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30','17:00', '17:30', '18:00', '18:30', '19:00', 
    '19:30', '20:00', '20:30', '21:30', '22:00', '22:30', '23:00'
  ];

  const consultationTypes = [
    { id: 'video', label: 'Video Call', icon: Video, color: 'bg-blue-500' },
    { id: 'chat', label: 'Online Chat', icon: MessageCircle, color: 'bg-green-500' },
  ];

  const openTypeDetails = (date, type) => {
  setSelectedDate(date);
  setSelectedType(type);
  setShowTypeModal(true);
};


  // Helper functions
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

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Slot operations
  const fetchSlotsForWeek = async () => {
    try {
      setLoading(true);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const response = await doctorAxios.get(`/slots/?start_date=${startDate}&end_date=${endDate}`);
      const formattedSlots = {};
      
      const slotsData = Array.isArray(response.data) ? response.data : response.data.results || [];

      slotsData.forEach(slot => {
        const dateKey = slot.date;
        if (!formattedSlots[dateKey]) {
          formattedSlots[dateKey] = {};
        }
        formattedSlots[dateKey][slot.id] = {
          id: slot.id,
          time: slot.start_time,
          duration: slot.duration,
          type: slot.consultation_type,
          maxPatients: slot.max_patients,
          fee: slot.fee,
          notes: slot.notes,
          createdAt: slot.created_at
        };
      });
      
      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async (slotData) => {
    try {
      const response = await doctorAxios.post('/slots/', {
        date: formatDateKey(selectedDate),
        start_time: slotData.time,
        duration: slotData.duration,
        consultation_type: slotData.type,
        max_patients: slotData.maxPatients,
        fee: slotData.fee,
        notes: slotData.notes
      });

      const dateKey = formatDateKey(selectedDate);
      setSlots(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [response.data.id]: {
            ...response.data,
            time: response.data.start_time,
            maxPatients: response.data.max_patients
          }
        }
      }));
      
      toast.success('Slot created successfully');
      setShowSlotModal(false);
    } catch (error) {
      console.error('Error creating slot:', error);
      toast.error(error.response?.data?.detail || 'Failed to create slot');
    }
  };

  const updateSlot = async (slotId, slotData) => {
    try {
      await doctorAxios.put(`/slots/${slotId}/`, {
        date: formatDateKey(selectedDate),
        start_time: slotData.time,
        duration: slotData.duration,
        consultation_type: slotData.type,
        max_patients: slotData.maxPatients,
        fee: slotData.fee,
        notes: slotData.notes
      });
      
      const dateKey = formatDateKey(selectedDate);
      setSlots(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [slotId]: {
            ...prev[dateKey][slotId],
            ...slotData
          }
        }
      }));
      
      toast.success('Slot updated successfully');
      setShowSlotModal(false);
      setShowSlotDetailsModal(false);
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error(error.response?.data?.detail || 'Failed to update slot');
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      await doctorAxios.delete(`/slots/${slotId}/`);
      
      const dateKey = formatDateKey(selectedDate);
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
      
      toast.success('Slot deleted successfully');
      setShowSlotDetailsModal(false);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot');
    }
  };

  const getSlotsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return slots[dateKey] ? Object.values(slots[dateKey]).sort((a, b) => a.time.localeCompare(b.time)) : [];
  };

  const getSlotCounts = (date) => {
    const daySlots = getSlotsForDate(date);
    const videoCalls = daySlots.filter(slot => slot.type === 'video').length;
    const onlineChat = daySlots.filter(slot => slot.type === 'chat').length;
    const total = daySlots.length;
    
    return { videoCalls, onlineChat, total };
  };

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Change Password') {
      navigate('/doctor/change-password', {
        state: { isDoctor: true, email: user.email },
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
      await doctorAxios.post('/doctor-logout/', { refresh_token: refreshToken });
      dispatch(logout());
      navigate('/doctor-login/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openDayDetails = (date) => {
    setSelectedDate(date);
    setShowDayDetailsModal(true);
  };

  const openSlotDetails = (slot, date) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setShowSlotDetailsModal(true);
  };

  useEffect(() => {
    fetchSlotsForWeek();
  }, [currentWeek]);

  const TypeDetailsModal = () => {
  const daySlots = getSlotsForDate(selectedDate);
  const filteredSlots = daySlots.filter(slot => slot.type === selectedType);
  const typeInfo = consultationTypes.find(t => t.id === selectedType);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${typeInfo?.color} rounded-full flex items-center justify-center`}>
              <typeInfo.icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {typeInfo?.label} Sessions
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate)} • {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTypeModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <typeInfo.icon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {typeInfo?.label.toLowerCase()} slots scheduled</p>
            </div>
          ) : (
            filteredSlots.map(slot => (
              <div key={slot.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${typeInfo?.color} rounded-full flex items-center justify-center`}>
                      <typeInfo.icon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{slot.time}</div>
                      <div className="text-sm text-gray-500">
                        {slot.duration}min • ${slot.fee} • Max {slot.maxPatients} patients
                      </div>
                      {slot.notes && (
                        <div className="text-xs text-gray-600 mt-1">{slot.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingSlot(slot);
                        setShowTypeModal(false);
                        setShowSlotModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowTypeModal(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowTypeModal(false);
              setShowSlotModal(true);
              setEditingSlot(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add New Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};


  // Slot Details Modal Component
  const SlotDetailsModal = () => {
    if (!selectedSlot) return null;
    
    const consultationType = consultationTypes.find(t => t.id === selectedSlot.type);
    const IconComponent = consultationType?.icon || Video;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${consultationType?.color} rounded-full flex items-center justify-center`}>
                <IconComponent size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Slot Details</h3>
                <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSlotDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Time</span>
                <span className="text-lg font-semibold text-gray-900">{selectedSlot.time}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Duration</span>
                <span className="text-gray-900">{selectedSlot.duration} minutes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Type</span>
                <div className="flex items-center space-x-2">
                  <IconComponent size={16} className={consultationType?.color.replace('bg-', 'text-')} />
                  <span className="text-gray-900">{consultationType?.label}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Fee</span>
                <span className="text-lg font-semibold text-green-600">${selectedSlot.fee}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Max Patients</span>
                <span className="text-gray-900">{selectedSlot.maxPatients}</span>
              </div>
            </div>

            {selectedSlot.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{selectedSlot.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setEditingSlot(selectedSlot);
                setShowSlotDetailsModal(false);
                setShowSlotModal(true);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => deleteSlot(selectedSlot.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Day Details Modal Component
  const DayDetailsModal = () => {
    const daySlots = getSlotsForDate(selectedDate);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Slots for {formatDate(selectedDate)}
              </h3>
              <p className="text-sm text-gray-600">
                {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button
              onClick={() => setShowDayDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {daySlots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No slots scheduled for this day</p>
                <button
                  onClick={() => {
                    setShowDayDetailsModal(false);
                    setShowSlotModal(true);
                    setEditingSlot(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus size={16} />
                  <span>Add First Slot</span>
                </button>
              </div>
            ) : (
              daySlots.map(slot => (
                <CompactSlotCard 
                  key={slot.id} 
                  slot={slot} 
                  date={selectedDate} 
                  onClick={() => {
                    setShowDayDetailsModal(false);
                    openSlotDetails(slot, selectedDate);
                  }}
                />
              ))
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowDayDetailsModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowDayDetailsModal(false);
                setShowSlotModal(true);
                setEditingSlot(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Slot</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Slot Modal Component
  const SlotModal = () => {
    const [formData, setFormData] = useState({
      time: editingSlot?.time || timeSlots[0] || '', 
      duration: editingSlot?.duration || '30',
      type: editingSlot?.type || 'video',
      maxPatients: editingSlot?.maxPatients || '1',
      fee: editingSlot?.fee || '',
      notes: editingSlot?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.time || !formData.fee) {
        toast.error('Time and fee are required');
        return;
      }
      
      if (editingSlot) {
        updateSlot(editingSlot.id, formData);
      } else {
        createSlot(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingSlot ? 'Edit Slot' : 'Add New Slot'}
            </h3>
            <button
              onClick={() => { setShowSlotModal(false); setEditingSlot(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Date: {formatDate(selectedDate)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-2">
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
                onClick={() => { setShowSlotModal(false); setEditingSlot(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>{editingSlot ? 'Update' : 'Add'} Slot</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Compact Slot Card Component
  const CompactSlotCard = ({ slot, date, onClick }) => {
    const consultationType = consultationTypes.find(t => t.id === slot.type);
    const IconComponent = consultationType?.icon || Video;
    
    return (
      <div 
        onClick={onClick}
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${consultationType?.color} rounded-full flex items-center justify-center`}>
              <IconComponent size={14} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{slot.time}</div>
              <div className="text-xs text-gray-500">{slot.duration}min • ${slot.fee}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Users size={12} />
            <span>{slot.maxPatients}</span>
          </div>
        </div>
      </div>
    );
  };

  // Compact Day Slot Display
  const CompactDaySlots = ({ slots, date, maxVisible = 3 }) => {
    if (slots.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          <Clock size={20} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">No slots</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {slots.slice(0, maxVisible).map(slot => (
          <CompactSlotCard 
            key={slot.id} 
            slot={slot} 
            date={date}
            onClick={() => openSlotDetails(slot, date)}
          />
        ))}
        {slots.length > maxVisible && (
          <button
            onClick={() => openDayDetails(date)}
            className="w-full py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <Eye size={12} />
            <span>+{slots.length - maxVisible} more</span>
          </button>
        )}
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
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-64 bg-white shadow-lg h-full transition-transform duration-300 ease-in-out`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.username} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">Dr. {user.username}</h3>
                <p className="text-sm text-gray-600">{user.specialization || 'General Practitioner'}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleTabClick(item.name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.name
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : `text-gray-700 hover:bg-gray-50 ${item.color || ''}`
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'Availability' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <Calendar className="text-blue-600" size={28} />
                      <span>Availability Management</span>
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your consultation slots and availability</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={goToToday}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Today
                    </button>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={goToPreviousWeek}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="px-4 py-2 font-medium text-gray-900 min-w-[200px] text-center">
                        {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                      </span>
                      <button
                        onClick={goToNextWeek}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Calendar Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const isToday = formatDateKey(date) === formatDateKey(new Date());
                  const daySlots = getSlotsForDate(date);
                  const slotCounts = getSlotCounts(date);
                  
                  return (
                    <div
                      key={formatDateKey(date)}
                      className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                        isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {/* Day Header */}
                      <div className={`p-4 border-b ${isToday ? 'border-blue-200' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                              {dayNames[index]}
                            </h3>
                            <p className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                              {date.getDate()}
                            </p>
                            <p className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                              {date.toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedDate(date);
                              setShowSlotModal(true);
                              setEditingSlot(null);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              isToday 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Quick Stats */}
                       <div className="mt-3 flex items-center justify-between text-xs">
  <div className="flex items-center space-x-3">
    <button
      onClick={() => openTypeDetails(date, 'video')}
      className="flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
    >
      <Video size={12} className="text-blue-500" />
      <span className="text-gray-600">{slotCounts.videoCalls}</span>
    </button>
    <button
      onClick={() => openTypeDetails(date, 'chat')}
      className="flex items-center space-x-1 hover:bg-green-50 px-2 py-1 rounded transition-colors"
    >
      <MessageCircle size={12} className="text-green-500" />
      <span className="text-gray-600">{slotCounts.onlineChat}</span>
    </button>
  </div>
  {slotCounts.total > 0 && (
    <div className="flex items-center space-x-1">
      <DollarSign size={12} className="text-green-600" />
      <span className="text-green-600 font-medium">
        {daySlots.reduce((total, slot) => total + parseFloat(slot.fee || 0), 0).toFixed(0)}
      </span>
    </div>
  )}
</div>                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          

          {/* Other Tab Content Placeholders */}
          {activeTab === 'Appointments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h2>
              <p className="text-gray-600">Appointment management content will be here.</p>
            </div>
          )}

          {activeTab === 'Patient Records' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Records</h2>
              <p className="text-gray-600">Patient records content will be here.</p>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
              <p className="text-gray-600">Notifications content will be here.</p>
            </div>
          )}

          {activeTab === 'Help & Support' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Help & Support</h2>
              <p className="text-gray-600">Help and support content will be here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSlotModal && <SlotModal />}
      {showSlotDetailsModal && <SlotDetailsModal />}
      {showDayDetailsModal && <DayDetailsModal />}
      {showTypeModal && <TypeDetailsModal />}
    </div>
  );
};

export default DoctorSlots;