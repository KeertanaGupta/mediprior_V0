// src/components/MainNavbar.js
import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MainNavbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        // We don't need to navigate, logoutUser already does.
    };

    return (
        <Navbar bg="white" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="theme-title">
                    Mediprior
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            // --- If user IS logged in ---
                            <>
                                <Nav.Link as={Link} to="/dashboard" className="theme-link">Dashboard</Nav.Link>
                                
                                {/* --- NEW: Show links based on user type --- */}
                                {user.user_type === 'PATIENT' && (
                                    <Nav.Link as={Link} to="/find-doctors" className="theme-link">Find Doctors</Nav.Link>
                                )}
                                
                                <Nav.Link onClick={handleLogout} className="theme-link" style={{ color: 'var(--peach-primary)' }}>
                                    Logout
                                </Nav.Link>
                            </>
                        ) : (
                            // --- If user is NOT logged in ---
                            <>
                                <Nav.Link as={Link} to="/login" className="theme-link">Login</Nav.Link>
                                <Nav.Link as={Link} to="/signup" className="theme-link">Sign Up</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MainNavbar;