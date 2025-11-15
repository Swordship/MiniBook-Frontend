import React from 'react'
import { Routes, Route } from 'react-router-dom'

// We will create these pages in the next step
// For now, they are just placeholders
const LoginPage = () => <div>Login Page</div>
const RegisterPage = () => <div>Register Page</div>
const DashboardPage = () => <div>Dashboard</div>

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/" element={<LoginPage />} /> 
    </Routes>
  )
}

export default App