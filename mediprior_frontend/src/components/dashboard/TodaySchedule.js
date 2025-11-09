// src/components/dashboard/TodaySchedule.js
import React from 'react';
import { Card, Tabs, Tab, ListGroup, Badge, Button } from 'react-bootstrap';

// Placeholder data
const appointments = [
    { id: 1, time: '09:40 AM', title: 'Routine check up', patient: 'Leslie Alexander', status: 'Confirm' },
    { id: 2, time: '09:40 AM', title: 'Dermatology consultation', patient: 'Savannah Nguyen', status: 'Pending' },
    { id: 3, time: '09:40 AM', title: 'Routine check up', patient: 'Jerome Bell', status: 'Canceled' },
];

// Helper to get the right color for the badge
const getStatusBadge = (status) => {
    if (status === 'Confirm') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Canceled') return 'danger';
    return 'secondary';
};

function TodaySchedule() {
    return (
        // --- THIS IS THE FIX: 'h-100' has been removed ---
        <Card className="theme-card">
            <Card.Body>
                <Card.Title className="theme-title">Today's Patient</Card.Title>
                
                <Tabs defaultActiveKey="checkup" id="schedule-tabs" className="mb-3">
                    <Tab eventKey="checkup" title="Check-up">
                        <ListGroup variant="flush">
                            {appointments.map(appt => (
                                <ListGroup.Item key={appt.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)' }}>{appt.time}</span>
                                        <p className="theme-title mb-0" style={{ fontWeight: '500' }}>{appt.title}</p>
                                        <small className="text-muted">{appt.patient}</small>
                                    </div>
                                    <Badge pill bg={getStatusBadge(appt.status)} text={appt.status === 'Pending' ? 'dark' : 'white'}>
                                        {appt.status}
                                    </Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>
                    <Tab eventKey="urgent" title="Urgent visit">
                        <ListGroup variant="flush">
                            <p className="text-muted p-3">No urgent visits scheduled.</p>
                        </ListGroup>
                    </Tab>
                </Tabs>
                <Button variant="link" className="theme-link float-end">Consult Now &rarr;</Button>
            </Card.Body>
        </Card>
    );
}

export default TodaySchedule;