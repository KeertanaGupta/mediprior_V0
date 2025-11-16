// src/components/dashboard/DoctorAvailability.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// 1. Accept 'onSlotAdded' to refresh the main calendar
function DoctorAvailability({ onSlotAdded }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authTokens } = useAuth();
    const [startDate, setStartDate] = useState(new Date());
    const [consultationType, setConsultationType] = useState('ONLINE');

    const fetchSlots = React.useCallback(async () => {
        if (!authTokens) return;
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            // 2. Sort the slots by date
            const sortedSlots = response.data
                .filter(slot => slot.status === 'AVAILABLE')
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            setSlots(sortedSlots);
            setError('');
        } catch (err) {
            console.error('Error fetching slots:', err);
            setError('Could not load availability.');
        } finally {
            setLoading(false);
        }
    },[authTokens]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setError('');

        const startTime = startDate;
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes

        try {
            await axios.post('http://127.0.0.1:8000/api/appointments/', 
            {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                consultation_type: consultationType
            },
            {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            
            fetchSlots(); // Refresh this component's list
            if (onSlotAdded) onSlotAdded(); // 3. Refresh the main calendar
        } catch (err) {
            console.error('Error creating slot:', err.response.data);
            setError('Failed to create slot. It may already exist.');
        }
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        // 4. Removed 'mt-4' to let the parent control spacing
        <Card className="theme-card">
            <Card.Body>
                <Card.Title className="theme-title mb-3">Manage Availability</Card.Title>
                
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleAddSlot}>
                    <Row>
                        {/* 5. Changed to Col-12 for better stacking */}
                        <Col xs={12} className="mb-3">
                            <Form.Group controlId="slotDate">
                                <Form.Label>Select Date & Time</Form.Label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={30}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    // 6. Removed 'theme-input' class, CSS handles it
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} className="mb-3">
                            <Form.Group controlId="slotType">
                                <Form.Label>Consultation Type</Form.Label>
                                <Form.Select 
                                    value={consultationType} 
                                    onChange={(e) => setConsultationType(e.target.value)} 
                                    className="theme-input"
                                >
                                    <option value="ONLINE">Online</option>
                                    <option value="IN_PERSON">In-Person</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" className="theme-button w-100">
                        <FiPlus /> Add 30-Minute Slot
                    </Button>
                </Form>
                
                <hr className="my-4" />

                <h5 className="theme-title mb-3">Your Available Slots</h5>
                <ListGroup variant="flush" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {loading ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : slots.length > 0 ? (
                        slots.map(slot => (
                            <ListGroup.Item key={slot.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{formatDateTime(slot.start_time)}</strong>
                                    <br/>
                                    <small className="text-muted">{slot.consultation_type}</small>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => alert('Delete logic coming soon!')}>
                                    <FiTrash2 />
                                </Button>
                            </ListGroup.Item>
                        ))
                    ) : (
                        <p className="text-muted">You have no available slots.</p>
                    )}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default DoctorAvailability;