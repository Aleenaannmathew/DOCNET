import React from 'react'
import 'tailwindcss/tailwind.css';
import UserRoutes from './routes/User';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DoctorRoutes from './routes/Doctor';
import AdminRoutes from './routes/Admin';

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path='/admin/*' element={<AdminRoutes />} />
    <Route path='/doctor/*' element={<DoctorRoutes />} />
    <Route path="/*" element={<UserRoutes />} />
    
    </Routes>
    </BrowserRouter>
  )
}

export default App
