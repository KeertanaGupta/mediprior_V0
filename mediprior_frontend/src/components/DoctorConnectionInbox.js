// src/components/DoctorConnectionInbox.js
import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function DoctorConnectionInbox() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authTokens } = useAuth(); // Get tokens for API calls

    // Function to fetch pending connection requests
    const fetchRequests = async () => {
        if (!authTokens) return;
        
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/connections/manage/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching connection requests:', err);
            setError('Could not load connection requests.');
            setLoading(false);
        }
    };

    // Fetch requests when the component loads
    useEffect(() => {
        fetchRequests();
    }, []); // Run once on load

    // Function to handle accepting or rejecting
    const handleAction = async (connectionId, action) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/connections/manage/', 
            {
                connection_id: connectionId,
                action: action // "ACCEPT" or "REJECT"
            }, 
            {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });

            // On success, refresh the list
            fetchRequests(); 
        } catch (err) {
            console.error(`Error ${action.toLowerCase()}ing connection:`, err);
            setError(`Could not ${action.toLowerCase()} connection.`);
        }
    };

    // Helper to show loading or error states
    const renderContent = () => {
        if (loading) {
            return <div className="text-center"><Spinner animation="border" /></div>;
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        if (requests.length === 0) {
            return <p className="text-muted">You have no new connection requests.</p>;
        }

        return (
            <ListGroup variant="flush">
                {requests.map(req => (
                    <ListGroup.Item key={req.id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{req.patient_name}</strong>
                            <br />
                            <small className="text-muted">{req.patient_email}</small>
                        </div>
                        <div>
                            <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleAction(req.id, 'ACCEPT')}
                            >
                                Accept
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="ms-2"
                                onClick={() => handleAction(req.id, 'REJECT')}
                            >
                                Reject
                            </Button>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        );
    };

    return (
        <Card className="theme-card mb-4">
            <Card.Body>
                <Card.Title className="theme-title">Connection Requests</Card.Title>
                {renderContent()}
            </Card.Body>
        </Card>
    );
}

export default DoctorConnectionInbox;