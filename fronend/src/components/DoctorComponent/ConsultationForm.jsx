import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Section title component with green underline
const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">{title}</h2>
      <div className="w-24 h-1 bg-teal-700 mx-auto mb-4"></div>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};

// Day schedule row component
const DayScheduleRow = ({ day, initialChecked, disabled }) => {
  const [checked, setChecked] = useState(initialChecked);
  
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border ${checked ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 min-w-20">
        <input 
          type="checkbox" 
          checked={checked}
          disabled={disabled}
          onChange={() => setChecked(!checked)}
          className="h-5 w-5 text-teal-700 rounded focus:ring-teal-500 cursor-pointer disabled:opacity-50"
        />
        <span className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {day}
        </span>
      </div>
      
      <div className="flex-1 w-full sm:w-auto grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
        <input 
          type="time" 
          defaultValue={checked ? '09:00' : ''}
          disabled={!checked || disabled}
          className="col-span-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        
        <span className="text-center text-gray-500 hidden sm:block">–</span>
        
        <input 
          type="time" 
          defaultValue={checked ? '13:00' : ''}
          disabled={!checked || disabled}
          className="col-span-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>
      
      <select 
        disabled={!checked || disabled}
        className="w-full sm:w-auto px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="">Slots</option>
        <option value="30">30 min</option>
        <option value="45">45 min</option>
        <option value="60">60 min</option>
      </select>
    </div>
  );
};

const ConsultationSchedule = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Placeholder for Navbar and Footer components
  const Navbar = () => (
    <nav className="bg-teal-700 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold">DOCNET</h1>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="bg-teal-800 text-white p-6">
      <div className="container mx-auto text-center">
        <p>&copy; 2025 DOCNET. All rights reserved.</p>
      </div>
    </footer>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Schedule submitted');
    // Add your submission logic here
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <SectionTitle 
            title="Consultation Schedule" 
            subtitle="Select the dates and available time slots for your consultations."
          />

          <div className="space-y-4">
            {days.map((day, index) => (
              <DayScheduleRow 
                key={index}
                day={day}
                initialChecked={index < 5}
                disabled={index >= 5}
              />
            ))}
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-medium py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Submit
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConsultationSchedule;