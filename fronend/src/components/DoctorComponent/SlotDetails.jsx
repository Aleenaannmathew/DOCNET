import React from 'react';
import { X, Edit, Trash2, Video } from 'lucide-react';

const SlotDetailsModal = ({ 
  show, 
  onClose, 
  slot, 
  selectedDate, 
  consultationTypes, 
  formatDate, 
  onEdit, 
  onDelete 
}) => {
  if (!show || !slot) return null;
  
  const consultationType = consultationTypes.find(t => t.id === slot.type);
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4">
            {slot.isBooked && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4 flex items-center">
                <span className="font-semibold">This slot is booked</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Time</span>
              <span className="text-2xl font-bold text-gray-900">{slot.time}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Duration</span>
              <span className="text-gray-900 font-medium">{slot.duration} minutes</span>
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
              <span className="text-2xl font-bold text-emerald-600">Rs{slot.fee}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Max Patients</span>
              <span className="text-gray-900 font-medium">{slot.maxPatients}</span>
            </div>
          </div>

          {slot.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Notes</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">{slot.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => onEdit(slot)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(slot.id)}
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

export default SlotDetailsModal;