import React from 'react'
import Nav from '../../components/DoctorComponent/Nav'
import HeroSection from '../../components/DoctorComponent/Hero'
import AboutSection from '../../components/DoctorComponent/About'
import BenefitsSection from '../../components/DoctorComponent/Benefit'
import FeatureSection from '../../components/DoctorComponent/Feature'
import TestimonialsSection from '../../components/DoctorComponent/Testimonials'
import FAQSection from '../../components/DoctorComponent/FAQ'
import Footer from '../../components/DoctorComponent/Footer'


function Landing() {
  return (
    <div>
      <Nav/>
      <HeroSection/>
      <AboutSection/>
      <BenefitsSection/>
      <FeatureSection/>
      <TestimonialsSection/>
      <FAQSection/>
      <Footer/>
    </div>
  )
}

export default Landing
