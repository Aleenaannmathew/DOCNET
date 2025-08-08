import React, { useState } from 'react';

// Form input component
const FormInput = ({ label, type, placeholder, required, value, readOnly }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        defaultValue={value}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          readOnly ? "bg-gray-100" : "bg-white"
        }`}
      />
    </div>
  );
};

// File input component
const FileInput = ({ label, required }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-teal-600 rounded-lg cursor-pointer transition-colors">
          <div className="flex flex-col items-center justify-center pt-7">
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
              Upload certificate
            </p>
          </div>
          <input type="file" className="opacity-0" />
        </label>
      </div>
    </div>
  );
};

// Title component with green underline
const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">{title}</h2>
      <div className="w-24 h-1 bg-teal-700 mx-auto mb-4"></div>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};

const DoctorDetails = () => {
  const [formData, setFormData] = useState({
    registrationId: '',
    hospital: '',
    languages: 'English',
    age: '',
    gender: '',
    experience: ''
  });

  const handleSubmit = () => {
    console.log('Form submitted with data:', formData);
   
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <SectionTitle 
            title="Doctor Details" 
            subtitle="Please provide your information below."
          />

          <div className="space-y-6">
            <FormInput 
              label="Registration ID"
              type="text" 
              placeholder="Enter your registration ID"
              required={true}
            />

            <FileInput 
              label="Certificate"
              required={true}
            />

            <FormInput 
              label="Hospital"
              type="text" 
              placeholder="Enter your hospital name"
              required={false}
            />

            <FormInput 
              label="Languages"
              type="text" 
              value="English"
              readOnly={true}
              required={true}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput 
                label="Age"
                type="number" 
                placeholder="Enter your age"
                required={true}
              />
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <FormInput 
              label="Years of Experience"
              type="number" 
              placeholder="Enter years of experience"
              required={true}
            />

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Next
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoctorDetails;