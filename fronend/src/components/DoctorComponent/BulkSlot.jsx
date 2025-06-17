import React, { useState } from 'react';
import { X, Save, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const BulkSlotModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  selectedDate, 
  timeSlots, 
  consultationTypes,
  formatDate 
}) => {
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
    onSubmit(formData);
  };

  if (!show) return null;

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
            onClick={onClose}
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
              onClick={onClose}
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

export default BulkSlotModal;