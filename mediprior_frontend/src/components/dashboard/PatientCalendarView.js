// src/components/dashboard/PatientCalendarView.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert, Spinner, ListGroup } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function PatientCalendarView() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [events, setEvents] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { authTokens } = useAuth();

    // 1. Fetch all VERIFIED doctors for the dropdown
    useEffect(() => {
        const fetchDoctors = async () => {
            if (!authTokens) return;
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/doctors/', {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                setDoctors(response.data);
            } catch (err) { console.error("Could not fetch doctors", err); }
        };
        fetchDoctors();
    }, [authTokens]);

    // 2. Fetch the patient's OWN booked appointments
    useEffect(() => {
        const fetchMySchedule = async () => {
            if (!authTokens) return;
            try {
                // GET /api/appointments/ (for a patient) returns their own booked slots
                const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                setMyAppointments(response.data);
            } catch (err) {
                console.error("Could not fetch my schedule", err);
            }
        };
        fetchMySchedule();
    }, [authTokens]);

    // 3. When a doctor is selected, fetch their available slots
    useEffect(() => {
        if (!selectedDoctorId || !authTokens) {
            setEvents([]);
            return;
        }
        const fetchAvailableSlots = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/appointments/?doctor_id=${selectedDoctorId}`,
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                const calendarEvents = response.data.map(slot => ({
                    id: slot.id,
                    title: `Available (${slot.consultation_type})`,
                    start: new Date(slot.start_time),
                    end: new Date(slot.end_time),
                    backgroundColor: '#1ee0ac',
                    borderColor: '#1ee0ac'
                }));
                setEvents(calendarEvents);
            } catch (err) {
                console.error("Error fetching slots:", err);
                setError('Could not load appointment slots for this doctor.');
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableSlots();
    }, [selectedDoctorId, authTokens]);

    // 4. Handle clicking on an available slot
    const handleEventClick = (clickInfo) => {
        if (window.confirm(`Book this ${clickInfo.event.title} slot on ${clickInfo.event.start.toLocaleString()}?`)) {
            bookAppointment(clickInfo.event.id);
        }
    };

    // 5. Send the booking request to the backend
    const bookAppointment = async (appointmentId) => {
        try {
            await axios.patch(
                `http://127.0.0.1:8000/api/appointments/${appointmentId}/`,
                {}, // Send empty data to trigger the booking
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            alert('Appointment booked successfully!');
            // Refresh events by re-triggering the useEffect
            setSelectedDoctorId(prevId => `${prevId}`); 
        } catch (err) {
            console.error("Error booking appointment:", err.response.data);
            setError(err.response.data.error || 'Failed to book appointment.');
        }
    };
    
    // Format date for display
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <Container fluid>
            <h1 className="theme-title mb-4">Book an Appointment</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                {/* --- Left Column: Doctor Select & Calendar --- */}
                <Col lg={8}>
                    <Card className="theme-card">
                        <Card.Body>
                            <Form.Group className="mb-3" controlId="doctorSelect">
                                <Form.Label>Select a Doctor to see their schedule</Form.Label>
                                <Form.Select 
                                    className="theme-input"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                >
                                    <option value="">-- Select a Doctor --</option>
                                    {doctors.map(doc => (
                                        <option key={doc.user_id} value={doc.user_id}>
                                         {doc.name} ({doc.specialization})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            {loading && <div className="text-center"><Spinner animation="border" /></div>}
                            
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,dayGridWeek'
                                }}
                                events={events}
                                eventClick={handleEventClick}
                                height="60vh"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* --- Right Column: My Schedule --- */}
                <Col lg={4}>
                    <Card className="theme-card">
                        <Card.Body>
                            <Card.Title className="theme-title">My Upcoming Appointments</Card.Title>
                            <ListGroup variant="flush">
                                {myAppointments.length > 0 ? myAppointments.map(appt => (
                                    <ListGroup.Item key={appt.id}>
                                        <strong>{formatDateTime(appt.start_time)}</strong>
                                        <br/>
                                        <small>with {appt.doctor_name}</small>
                                    </ListGroup.Item>
                                )) : (
                                    <p className="text-muted">You have no upcoming appointments.</p>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default PatientCalendarView;