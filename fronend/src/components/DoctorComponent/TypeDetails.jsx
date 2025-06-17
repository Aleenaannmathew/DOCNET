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
                <div key={slot.id} className={`border rounded-2xl p-4 hover:shadow-md transition-all ${
                  slot.isBooked 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${
                        slot.isBooked 
                          ? 'bg-red-500' 
                          : typeInfo.color
                      } rounded-xl flex items-center justify-center`}>
                        <typeInfo.icon size={18} className="text-white" />
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