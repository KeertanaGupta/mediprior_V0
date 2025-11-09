// src/components/dashboard/AvailabilityGrid.js
import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

// Placeholder data
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM'
];

function AvailabilityGrid() {
    return (
        <Card className="theme-card mt-4">
            <Card.Body>
                <Card.Title className="theme-title mb-3">Availability</Card.Title>
                <Row>
                    {timeSlots.map(time => (
                        <Col xs={4} md={3} lg={4} key={time} className="mb-2">
                            {/* We use a Badge for the time slot style */}
                            <Badge 
                                pill 
                                bg={null} // Use custom style
                                style={{ 
                                    backgroundColor: 'var(--bg-primary)', 
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.5rem 0.75rem',
                                    width: '100%'
                                }}
                            >
                                {time}
                            </Badge>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
}

export default AvailabilityGrid;