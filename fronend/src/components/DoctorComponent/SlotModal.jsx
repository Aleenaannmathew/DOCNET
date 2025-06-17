import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const SlotModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editingSlot, 
  selectedDate, 
  timeSlots, 
  consultationTypes,
  formatDate 
}) => {
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
    onSubmit(formData, editingSlot?.id);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            onClick={onClose}
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
              <span>{editingSlot ? 'Update' : 'Create'} Slot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotModal;