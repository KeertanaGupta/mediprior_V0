// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

// Import Components
import Sidebar from './components/Sidebar'; 

// Import Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FindDoctors from './pages/FindDoctors';
import MyConnections from './pages/MyConnections';
import PatientReportsPage from './pages/PatientReportsPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';

// Import your CSS
import './index.css'; 

const AppContent = () => {
    const location = useLocation();
    const { user } = useAuth(); 
    const showSidebar = user && location.pathname !== '/login' && location.pathname !== '/signup';

    return (
        <div className={showSidebar ? "app-layout" : ""}>
            {showSidebar && <Sidebar />}
            <main className={showSidebar ? "main-content" : "main-content-full"}>
                <Routes>
                    {/* These routes are for non-logged-in users */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* These routes are for logged-in users */}
                    <Route path="/" element={user ? <Dashboard /> : <Login />} />
                    <Route path="/dashboard" element={<Dashboard />} /> 
                    <Route path="/find-doctors" element={<FindDoctors />} />
                    <Route path="/connections" element={<MyConnections />} />
                    <Route path="/reports" element={<PatientReportsPage />} />
                    
                    {/* Placeholders */}
                    <Route path="/chat" element={<ChatPage/>} />
                    <Route path="/calendar" element={<CalendarPage/>} />
                    <Route path="/settings" element={<div><h1 className="theme-title">Settings (Under Construction)</h1></div>} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent /> 
    </BrowserRouter>
  );
}

export default App;