// src/pages/PatientReportsPage.js
import React from 'react';
import { Container } from 'react-bootstrap';
import PatientReports from '../components/PatientReports';

function PatientReportsPage() {
    return (
        <Container>
            <h1 className="theme-title mb-4">My Medical Reports</h1>
            <PatientReports />
        </Container>
    );
}

export default PatientReportsPage;