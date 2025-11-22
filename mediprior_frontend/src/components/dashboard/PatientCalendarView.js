// src/components/dashboard/PatientCalendarView.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Button, Badge, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiCheckCircle } from 'react-icons/fi';

function PatientCalendarView() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { authTokens } = useAuth();

    // 1. Fetch Doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/doctors/', {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                setDoctors(res.data);
            } catch (e) { console.error(e); }
        };
        if (authTokens) fetchDoctors();
    }, [authTokens]);

    // 2. Fetch My Schedule (Booked/Completed)
    const fetchMySchedule = async () => {
        if (!authTokens) return;
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/appointments/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            
            // Transform for Calendar
            const myEvents = res.data.map(appt => ({
                id: appt.id,
                title: `${appt.status === 'COMPLETED' ? '✅ ' : ''}Dr. ${appt.doctor_name} (${appt.consultation_type})`,
                // --- FIX: Convert string to Date object ---
                start: new Date(appt.start_time),
                end: new Date(appt.end_time),
                // ------------------------------------------
                backgroundColor: getStatusColor(appt.status),
                borderColor: getStatusColor(appt.status),
                extendedProps: { ...appt } 
            }));
            setMyAppointments(myEvents);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchMySchedule(); }, [authTokens]);

    // 3. Fetch Available Slots (When doctor selected)
    useEffect(() => {
        if (!selectedDoctorId) {
            setAvailableSlots([]);
            return;
        }
        const fetchSlots = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/appointments/?doctor_id=${selectedDoctorId}`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                const slots = res.data.map(slot => ({
                    id: slot.id,
                    title: 'Available',
                    // --- FIX: Convert string to Date object ---
                    start: new Date(slot.start_time),
                    end: new Date(slot.end_time),
                    // ------------------------------------------
                    display: 'background', 
                    backgroundColor: '#28a745', 
                    classNames: ['available-slot'],
                    extendedProps: { ...slot }
                }));
                setAvailableSlots(slots);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchSlots();
    }, [selectedDoctorId, authTokens]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'BOOKED': return '#3a7bff'; 
            case 'COMPLETED': return '#6c757d'; 
            case 'CANCELED': return '#dc3545'; 
            default: return '#1ee0ac';
        }
    };

    const handleEventClick = async (info) => {
        const event = info.event;
        const props = event.extendedProps;

        // If it's an AVAILABLE slot, allow booking
        if (props.status === 'AVAILABLE') {
            if (window.confirm(`Book appointment with Dr. ${props.doctor_name || 'Selected Doctor'} on ${event.start.toLocaleString()}?`)) {
                try {
                    await axios.patch(`http://127.0.0.1:8000/api/appointments/${event.id}/`, {}, {
                        headers: { Authorization: `Bearer ${authTokens.access}` }
                    });
                    alert("Booking Confirmed!");
                    fetchMySchedule(); // Refresh my list
                    setSelectedDoctorId(''); // Clear selection
                } catch (e) { alert("Booking failed."); }
            }
        }
    };
    
    const allEvents = [...myAppointments, ...availableSlots];

    return (
        <Container fluid className="p-0">
            <Row>
                {/* --- LEFT: MAIN CALENDAR --- */}
                <Col lg={8} className="mb-4">
                    <Card className="theme-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="theme-title mb-0">Calendar</h3>
                                <Form.Select 
                                    style={{width: '250px'}} 
                                    className="theme-input"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                >
                                    <option value="">+ Book New Appointment</option>
                                    {doctors.map(doc => (
                                        <option key={doc.user_id} value={doc.user_id}>Dr. {doc.name}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            {loading && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Loading slots...</div>}

                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,listWeek'
                                }}
                                events={allEvents}
                                eventClick={handleEventClick}
                                height="65vh"
                                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- RIGHT: UPCOMING LIST --- */}
                <Col lg={4}>
                    <div className="schedule-card">
                        <div className="schedule-header">
                            <h5 className="theme-title mb-0">My Schedule</h5>
                        </div>
                        <div className="schedule-list p-3">
                            {myAppointments.filter(a => a.extendedProps.status === 'BOOKED').length === 0 && (
                                <p className="text-muted text-center mt-3">No upcoming appointments.</p>
                            )}
                            
                            {myAppointments
                                .filter(a => a.extendedProps.status === 'BOOKED')
                                .map(evt => (
                                    <Card key={evt.id} className="mb-3" style={{background: 'var(--bg-primary)', border: 'none'}}>
                                        <Card.Body className="d-flex align-items-start">
                                            <div style={{
                                                background: 'rgba(58, 123, 255, 0.1)', 
                                                color: 'var(--accent-primary)', 
                                                padding: '10px', borderRadius: '10px', marginRight: '15px'
                                            }}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div>
                                                <h6 className="theme-title mb-1">Dr. {evt.extendedProps.doctor_name}</h6>
                                                <p className="text-muted small mb-1">
                                                    {/* Now evt.start is a real Date object, so this works */}
                                                    <FiClock className="me-1"/> {evt.start.toLocaleString('en-IN', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                </p>
                                                <Badge bg={evt.extendedProps.consultation_type === 'ONLINE' ? 'info' : 'success'}>
                                                    {evt.extendedProps.consultation_type === 'ONLINE' ? <><FiVideo className="me-1"/>Video</> : <><FiMapPin className="me-1"/>Clinic</>}
                                                </Badge>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))
                            }

                            <h6 className="theme-title mt-4 mb-3 px-1">Past / Completed</h6>
                            {myAppointments
                                .filter(a => a.extendedProps.status === 'COMPLETED')
                                .map(evt => (
                                    <div key={evt.id} className="d-flex align-items-center mb-3 px-2 opacity-75">
                                        <FiCheckCircle className="text-success me-3" size={18} />
                                        <div>
                                            {/* This also works now */}
                                            <p className="mb-0 text-muted small">{evt.start.toLocaleDateString()}</p>
                                            <strong style={{color: 'var(--text-secondary)'}}>Dr. {evt.extendedProps.doctor_name}</strong>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default PatientCalendarView;