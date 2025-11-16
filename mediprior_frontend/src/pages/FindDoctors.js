// src/pages/FindDoctors.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function FindDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // This state will track button clicks *in real time*
    const [requestStatus, setRequestStatus] = useState({});
    const { authTokens } = useAuth();

    const fetchDoctors = React.useCallback(async () => {
        if (!authTokens) return;
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/doctors/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setDoctors(response.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setError('Could not load doctors list.');
        }
        setLoading(false);
    },[authTokens]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // Handle sending a connection request
    const handleConnect = async (doctorId) => {
        setRequestStatus(prev => ({ ...prev, [doctorId]: 'Sending...' }));
        try {
            await axios.post('http://127.0.0.1:8000/api/connections/send/', 
                { doctor_id: doctorId }, 
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            // Refresh the whole list to get the new "PENDING" status
            fetchDoctors();
        } catch (err) {
            console.error('Error sending connection request:', err);
            setRequestStatus(prev => ({ ...prev, [doctorId]: 'Failed' }));
        }
    };

    // --- NEW: Handle removing a connection ---
    const handleRemoveConnection = async (doctorId) => {
        if (window.confirm('Are you sure you want to remove this connection?')) {
            setRequestStatus(prev => ({ ...prev, [doctorId]: 'Removing...' }));
            try {
                // Call our new DELETE endpoint
                await axios.delete(`http://127.0.0.1:8000/api/connections/${doctorId}/`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                // Refresh the list to show the "Connect" button again
                fetchDoctors();
            } catch (err) {
                console.error('Error removing connection:', err);
                setRequestStatus(prev => ({ ...prev, [doctorId]: 'Failed' }));
            }
        }
    };

    // --- NEW: Smart button rendering logic ---
    const renderConnectionButton = (doctor) => {
        // Check our local state first (for "Sending..."/"Removing...")
        const localStatus = requestStatus[doctor.user_id];
        // If no local state, use the status from the API
        const apiStatus = doctor.connection_status;
        const status = localStatus || apiStatus;

        switch (status) {
            case 'ACCEPTED':
                return (
                    <>
                        <Button variant="outline-primary" size="sm" className="me-2" disabled>
                            Message
                        </Button>
                        <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveConnection(doctor.user_id)}
                        >
                            Remove Connection
                        </Button>
                    </>
                );
            case 'PENDING':
                return (
                    <Button variant="outline-secondary" disabled>
                        Request Sent
                    </Button>
                );
            case 'Sending...':
            case 'Removing...':
                return (
                    <Button className="theme-button" disabled>
                        <Spinner as="span" animation="border" size="sm" />
                    </Button>
                );
            case 'Failed':
                return (
                    <Button variant="danger" disabled>Failed</Button>
                );
            default: // null or REJECTED
                return (
                    <Button
                        className="theme-button"
                        onClick={() => handleConnect(doctor.user_id)}
                    >
                        Send Connection Request
                    </Button>
                );
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }
    if (error) {
        return <Alert variant="danger" className="m-4">{error}</Alert>;
    }

    return (
        <Container className="mt-4">
            <h2 className="theme-title mb-4">Find a Doctor</h2>
            <Row>
                {doctors.length > 0 ? (
                    doctors.map(doctor => (
                        <Col md={6} lg={4} key={doctor.user_id} className="mb-4">
                            <Card className="theme-card h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="theme-title">{doctor.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{doctor.specialization}</Card.Subtitle>
                                    <Card.Text>
                                        <strong>Qualifications:</strong> {doctor.qualification}<br />
                                        <strong>Experience:</strong> {doctor.years_of_experience} years<br />
                                        <small className="text-muted">{doctor.clinic_name}</small>
                                    </Card.Text>
                                    <Card.Text className="flex-grow-1">
                                        {doctor.bio}
                                    </Card.Text>
                                    
                                    <div className="mt-auto">
                                        {/* Use the new button-rendering function */}
                                        {renderConnectionButton(doctor)}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p className="text-muted">No verified doctors are available at this time.</p>
                )}
            </Row>
        </Container>
    );
}

export default FindDoctors;