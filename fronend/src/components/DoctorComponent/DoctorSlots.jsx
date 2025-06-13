
import React, { useState, useEffect } from 'react';
import { doctorAxios } from '../../axios/DoctorAxios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, Clock, Plus, Edit, Trash2, Save, X, Video, MessageCircle, ChevronLeft, ChevronRight, Eye, DollarSign, Users, Check, Copy, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const DoctorSlots = () => {
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
  const [showBulkSlotModal, setShowBulkSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slots, setSlots] = useState({});
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const { user } = useSelector(state => state.auth)

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
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', 
    '19:30', '20:00', '20:30', '21:30', '22:00', '22:30', '23:00'
  ];

  const consultationTypes = [
    { id: 'video', label: 'Video Call', icon: Video, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { id: 'chat', label: 'Online Chat', icon: MessageCircle, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
  ];

 
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

  const formatTimeFromBackend = (timeString) => {
  if (!timeString) return '';
  
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString.substring(0, 5);
  }

  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString;
  }


  try {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  } catch (error) {
    console.error('Invalid time string:', timeString);
    return timeString; 
  }
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

  // Mock functions for demonstration
  const fetchSlotsForWeek = async () => {
  setLoading(true);
  try {
    const weekDates = getWeekDates(currentWeek);
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];

    console.log('Fetching slots for:', startDate, 'to', endDate); // Debug

    const response = await doctorAxios.get(`/slots/?start_date=${startDate}&end_date=${endDate}`);
    console.log('API Response:', response.data); // Debug
    
    // Handle different response structures
    let slotsData = [];
    if (Array.isArray(response.data)) {
      slotsData = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      slotsData = response.data.results; // For paginated responses
    } else if (response.data && typeof response.data === 'object') {
      slotsData = Object.values(response.data);
    }

    console.log('Processed slots data:', slotsData); // Debug

    const formattedSlots = {};

    slotsData.forEach(slot => {
      const dateKey = slot.date;
      if (!formattedSlots[dateKey]) {
        formattedSlots[dateKey] = {};
      }
      formattedSlots[dateKey][slot.id] = {
        id: slot.id,
        time: formatTimeFromBackend(slot.start_time),
        duration: parseInt(slot.duration) || 30,
        type: slot.consultation_type,
        maxPatients: parseInt(slot.max_patients) || 1,
        fee: parseFloat(slot.fee) || 0,
        notes: slot.notes || '',
        isBooked: slot.is_booked || false
      };
    });

    setSlots(formattedSlots);
    console.log('Final formatted slots:', formattedSlots); // Debug
  } catch (error) {
    console.error('Error fetching slots:', error);
    console.error('Error response:', error.response?.data); // Debug
    setSlots({}); // Set empty slots on error
  } finally {
    setLoading(false);
  }
};

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data) {
    // Handle validation errors or other structured responses
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    // Handle object responses with multiple error fields
    if (typeof error.response.data === 'object') {
      const firstError = Object.values(error.response.data)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};


  const createSlot = async (slotData) => {
  try {
    const formattedData = {
      date: selectedDate.toISOString().split('T')[0],
      start_time: slotData.time + ':00',
      duration: slotData.duration,
      consultation_type: slotData.type,
      max_patients: slotData.maxPatients,
      fee: slotData.fee,
      notes: slotData.notes
    };
    
    await doctorAxios.post('/slots/', formattedData);
    await fetchSlotsForWeek();
    setShowSlotModal(false);
    
    // SweetAlert success notification
    Swal.fire({
      title: 'Success!',
      text: 'Slot created successfully!',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
    
  } catch (error) {
    console.error('Error creating slot:', error);
    const errorMessage = getErrorMessage(error);
    
    // SweetAlert error notification
    Swal.fire({
      title: 'Error!',
      text: `Failed to create slot: ${errorMessage}`,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#ef4444',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280'
    });
  }
};
   
  const createBulkSlots = async (bulkData) => {
    try {
      const promises = bulkData.selectedTimes.map(time => {
        const slotData = {
          date: selectedDate.toISOString().split('T')[0],
          start_time: time + ':00',
          duration: bulkData.duration,
          consultation_type: bulkData.type,
          max_patients: bulkData.maxPatients,
          fee: bulkData.fee,
          notes: bulkData.notes
        };
        return doctorAxios.post('/slots/', slotData);
      });

      await Promise.all(promises);
      await fetchSlotsForWeek();
      setShowBulkSlotModal(false);
      toast.success(`${bulkData.selectedTimes.length} slots created successfully`);
    } catch (error) {
      console.error('Error creating bulk slots:', error);
      toast.error(' Slots already created');
    }
  };

  const updateSlot = async (slotId, slotData) => {
    try {
      const formattedData = {
        date: selectedDate.toISOString().split('T')[0],
        start_time: slotData.time + ':00',
        duration: slotData.duration,
        consultation_type: slotData.type,
        max_patients: slotData.maxPatients,
        fee: slotData.fee,
        notes: slotData.notes
      };
      
      await doctorAxios.patch(`/slots/${slotId}/`, formattedData);
      await fetchSlotsForWeek();
      setShowSlotModal(false);
      toast.success('Slot updated successfully');
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error('Failed to update slot');
    }
  };
   
  const deleteSlot = async (slotId) => {
    try {
      await doctorAxios.delete(`/slots/${slotId}/`);
      await fetchSlotsForWeek();
      setShowSlotDetailsModal(false);
      toast.success('Slot deleted successfully');
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
    }
    else {
      setActiveTab(tab);
      setMobileSidebarOpen(false);
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

  const openTypeDetails = (date, type) => {
    setSelectedDate(date);
    setSelectedType(type);
    setShowTypeModal(true);
  };

  useEffect(() => {
    fetchSlotsForWeek();
  }, [currentWeek]);

  // Bulk Slot Modal Component
  const BulkSlotModal = () => {
    const [formData, setFormData] = useState({
      selectedTimes: [],
      duration: '30',
      type: 'video',
      maxPatients: '1',
      fee: '500',
      notes: ''
    });

    const toggleTimeSelection = (time) => {
      setFormData(prev => ({
        ...prev,
        selectedTimes: prev.selectedTimes.includes(time)
          ? prev.selectedTimes.filter(t => t !== time)
          : [...prev.selectedTimes, time]
      }));
    };

    const selectAllTimes = () => {
      setFormData(prev => ({
        ...prev,
        selectedTimes: timeSlots
      }));
    };

    const clearAllTimes = () => {
      setFormData(prev => ({
        ...prev,
        selectedTimes: []
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.selectedTimes.length === 0 || !formData.fee) {
        toast.error('Please select at least one time slot and set a fee');
        return;
      }
      createBulkSlots(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Add Multiple Slots</h3>
              <p className="text-gray-600 mt-1">
                {selectedDate ? formatDate(selectedDate) : 'Select Date'} • Select multiple time slots to add at once
              </p>
            </div>
            <button
              onClick={() => setShowBulkSlotModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Time Selection Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-gray-900">Select Time Slots</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllTimes}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllTimes}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleTimeSelection(time)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.selectedTimes.includes(time)
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {time}
                    {formData.selectedTimes.includes(time) && (
                      <Check size={12} className="ml-1 inline" />
                    )}
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {formData.selectedTimes.length} slot{formData.selectedTimes.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Other Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Max Patients per Slot</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.maxPatients}
                    onChange={(e) => setFormData({...formData, maxPatients: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Fee (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter fee"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {consultationTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({...formData, type: type.id})}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all ${
                            formData.type === type.id 
                              ? `${type.color} text-white border-transparent shadow-lg` 
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <IconComponent size={20} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="4"
                    placeholder="Add any special instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowBulkSlotModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Create {formData.selectedTimes.length} Slots</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Type Details Modal Component  
  const TypeDetailsModal = () => {
    if (!selectedDate || !selectedType) return null;
    
    const daySlots = getSlotsForDate(selectedDate);
    const filteredSlots = daySlots.filter(slot => slot.type === selectedType);
    const typeInfo = consultationTypes.find(t => t.id === selectedType);
    
    if (!typeInfo) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 ${typeInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <typeInfo.icon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {typeInfo.label} Sessions
                </h3>
                <p className="text-gray-600">
                  {formatDate(selectedDate)} • {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTypeModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <typeInfo.icon size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No {typeInfo.label.toLowerCase()} slots scheduled</p>
              </div>
            ) : (
              filteredSlots.map(slot => (
                <div key={slot.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${typeInfo.color} rounded-xl flex items-center justify-center`}>
                        <typeInfo.icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{slot.time}</div>
                        <div className="text-sm text-gray-600">
                          {slot.duration}min • Rs{slot.fee} • Max {slot.maxPatients} patients
                        </div>
                        {slot.notes && (
                          <div className="text-xs text-gray-500 mt-1 bg-white px-2 py-1 rounded-lg inline-block">
                            {slot.notes}
                          </div>
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
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowTypeModal(false)}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowTypeModal(false);
                setShowSlotModal(true);
                setEditingSlot(null);
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus size={18} />
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
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 ${consultationType?.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Slot Details</h3>
                <p className="text-gray-600">{selectedDate ? formatDate(selectedDate) : 'No Date'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSlotDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Time</span>
                <span className="text-2xl font-bold text-gray-900">{selectedSlot.time}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Duration</span>
                <span className="text-gray-900 font-medium">{selectedSlot.duration} minutes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Type</span>
                <div className="flex items-center space-x-2">
                  <IconComponent size={16} className={consultationType?.textColor} />
                  <span className="text-gray-900 font-medium">{consultationType?.label}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Fee</span>
                <span className="text-2xl font-bold text-emerald-600">Rs{selectedSlot.fee}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Max Patients</span>
                <span className="text-gray-900 font-medium">{selectedSlot.maxPatients}</span>
              </div>
            </div>

            {selectedSlot.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Notes</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">{selectedSlot.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setEditingSlot(selectedSlot);
                setShowSlotDetailsModal(false);
                setShowSlotModal(true);
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => deleteSlot(selectedSlot.id)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Day Details Modal Component
  const DayDetailsModal = () => {
    if (!selectedDate) return null;
    
    const daySlots = getSlotsForDate(selectedDate);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <ToastContainer/>
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Slots for {formatDate(selectedDate)}
              </h3>
              <p className="text-gray-600 mt-1">
                {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button
              onClick={() => setShowDayDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {daySlots.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-6">No slots scheduled for this day</p>
                <button
                  onClick={() => {
                    setShowDayDetailsModal(false);
                    setShowBulkSlotModal(true);
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center space-x-2 mx-auto font-medium"
                >
                  <Plus size={18} />
                  <span>Add Slots</span>
                </button>
              </div>
            ) : (
              daySlots.map(slot => {
                const consultationType = consultationTypes.find(t => t.id === slot.type);
                const IconComponent = consultationType?.icon || Video;
                
                return (
                  <div key={slot.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${consultationType?.color} rounded-xl flex items-center justify-center`}>
                          <IconComponent size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{slot.time}</div>
                          <div className="text-sm text-gray-600">
                            {slot.duration}min • Rs{slot.fee} • Max {slot.maxPatients} patients
                          </div>
                          {slot.notes && (
                            <div className="text-xs text-gray-500 mt-1 bg-white px-2 py-1 rounded-lg inline-block">
                              {slot.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openSlotDetails(slot, selectedDate)}
                          className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setShowDayDetailsModal(false);
                            setShowSlotModal(true);
                          }}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDayDetailsModal(false)}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDayDetailsModal(false);
                  setShowSlotModal(true);
                  setEditingSlot(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus size={18} />
                <span>Add Single Slot</span>
              </button>
              <button
                onClick={() => {
                  setShowDayDetailsModal(false);
                  setShowBulkSlotModal(true);
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus size={18} />
                <span>Add Multiple Slots</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Slot Modal Component
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
      if (!formData.time || !formData.fee) {
        toast.error('Please fill in all required fields');
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
         <ToastContainer/>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {editingSlot ? 'Edit Slot' : 'Add New Slot'}
              </h3>
              <p className="text-gray-600 mt-1">
                {selectedDate ? formatDate(selectedDate) : 'Select Date'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSlotModal(false);
                setEditingSlot(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Time *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Type</label>
              <div className="grid grid-cols-2 gap-3">
                {consultationTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.id})}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all ${
                        formData.type === type.id 
                          ? `${type.color} text-white border-transparent shadow-lg` 
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Patients per Slot</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.maxPatients}
                onChange={(e) => setFormData({...formData, maxPatients: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Fee (Rs) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData({...formData, fee: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter fee"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows="3"
                placeholder="Add any special instructions..."
              />
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowSlotModal(false);
                  setEditingSlot(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>{editingSlot ? 'Update' : 'Create'} Slot</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main Calendar Component
  const CalendarView = () => {
    return (
    
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ToastContainer/>
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Weekly Schedule</h2>
              <p className="text-emerald-100 mt-1">Manage your availability</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-colors font-medium"
              >
                Today
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-lg font-semibold min-w-[200px] text-center">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const daySlots = getSlotsForDate(date);
              const slotCounts = getSlotCounts(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date().setHours(0, 0, 0, 0);

              return (
                <div key={index} className="space-y-3">
                  {/* Day Header */}
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-600">
                      {dayNames[index]}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      isToday ? 'text-emerald-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className={`min-h-[200px] border-2 border-dashed rounded-2xl p-4 transition-all ${
                    isPast 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer'
                  }`}
                  onClick={() => !isPast && openDayDetails(date)}
                  >
                    {/* Slot Summary */}
                    {slotCounts.total > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                          <span>Total Slots</span>
                          <span className="bg-gray-200 px-2 py-1 rounded-full">{slotCounts.total}</span>
                        </div>
                        
                        {slotCounts.videoCalls > 0 && (
                          <div 
                            className="flex items-center justify-between text-xs p-2 bg-emerald-50 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTypeDetails(date, 'video');
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <Video size={12} className="text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Video Calls</span>
                            </div>
                            <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-semibold">
                              {slotCounts.videoCalls}
                            </span>
                          </div>
                        )}
                        
                        {slotCounts.onlineChat > 0 && (
                          <div 
                            className="flex items-center justify-between text-xs p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTypeDetails(date, 'chat');
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <MessageCircle size={12} className="text-blue-600" />
                              <span className="text-blue-700 font-medium">Online Chat</span>
                            </div>
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">
                              {slotCounts.onlineChat}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recent Slots Preview */}
                    <div className="space-y-2">
                      {daySlots.slice(0, 3).map(slot => {
                        const consultationType = consultationTypes.find(t => t.id === slot.type);
                        const IconComponent = consultationType?.icon || Video;
                        
                        return (
                          <div 
                            key={slot.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlotDetails(slot, date);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 ${consultationType?.color} rounded-lg flex items-center justify-center`}>
                                <IconComponent size={12} className="text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{slot.time}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <DollarSign size={10} />
                              <span>{slot.fee}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {daySlots.length > 3 && (
                        <div className="text-center text-xs text-gray-500 font-medium">
                          +{daySlots.length - 3} more slots
                        </div>
                      )}
                    </div>

                    {/* Add Slot Button */}
                    {slotCounts.total === 0 && !isPast && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Plus size={32} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">Add Slots</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <h1 className="text-xl font-bold text-white">Doctor Portal</h1>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden text-white hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-600">{user.specialization}</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleTabClick(item.name)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
              activeTab === item.name ? 'bg-emerald-50 border-r-4 border-emerald-500 text-emerald-700' : 'text-gray-700'
            } ${item.color || ''}`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  // Main render
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
       <ToastContainer/>
      
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ToastContainer/>
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Settings size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{activeTab}</h2>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'Availability' && (
            <div className="space-y-6">
              <CalendarView />
            </div>
          )}
          
          {activeTab !== 'Availability' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeTab}</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showSlotModal && <SlotModal />}
      {showSlotDetailsModal && <SlotDetailsModal />}
      {showDayDetailsModal && <DayDetailsModal />}
      {showBulkSlotModal && <BulkSlotModal />}
      {showTypeModal && <TypeDetailsModal />}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="text-lg font-medium text-gray-900">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSlots;
                