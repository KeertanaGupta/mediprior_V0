// src/pages/Signup.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; // <-- 1. Import useAuth

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('PATIENT'); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { loginUser } = useAuth(); // <-- 2. Get loginUser function

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple client-side validation before sending
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        const registrationData = {
            email: email,
            password: password,
            user_type: userType
        };

        try {
            // 3. Register the user
            await axios.post('http://127.0.0.1:8000/api/register/', registrationData, {
                 headers: { 'Authorization': null }
            });
            
            // 4. Auto-Login immediately
            await loginUser(email, password);
            // (loginUser handles the redirect to /dashboard)

        } catch (apiError) {
            console.error('Registration error:', apiError.response);
            setLoading(false);
            if (apiError.response && apiError.response.data) {
                const errors = apiError.response.data;
                // Display specific backend validation errors
                if (errors.password) setError(errors.password[0]);
                else if (errors.email) setError(`Email Error: ${errors.email[0]}`);
                else setError('Registration failed. Please check details.');
            } else {
                setError('Registration failed. Could not connect to server.');
            }
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card className="theme-card">
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4 theme-title">
                                Create Your Account
                            </Card.Title>
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Enter email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="theme-input" 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="At least 6 chars" 
                                        className="theme-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                    />
                                    <Form.Text className="text-muted small">
                                        Must contain 1 uppercase, 1 lowercase, 1 special char, and be 6+ chars long.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formUserType">
                                    <Form.Label>I am a:</Form.Label>
                                    <Form.Select 
                                        value={userType} 
                                        onChange={(e) => setUserType(e.target.value)} 
                                        className="theme-input"
                                    >
                                        <option value="PATIENT">Patient</option>
                                        <option value="DOCTOR">Doctor</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid mt-4">
                                    <Button type="submit" size="lg" className="theme-button" disabled={loading}>
                                        {loading ? 'Signing Up...' : 'Sign Up'}
                                    </Button>
                                </div>

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