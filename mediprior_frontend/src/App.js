// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Import Components
import MainNavbar from './components/MainNavbar'; // <-- IMPORT NEW NAVBAR

// Import Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Import your CSS
import './index.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* --- 1. USE THE "SMART" NAVBAR --- */}
        <MainNavbar />

        <Container fluid className="app-container">
          <Routes>
            <Route path="/" element={<Login />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;