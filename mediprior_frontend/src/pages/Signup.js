// src/pages/Signup.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Signup() {
    // State to hold form data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('PATIENT'); // Default to 'PATIENT'

    // State for handling errors or success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        if (!email || !password) {
            setError('Email and Password are required.');
            setSuccess('');
            return;
        }

        setError('');
        setSuccess('');

        const registrationData = {
            email: email,
            password: password,
            user_type: userType
        };

        try {
            // Send the data to our API endpoint!
            const response = await axios.post(
                'http://127.0.0.1:8000/api/register/', // 1. The URL
                registrationData, // 2. The data
                { // 3. The new config object
                    headers: {
                        'Authorization': null 
                    }
                }
            );
            
            console.log('Registration successful:', response.data);
            setSuccess('Registration successful! You can now log in.');
            
            // Clear the form
            setEmail('');
            setPassword('');
            setUserType('PATIENT');

        } catch (apiError) {
            console.error('Registration error:', apiError.response);
            
            if (apiError.response && apiError.response.data) {
                const errors = apiError.response.data;
                if (errors.email) {
                    setError(`Email Error: ${errors.email[0]}`);
                } else if (errors.password) {
                    setError(`Password Error: ${errors.password[0]}`);
                } else {
                    setError('Registration failed. Please try again.');
                }
            } else {
                setError('Registration failed. Could not connect to server.');
            }
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    {/* Uses the new CSS class from index.css */}
                    <Card className="theme-card">
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4 theme-title">
                                Create Your Account
                            </Card.Title>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Enter email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="theme-input" // <-- Uses new theme class
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="theme-input" // <-- Uses new theme class
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formUserType">
                                    <Form.Label>I am a:</Form.Label>
                                    <Form.Select 
                                        value={userType}
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="theme-input" // <-- Uses new theme class
                                    >
                                        <option value="PATIENT">Patient</option>
                                        <option value="DOCTOR">Doctor</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid mt-4">
                                    <Button type="submit" size="lg" className="theme-button">
                                        Sign Up
                                    </Button>
                                </div>

                                {/* Link to the login page */}
                                <div className="text-center mt-3">
                                    <span className="text-muted">Already have an account? </span>
                                    <Link to="/login" className="theme-link">Login</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Signup;