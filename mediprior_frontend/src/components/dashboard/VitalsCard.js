// src/components/dashboard/VitalsCard.js
import React from 'react';
import { Card } from 'react-bootstrap';

function VitalsCard({ icon, title, value, unit, iconColor, statusBadge }) {
    return (
        <Card className="theme-card h-100 d-flex flex-column justify-content-between dashboard-grid-card">
            <Card.Body className="d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{
                        backgroundColor: iconColor + '20', 
                        color: iconColor, 
                        padding: '8px', 
                        borderRadius: '8px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </div>
                    {statusBadge && (
                         <span className={`status-badge ${statusBadge.toLowerCase().replace(' ', '-')}-status-badge`}>
                            {statusBadge}
                        </span>
                    )}
                </div>
                <div>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{title}</p>
                    <h5 className="theme-title mb-0" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {value} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>{unit}</span>
                    </h5>
                </div>
            </Card.Body>
        </Card>
    );
}

export default VitalsCard;