import React from 'react'
import 'tailwindcss/tailwind.css';
import UserRoutes from './routes/User';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DoctorRoutes from './routes/Doctor';
import AdminRoutes from './routes/Admin';
import { useSelector } from 'react-redux';

function App() {
  const { isAuthenticated, user } = useSelector((state)=>state.auth);

  const authKey = isAuthenticated ? `${user?.role}-auth` : 'guest';
  return (
    <BrowserRouter>
    <Routes>
    <Route path='/admin/*' element={<AdminRoutes key={authKey}/>} />
    <Route path='/doctor/*' element={<DoctorRoutes key={authKey}/>} />
    <Route path="/*" element={<UserRoutes key={authKey}/>} />
    
    </Routes>
    </BrowserRouter>
  )
}

export default App
