// src/components/dashboard/StatCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FiArrowUpRight, FiStar } from 'react-icons/fi'; // We'll use icons

// We pass props to make it reusable
function StatCard({ title, value, detail, icon, iconColor }) {
    const iconStyle = {
        backgroundColor: iconColor + '20', // '20' adds 20% opacity
        color: iconColor,
        padding: '8px',
        borderRadius: '10px',
        fontSize: '1.5rem'
    };

    return (
        <Card className="theme-card h-100">
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Title 
                            className="theme-title" 
                            style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}
                        >
                            {title}
                        </Card.Title>
                        <h2 className="theme-title mb-0">{value}</h2>
                    </Col>
                    <Col xs="auto">
                        <div style={iconStyle}>
                            {icon}
                        </div>
                    </Col>
                </Row>
                <p className="mb-0 mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {detail}
                </p>
            </Card.Body>
        </Card>
    );
}

export default StatCard;