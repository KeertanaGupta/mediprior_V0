// src/pages/CalendarPage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DoctorCalendarView from '../components/dashboard/DoctorCalendarView';
import PatientCalendarView from '../components/dashboard/PatientCalendarView';
import { Container, Spinner } from 'react-bootstrap';

function CalendarPage() {
    const { user } = useAuth();

    if (!user) {
        // This will show a spinner while the user data is loading
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    // This is the "smart" router logic
    return (
        <>
            {user.user_type === 'DOCTOR' && <DoctorCalendarView />}
            {user.user_type === 'PATIENT' && <PatientCalendarView />}
        </>
    );
}

export default CalendarPage;