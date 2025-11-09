// src/pages/MyConnections.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, ListGroup, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiCheck, FiX } from 'react-icons/fi'; // Icons for accept/reject

function MyConnections() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, authTokens } = useAuth();

    const fetchConnections = async () => {
        if (!authTokens) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/connections/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setConnections(response.data);
        } catch (err) {
            console.error('Error fetching connections:', err);
            setError('Could not load connections.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [authTokens]);

    // --- DOCTOR: Function to Accept or Reject ---
    const handleAction = async (connectionId, action) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/connections/', 
                { connection_id: connectionId, action: action },
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            fetchConnections(); // Refresh the list
        } catch (err) {
            console.error('Error managing connection:', err);
            setError('Action failed. Please try again.');
        }
    };
    
    // --- PATIENT: Function to Remove a Connection ---
    const handleRemove = async (doctorId) => {
        if (window.confirm('Are you sure you want to remove this connection?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/connections/${doctorId}/`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                fetchConnections(); // Refresh the list
            } catch (err) {
                console.error('Error removing connection:', err);
                setError('Could not remove connection.');
            }
        }
    };

    const getAvatar = (profile) => {
        if (profile?.profile_photo) {
            return `http://127.0.0.1:8000${profile.profile_photo}`;
        }
        return `https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=3a7bff&color=fff&rounded=true`;
    };

    // --- View for Doctors ---
    const renderDoctorView = () => {
        const pending = connections.filter(c => c.status === 'PENDING');
        const accepted = connections.filter(c => c.status === 'ACCEPTED');

        return (
            <Tabs defaultActiveKey="invitations" id="connections-tabs" className="mb-3" justify>
                <Tab eventKey="invitations" title={`Invitations (${pending.length})`}>
                    <ListGroup>
                        {pending.length > 0 ? pending.map(conn => (
                            <ListGroup.Item key={conn.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <img src={getAvatar(conn.patient_profile)} alt="Patient" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
                                    <strong>{conn.patient_profile?.name || 'Patient'}</strong>
                                </div>
                                <div>
                                    <Button variant="success" className="me-2" onClick={() => handleAction(conn.id, 'ACCEPT')}>
                                        <FiCheck /> Accept
                                    </Button>
                                    <Button variant="danger" onClick={() => handleAction(conn.id, 'REJECT')}>
                                        <FiX /> Reject
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        )) : <p className="text-muted">You have no new invitations.</p>}
                    </ListGroup>
                </Tab>
                <Tab eventKey="patients" title={`My Patients (${accepted.length})`}>
                    <ListGroup>
                        {accepted.length > 0 ? accepted.map(conn => (
                            <ListGroup.Item key={conn.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <img src={getAvatar(conn.patient_profile)} alt="Patient" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
                                    <strong>{conn.patient_profile?.name || 'Patient'}</strong>
                                </div>
                                <Button variant="outline-primary" size="sm" disabled>Message (Soon)</Button>
                            </ListGroup.Item>
                        )) : <p className="text-muted">You have no accepted patient connections yet.</p>}
                    </ListGroup>
                </Tab>
            </Tabs>
        );
    };

    // --- View for Patients ---
    const renderPatientView = () => {
        return (
            <Card className="theme-card">
                <Card.Body>
                    <Card.Title className="theme-title">My Doctors</Card.Title>
                    <ListGroup variant="flush">
                        {connections.length > 0 ? connections.map(conn => (
                            <ListGroup.Item key={conn.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <img src={getAvatar(conn.doctor_profile)} alt="Doctor" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
                                    <strong>{conn.doctor_profile?.name || 'Doctor'}</strong>
                                    <br/>
                                    <small className="text-muted">{conn.doctor_profile?.specialization || ''}</small>
                                </div>
                                {conn.status === 'ACCEPTED' && (
                                    <div>
                                        <Button variant="outline-primary" size="sm" className="me-2" disabled>Message (Soon)</Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleRemove(conn.doctor_profile.user_id)}>
                                            Remove
                                        </Button>
                                    </div>
                                )}
                                {conn.status === 'PENDING' && (
                                    <Button variant="outline-secondary" size="sm" disabled>Pending</Button>
                                )}
                                {conn.status === 'REJECTED' && (
                                    <Button variant="danger" size="sm" onClick={() => handleRemove(conn.doctor_profile.user_id)}>
                                        Rejected (Remove)
                                    </Button>
                                )}
                            </ListGroup.Item>
                        )) : <p className="text-muted">You have no connections. Use the "Find Doctors" page to connect.</p>}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" style={{ color: 'var(--accent-primary)' }}/></div>;
    }

    return (
        <Container>
            <h1 className="theme-title mb-4">My Connections</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {user?.user_type === 'DOCTOR' ? renderDoctorView() : renderPatientView()}
        </Container>
    );
}

export default MyConnections;