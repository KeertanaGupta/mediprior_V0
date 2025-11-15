// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Form, Badge } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; 
import axios from 'axios';
import { 
    FiGrid, FiMessageSquare, FiCalendar, FiSettings, 
    FiLogOut, FiSun, FiMoon, FiUsers, FiSearch, FiFileText  
} from 'react-icons/fi';

const sidebarStyle = {
    backgroundColor: 'var(--bg-secondary)', 
    width: '250px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    zIndex: 1000 // Ensure sidebar is above other content
};
const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '2rem'
};
const navLinkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0.5rem',
    fontSize: '1.1rem',
    borderRadius: '8px'
};


function Sidebar() {
    const { user, logoutUser, profile, authTokens } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.user_type === 'DOCTOR' && authTokens) {
            const fetchPendingConnections = async () => {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/connections/', {
                        headers: { Authorization: `Bearer ${authTokens.access}` }
                    });
                    const count = response.data.filter(conn => conn.status === 'PENDING').length;
                    setPendingCount(count);
                } catch (err) {
                    console.error("Could not fetch connection count", err);
                }
            };
            fetchPendingConnections();
        }
    }, [user, authTokens, profile]); 

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };
    
    const userName = profile?.name || 'Welcome!';
    const avatarName = profile?.name || 'W';
    const userAvatar = profile?.profile_photo ? `http://127.0.0.1:8000${profile.profile_photo}` : `https://ui-avatars.com/api/?name=${avatarName}&background=3a7bff&color=fff&rounded=true`;

    return (
        <div style={sidebarStyle}>
            <Navbar.Brand style={logoStyle}>Mediprior</Navbar.Brand>
            <div className="d-flex align-items-center mb-4">
                <img src={userAvatar} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                <div>
                    <h5 className="m-0" style={{ color: 'var(--text-primary)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '150px' }}>
                        {userName}
                    </h5>
                </div>
            </div>

            <Nav className="flex-column" as="ul" style={{ listStyle: 'none', padding: 0 }}>
                <Nav.Item as="li">
                    <Nav.Link as={NavLink} to="/dashboard" style={navLinkStyle}>
                        <span> 
                            <FiGrid style={{ marginRight: '10px' }} /> Dashboard
                        </span>
                    </Nav.Link>
                </Nav.Item>
                
                {user?.user_type === 'PATIENT' && (
                    <>
                        <Nav.Item as="li">
                            <Nav.Link as={NavLink} to="/find-doctors" style={navLinkStyle}>
                                <span>
                                    <FiSearch style={{ marginRight: '10px' }} /> Find Doctors
                                </span>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Nav.Link as={NavLink} to="/reports" style={navLinkStyle}>
                                <span>
                                    <FiFileText style={{ marginRight: '10px' }} /> My Reports
                                </span>
                            </Nav.Link>
                        </Nav.Item>
                    </>
                )}
                
                <Nav.Item as="li">
                    <Nav.Link as={NavLink} to="/connections" style={navLinkStyle}>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="d-flex align-items-center">
                                <FiUsers style={{ marginRight: '10px' }} /> My Connections
                            </span>
                            {user?.user_type === 'DOCTOR' && pendingCount > 0 && (
                                <Badge pill bg="danger">{pendingCount}</Badge>
                            )}
                        </div>
                    </Nav.Link>
                </Nav.Item>
                
                <Nav.Item as="li">
                    <Nav.Link as={NavLink} to="/chat" style={navLinkStyle}>
                        <span>
                            <FiMessageSquare style={{ marginRight: '10px' }} /> Chat Room
                        </span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Nav.Link as={NavLink} to="/calendar" style={navLinkStyle}>
                        <span>
                            <FiCalendar style={{ marginRight: '10px' }} /> Calendar
                        </span>
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* (Bottom Nav) */}
            <Nav className="flex-column mt-auto" as="ul" style={{ listStyle: 'none', padding: 0 }}>
                <Nav.Item as="li" className="d-flex align-items-center justify-content-center mb-2" style={{color: 'var(--text-secondary)'}}>
                    <FiSun size={18} />
                    <Form.Check
                        type="switch"
                        id="theme-switch"
                        className="mx-2"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                    />
                    <FiMoon size={18} />
                </Nav.Item>
                <Nav.Item as="li">
                    <Nav.Link as={NavLink} to="/settings" style={navLinkStyle}>
                        <span>
                            <FiSettings style={{ marginRight: '10px' }} /> Settings
                        </span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Nav.Link onClick={handleLogout} style={{...navLinkStyle, cursor: 'pointer'}}>
                        <span>
                            <FiLogOut style={{ marginRight: '10px' }} /> Log Out
                        </span>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
}

export default Sidebar;