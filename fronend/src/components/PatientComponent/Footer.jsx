import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">DOCNET</h3>
          <p className="text-gray-300">
            Connecting you to the best doctors anytime, anywhere.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Services</h4>
          <ul className="space-y-2">
            <FooterLink label="Teleconsultation" />
            <FooterLink label="Prescription" />
            <FooterLink label="Medical Records" />
            <FooterLink label="Health Tips" />
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <FooterLink label="About Us" />
            <FooterLink label="Career" />
            <FooterLink label="Privacy Policy" />
            <FooterLink label="Terms of Service" />
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2">
            <li className="text-gray-300">Email: info@docnet.com</li>
            <li className="text-gray-300">Phone: +1 (123) 456-7890</li>
            <li className="text-gray-300">
              123 Healthcare Ave, Medical District, CA 90210
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
        <p>&copy; {new Date().getFullYear()} DocNet. All rights reserved.</p>
      </div>
    </footer>
  );
};

const FooterLink = ({ label }) => (
  <li>
    <a href="#" className="text-gray-300 hover:text-white transition">
      {label}
    </a>
  </li>
);

export default Footer;