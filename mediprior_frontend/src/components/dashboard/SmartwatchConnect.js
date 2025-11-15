// src/components/dashboard/SmartwatchConnect.js
import React, { useState } from 'react';
import { Card, Button, Modal, Form, Spinner } from 'react-bootstrap';

function SmartwatchConnect() {
    // State to control the popup modal
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState('');

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const handleConnect = () => {
        setLoading(true);
        // In a real app, you would start the OAuth flow here.
        // For now, we'll just simulate a successful connection.
        console.log(`Connecting to ${selectedDevice}...`);
        setTimeout(() => {
            setLoading(false);
            handleClose();
            alert(`Successfully connected to ${selectedDevice}! Data will now sync.`);
        }, 1500);
    };

    return (
        <>
            {/* --- 1. The Card on the Dashboard --- */}
            <Card className="theme-card mb-4">
                <Card.Body>
                    <Card.Title className="theme-title">Connect Smartwatch</Card.Title>
                    <p className="text-muted" style={{fontSize: '0.9rem'}}>
                        Sync your vitals (heart rate, steps, SpO₂) automatically.
                    </p>
                    <Button className="theme-button" onClick={handleShow}>
                        Connect Device
                    </Button>
                </Card.Body>
            </Card>

            {/* --- 2. The Pop-up Modal --- */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="theme-title">Connect Smartwatch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">Choose your smartwatch provider to sync your data.</p>
                    <Form.Group className="mb-3" controlId="deviceSelect">
                        <Form.Label>Select Device</Form.Label>
                        <Form.Select
                            className="theme-input"
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                        >
                            <option value="">Choose...</option>
                            <option value="Google Fit">Google Fit</option>
                            <option value="Apple Health">Apple Health</option>
                            <option value="Fitbit">Fitbit</option>
                            <option value="Garmin">Garmin</option>
                        </Form.Select>
                    </Form.Group>
                    <p className="text-muted small">
                        Once connected, your vitals will appear on your dashboard automatically.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        className="theme-button" 
                        onClick={handleConnect} 
                        disabled={!selectedDevice || loading}
                    >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Connect Device'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default SmartwatchConnect;