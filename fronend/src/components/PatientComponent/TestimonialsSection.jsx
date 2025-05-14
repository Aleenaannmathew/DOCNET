import React from 'react';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "The telehealth consultation was seamless. I was able to get expert advice and prescriptions without leaving home.",
      author: "Sarah Johnson",
      role: "Patient"
    },
    {
      text: "No more travel. DocNet makes healthcare accessible and the doctors are amazing.",
      author: "Michael Chen",
      role: "Patient"
    },
    {
      text: "I was skeptical about telehealth, but DocNet changed my mind. The doctors are just as attentive as in-person visits.",
      author: "Emma Rodriguez",
      role: "Patient"
    }
  ];

  return (
    <section id="testimonials" className="py-16 px-6 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
          What Our Patients Say
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Hear from those who have experienced our virtual healthcare services.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              text={testimonial.text}
              author={testimonial.author}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;