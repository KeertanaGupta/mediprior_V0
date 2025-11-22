// src/components/dashboard/DoctorCalendarView.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Better for doctors
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import DoctorAvailability from './DoctorAvailability';

function DoctorCalendarView() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authTokens } = useAuth();

    const fetchSchedule = async () => {
        if (!authTokens) return;
        setLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/appointments/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            
            const evts = res.data.map(slot => ({
                id: slot.id,
                title: slot.status === 'AVAILABLE' ? 'Open Slot' : `Appt: ${slot.patient_name || 'Patient'}`,
                start: slot.start_time,
                end: slot.end_time,
                backgroundColor: slot.status === 'AVAILABLE' ? '#28a745' : '#3a7bff',
                borderColor: slot.status === 'AVAILABLE' ? '#28a745' : '#3a7bff',
                extendedProps: { ...slot }
            }));
            setEvents(evts);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSchedule(); }, [authTokens]);

    return (
        <Container fluid className="p-0">
            <Row>
                <Col lg={8} className="mb-4">
                    <Card className="theme-card h-100">
                        <Card.Body>
                            <h3 className="theme-title mb-4">My Schedule</h3>
                            {loading ? <Spinner animation="border" /> : (
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={events}
                                    height="75vh"
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <DoctorAvailability onSlotAdded={fetchSchedule} />
                </Col>
            </Row>
        </Container>
    );
}

export default DoctorCalendarView;