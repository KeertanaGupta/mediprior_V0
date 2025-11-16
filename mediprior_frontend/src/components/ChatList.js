// src/components/ChatList.js
import React, { useState, useEffect } from 'react';
// --- 1. THIS IS THE FIX: Added Card and Badge ---
import { ListGroup, Spinner, Alert, Form, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
// (Removed FiSearch since it wasn't being used)

function ChatList({ onSelectConversation }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, authTokens } = useAuth();

    // 2. Wrap in useCallback to fix the useEffect warning
    const fetchConnections = React.useCallback(async () => {
        if (!authTokens) return;
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/connections/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            const accepted = response.data.filter(c => c.status === 'ACCEPTED');
            setConnections(accepted);
        } catch (err) {
            setError('Could not load connections.');
        } finally {
            setLoading(false);
        }
    }, [authTokens]); // Dependency for useCallback

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]); // 3. Use the useCallback function

    const getAvatar = (profile) => {
        if (profile?.profile_photo) {
            return `http://127.0.0.1:8000${profile.profile_photo}`;
        }
        const name = profile?.name || 'User';
        return `https://ui-avatars.com/api/?name=${name}&background=3a7bff&color=fff&rounded=true`;
    };

    const renderContent = () => {
        if (loading) return <div className="text-center"><Spinner animation="border" /></div>;
        if (error) return <Alert variant="danger">{error}</Alert>;
        if (connections.length === 0) return <p className="text-muted p-3">You have no active conversations. Connect with a {user.user_type === 'PATIENT' ? 'doctor' : 'patient'} to start chatting.</p>;

        return (
            <ListGroup variant="flush" style={{ overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
                {connections.map(conn => {
                    const otherPersonProfile = user.user_type === 'PATIENT' 
                        ? conn.doctor_profile 
                        : conn.patient_profile;

                    return (
                        <ListGroup.Item 
                            key={conn.id} 
                            action 
                            onClick={() => onSelectConversation(conn)}
                            className="d-flex align-items-center"
                        >
                            <img 
                                src={getAvatar(otherPersonProfile)} 
                                alt="avatar" 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }} 
                            />
                            <div className="flex-grow-1">
                                <h5 className="theme-title mb-0">{otherPersonProfile?.name || 'User'}</h5>
                                <p className="text-muted mb-0 small">Click to open chat...</p>
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        );
    };

    return (
        <Card className="theme-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="theme-title mb-0">Messages</h4>
                <Badge pill bg="danger">8</Badge> {/* Placeholder badge */}
            </Card.Header>
            <Card.Body className="p-0">
                <div className="p-3">
                    <Form.Control 
                        type="text"
                        placeholder="Search chats..."
                        className="theme-input"
                    />
                </div>
                {renderContent()}
            </Card.Body>
        </Card>
    );
}

export default ChatList;