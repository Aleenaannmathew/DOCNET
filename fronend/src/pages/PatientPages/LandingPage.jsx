import React from 'react'
import Navbar from '../../components/PatientComponent/Navbar'
import HeroSection from '../../components/PatientComponent/Landing'
import AboutSection from '../../components/PatientComponent/AboutSection'
import ServicesSection from '../../components/PatientComponent/ServicesSection'
import DoctorsSection from '../../components/PatientComponent/DoctorsSection'
import TestimonialsSection from '../../components/PatientComponent/TestimonialsSection'
import Footer from '../../components/PatientComponent/Footer'
import TelehealthLanding from '../../components/PatientComponent/Landing'


function LandingPage() {
  return (
    <div>
      <TelehealthLanding/>
    </div>
  )
}

export default LandingPage