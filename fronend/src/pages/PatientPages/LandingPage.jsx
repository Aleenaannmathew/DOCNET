import React from 'react'
import Navbar from '../../components/PatientComponent/Navbar'
import HeroSection from '../../components/PatientComponent/HeroSection'
import AboutSection from '../../components/PatientComponent/AboutSection'
import ServicesSection from '../../components/PatientComponent/ServicesSection'
import DoctorsSection from '../../components/PatientComponent/DoctorsSection'
import TestimonialsSection from '../../components/PatientComponent/TestimonialsSection'
import Footer from '../../components/PatientComponent/Footer'


function LandingPage() {
  return (
    <div>
      <Navbar/>
      <HeroSection/>
      <AboutSection/>
      <ServicesSection/>
      <DoctorsSection/>
      <TestimonialsSection/>
      <Footer/>
   
    </div>
  )
}

export default LandingPage