
// function AppointmentModal({ isOpen, onClose, doctor}) {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [slotByDate, setSlotsByDate] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [fetchingSlots, setFetchingSlots] = useState(false);


//   useEffect(() => {
//     if (isOpen && doctor?.id) {
//       fetchDoctorSlots();
//     }
//   }, [isOpen, doctor]);

//   const fetchDoctorSlots = async () => {
//     setFetchingSlots(true);
//     try {
//       const response = await userAxios.get(`/doctor-slots/${doctor.id}/`);
//       console.log("hii",response.data)
//       setSlotsByDate(response.data);
//     } catch (error) {
//       console.error('Error fetching slots:', error);
//       alert('Failed to fetch available slots');
//     } finally {
//       setFetchingSlots(false);
//     }
//   };

//   const handleBookAppointment = async () => {
//     if (!selectedSlot) {
//         alert('Please select a time slot');
//         return
//     }

//     setLoading(true);
//     try {
//         const response = await userAxios.post('/book-appointment', {
//             slot_id: selectedSlot.id,
//             doctor_id: doctor.id,
//         });

//         alert('Appointment booked successfully!');
//         onClose();
//     } catch (error) {
//         console.error('Booking error: ', error);
//         alert('Failed to book appointment');
//     } finally {
//         setLoading(false);
//     }
//     };

//     if (!isOpen) return null;

//   const availableDates = Object.keys(slotByDate).sort();
//   const availableTimes = selectedDate ? slotByDate[selectedDate] || [] : [];

//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', {
//         weekday: 'long',
//         month: 'short',
//         day: 'numeric'
//     })
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Book Appointment</h3>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//           </div>

//           <div className="mb-4">
//             <h4 className="font-medium mb-2">Dr. {doctor.username}</h4>
//             <p className="text-sm text-gray-600">{doctor.specialization}</p>
//           </div>

//           {fetchingSlots ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Select Date</label>
//                 <select 
//                   value={selectedDate} 
//                   onChange={(e) => {
//                     setSelectedDate(e.target.value);
//                     setSelectedSlot(null);
//                   }}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   disabled={fetchingSlots}
//                 >
//                   <option value="">Choose a date</option>
//                   {availableDates.map(date => (
//                     <option key={date} value={date}>
//                       {formatDate(date)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedDate && (
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Available Time Slots</label>
//                   {availableSlots.length === 0 ? (
//                     <p className="text-gray-500 py-2">No available slots for this date</p>
//                   ) : (
//                     <div className="grid grid-cols-2 gap-2">
//                       {availableSlots.map(slot => (
//                         <button
//                           key={slot.id}
//                           onClick={() => setSelectedSlot(slot)}
//                           className={`p-3 text-sm border rounded-md transition-colors flex items-center ${
//                             selectedSlot?.id === slot.id
//                               ? 'bg-teal-600 text-white border-teal-600'
//                               : 'border-gray-300 hover:border-teal-300'
//                           }`}
//                         >
//                           {slot.type === 'Video Call' ? (
//                             <Video size={16} className="mr-2" />
//                           ) : (
//                             <MessageSquare size={16} className="mr-2" />
//                           )}
//                           {slot.time}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {selectedSlot && (
//                 <div className="bg-gray-50 p-4 rounded-md">
//                   <h4 className="font-medium mb-2">Appointment Details</h4>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div>
//                       <p className="text-gray-500">Date</p>
//                       <p>{formatDate(selectedDate)}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Time</p>
//                       <p>{selectedSlot.time}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Duration</p>
//                       <p>{selectedSlot.duration} mins</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Type</p>
//                       <p>{selectedSlot.type}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={onClose}
//               className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleBookAppointment}
//               disabled={loading || !selectedSlot}
//               className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
//             >
//               {loading ? 'Booking...' : 'Confirm Booking'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }  
  
  {/* Appointment Modal */}
      {/* <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        doctor={doctor}
    /> */}