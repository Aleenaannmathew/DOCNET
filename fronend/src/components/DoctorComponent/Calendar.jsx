import { MessageCircle, Plus, Video  } from "lucide-react";
import { ToastContainer } from "react-toastify";

  // Main Calendar Component
  const CalendarView = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const goToToday = () => {
    setCurrentWeek(new Date());
  };
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
                    <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-emerald-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className={`min-h-[200px] border-2 border-dashed rounded-2xl p-4 transition-all ${isPast
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
                    <div className="space-y-3">
                      {daySlots.map(slot => {
                        const consultationType = consultationTypes.find(t => t.id === slot.type);
                        const IconComponent = consultationType?.icon || Video;

                        return (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-2 rounded-lg border hover:shadow-md transition-all cursor-pointer ${slot.isBooked
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-gray-200'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlotDetails(slot, date);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 ${slot.isBooked
                                  ? 'bg-red-500'
                                  : consultationType?.color
                                } rounded-lg flex items-center justify-center`}>
                                <IconComponent size={12} className="text-white" />
                              </div>
                              <span className={`text-sm font-semibold ${slot.isBooked ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                {slot.time}
                                {slot.isBooked && (
                                  <span className="ml-1 text-xs text-red-500">(Booked)</span>
                                )}
                              </span>
                            </div>
                            <div className={`flex items-center space-x-1 text-xs ${slot.isBooked ? 'text-red-500' : 'text-gray-600'
                              }`}>

                            </div>
                          </div>
                        );
                      })}
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

export default CalendarView;