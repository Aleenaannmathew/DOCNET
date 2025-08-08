import React from 'react'
import Nav from '../../components/DoctorComponent/Nav'
import HeroSection from '../../components/DoctorComponent/Hero'
import AboutSection from '../../components/DoctorComponent/About'
import BenefitsSection from '../../components/DoctorComponent/Benefit'
import TestimonialsSection from '../../components/DoctorComponent/Testimonials'
import Footer from '../../components/DoctorComponent/Footer'
import ProfessionalFAQSection from '../../components/DoctorComponent/FAQ'


function Landing() {
  return (
    <div>
      <Nav/>
      <HeroSection/>
      <AboutSection/>
      <BenefitsSection/>
      <TestimonialsSection/>
      <ProfessionalFAQSection/>
      <Footer/>
    </div>
  )
}

export default Landing
