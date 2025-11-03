// src/pages/Login.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // <-- Uses the new AuthContext
import { Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Gets the login function from our new context
    const { loginUser } = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Calls the centralized login function
        const result = await loginUser(email, password); 

        if (result === 'error') {
            setError('Login failed: Invalid email or password.');
        }
        // The AuthContext now handles all success redirects!
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    {/* Uses the new CSS class from index.css */}
                    <Card className="theme-card">
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4 theme-title">
                                Login to Mediprior
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

                                <div className="d-grid mt-4">
                                    <Button type="submit" size="lg" className="theme-button">
                                        Login
                                    </Button>
                                </div>

                                <div className="text-center mt-3">
                                    <span className="text-muted">Don't have an account? </span>
                                    <Link to="/signup" className="theme-link">Sign Up</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;