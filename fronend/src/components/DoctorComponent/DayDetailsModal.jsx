import React from 'react';
import { X, Clock, Plus, Eye, Edit, Trash2, Video } from 'lucide-react';

const DayDetailsModal = ({ 
  show, 
  onClose, 
  selectedDate, 
  daySlots, 
  consultationTypes, 
  formatDate, 
  onSlotDetails, 
  onEditSlot, 
  onDeleteSlot, 
  onAddSingleSlot, 
  onAddBulkSlots 
}) => {
  if (!show || !selectedDate) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            onClick={onClose}
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
                onClick={onAddBulkSlots}
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
                        <div className={`font-bold text-lg ${
                          slot.isBooked ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {slot.time}
                          {slot.isBooked && (
                            <span className="ml-2 text-sm font-normal text-red-500">(Booked)</span>
                          )}
                        </div>
                        <div className={`text-sm ${
                          slot.isBooked ? 'text-red-500' : 'text-gray-600'
                        }`}>
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
                        onClick={() => onSlotDetails(slot, selectedDate)}
                        className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEditSlot(slot)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
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
            onClick={onClose}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onAddSingleSlot}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Add Single Slot</span>
            </button>
            <button
              onClick={onAddBulkSlots}
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

export default DayDetailsModal;