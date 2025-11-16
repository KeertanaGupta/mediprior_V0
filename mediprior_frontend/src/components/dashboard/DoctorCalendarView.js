// src/components/dashboard/DoctorCalendarView.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import DoctorAvailability from './DoctorAvailability'; // We'll reuse your form

function DoctorCalendarView() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authTokens } = useAuth();

    const fetchDoctorSchedule = React.useCallback(async () => {
        if (!authTokens) return;
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            
            const calendarEvents = response.data.map(slot => ({
                id: slot.id,
                title: slot.status === 'AVAILABLE' ? 'Available' : `Booked: ${slot.patient_name || 'Patient'}`,
                start: new Date(slot.start_time),
                end: new Date(slot.end_time),
                backgroundColor: slot.status === 'AVAILABLE' ? '#1ee0ac' : '#3a7bff',
                borderColor: slot.status === 'AVAILABLE' ? '#1ee0ac' : '#3a7bff',
            }));
            setEvents(calendarEvents);
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Could not load schedule.');
        } finally {
            setLoading(false);
        }
    },[authTokens]);

    useEffect(() => {
        fetchDoctorSchedule();
    }, [fetchDoctorSchedule]);

    return (
        <Container fluid>
            <h1 className="theme-title mb-4">My Calendar & Availability</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col lg={8} className="mb-4">
                    <Card className="theme-card">
                        <Card.Body>
                            {loading ? (
                                <div className="text-center"><Spinner animation="border" /></div>
                            ) : (
                                <FullCalendar
                                    plugins={[dayGridPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,dayGridWeek'
                                    }}
                                    events={events}
                                    height="70vh"
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={4}>
                    {/* --- THIS IS THE FIX: Pass the 'fetchDoctorSchedule' function as a prop --- */}
                    <DoctorAvailability onSlotAdded={fetchDoctorSchedule} />
                </Col>
            </Row>
        </Container>
    );
}

export default DoctorCalendarView;