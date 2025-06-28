import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Sayfalar ve bileşenler
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DietitianDashboard from './pages/DietitianDashboard'
import AddUser from './pages/AddUser'  //  Yeni kullanıcı ekleme sayfası
import HealthInfoPage from "./pages/HealthInfoPage";
import ClientMessages from "./pages/ClientMessages";
import DietitianMessages from "./pages/DietitianMessages";
import DietitianRequestPage from "./pages/DietitianRequestPage";
import DietitianRequestAction from "./pages/DietitianRequestAction";
import AdminProfile from "./pages/AdminProfile";
import DietitianProfile from "./pages/DietitianProfile";
import ClientProfile from "./pages/ClientProfile";





function App() {
  return (
    <Router>
      <Routes>
        {/* Giriş/Kayıt */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard'lar */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/client-dashboard" element={<PatientDashboard />} />
        <Route path="/dietitian-dashboard" element={<DietitianDashboard />} />
<Route path="/client-messages" element={<ClientMessages />} />
<Route path="/dietitian-messages" element={<DietitianMessages />} />

        {/*  Yeni kullanıcı ekleme ekranı */}
        <Route path="/add-user" element={<AddUser />} />


        <Route path="/health-info" element={<HealthInfoPage />} />

                <Route path="/admin-profile" element={<AdminProfile />} />
                <Route path="/dietetian-profile" element={<DietitianProfile />} />
                <Route path="/client-profile" element={<ClientProfile />} />


        <Route path="/dietitian-request" element={<DietitianRequestPage />} />

                <Route path="/dietitian-action" element={<DietitianRequestAction />} />



        {/* Anasayfa */}
        <Route path="/" element={
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Hero />
              <Services />
              <About />
              <Contact />
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
