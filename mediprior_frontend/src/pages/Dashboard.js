// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Modal, Alert, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

// Import the components we need
import PatientProfileForm from '../components/PatientProfileForm';
import DoctorProfileForm from '../components/DoctorProfileForm';
import PatientReports from '../components/PatientReports';
import DoctorConnectionInbox from '../components/DoctorConnectionInbox';
// --- NEW (Helper Component for Doctor Summary) ---
const DoctorProfileSummary = ({ profile, onEdit }) => (
    <Card className="theme-card mb-4">
        <Card.Body>
            <Card.Title className="theme-title d-flex justify-content-between align-items-center">
                Profile Summary
                <Button variant="outline-secondary" size="sm" onClick={onEdit}>Edit</Button>
            </Card.Title>
            <ListGroup variant="flush">
                <ListGroup.Item><strong>Name:</strong> {profile.name}</ListGroup.Item>
                <ListGroup.Item><strong>Specialization:</strong> {profile.specialization}</ListGroup.Item>
                <ListGroup.Item><strong>Registration No:</strong> {profile.medical_registration_number}</ListGroup.Item>
                <ListGroup.Item><strong>Experience:</strong> {profile.years_of_experience} years</ListGroup.Item>
                <ListGroup.Item>
                    <strong>Documents:</strong>
                    <a href={`http://127.0.0.1:8000${profile.medical_degree_certificate}`} target="_blank" rel="noopener noreferrer"> View Degree </a> |
                    <a href={`http://127.0.0.1:8000${profile.medical_registration_certificate}`} target="_blank" rel="noopener noreferrer"> View Registration </a>
                </ListGroup.Item>
            </ListGroup>
        </Card.Body>
    </Card>
);

// --- NEW (Helper Component for Patient Summary) ---
const PatientProfileSummary = ({ profile, onEdit }) => {
    // We can add logic for BMI, etc., here later
    return (
        <Card className="theme-card mb-4">
            <Card.Body>
                <Card.Title className="theme-title d-flex justify-content-between align-items-center">
                    My Profile
                    <Button variant="outline-secondary" size="sm" onClick={onEdit}>Edit</Button>
                </Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item><strong>Name:</strong> {profile.name}</ListGroup.Item>
                    <ListGroup.Item><strong>Blood Group:</strong> {profile.blood_group}</ListGroup.Item>
                    {/* <ListGroup.Item><strong>Phone:</strong> {profile.phone_number}</ListGroup.Item> */}
                    <ListGroup.Item><strong>Gender:</strong> {profile.gender}</ListGroup.Item>
                    <ListGroup.Item><strong>Born:</strong> {profile.dob}</ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    );
};


function Dashboard() {
    // Get user and profile from our global context
    const { user, profile, fetchProfile } = useAuth();

    // State to control the profile pop-up
    const [showModal, setShowModal] = useState(false);

    // Function to close the modal
    const handleCloseModal = () => setShowModal(false);
    
    // Function to show the modal (for the reminder/edit button)
    const handleShowModal = () => setShowModal(true);

    // This runs when the page loads or when 'profile' changes
    useEffect(() => {
        // If the profile is null (meaning incomplete), show the modal.
        if (!profile) {
            setShowModal(true);
        }
    }, [profile]); // This effect depends on the 'profile' object

    // This function is passed to the forms
    // It will close the modal and refresh the profile data
    const handleProfileComplete = () => {
        handleCloseModal();
        if(fetchProfile) {
            fetchProfile(); // Re-fetch profile to get new data
        }
    };

    // --- UPDATED: Pass the profile prop ---
    const renderProfileForm = () => {
        if (!user) return null; // Safety check

        if (user.user_type === 'PATIENT') {
            // Pass the profile object to the form
            return <PatientProfileForm onComplete={handleProfileComplete} profile={profile} />;
        }
        if (user.user_type === 'DOCTOR') {
            // Pass the profile object to the form
            return <DoctorProfileForm onComplete={handleProfileComplete} profile={profile} />;
        }
        return null;
    };

    // This is the "reminder" card that shows if the user is not verified
    const renderIncompleteProfileCard = () => (
        <Card className="theme-card text-center mb-4">
            <Card.Body>
                <Card.Title className="theme-title">Welcome to Mediprior!</Card.Title>
                <Card.Text className="text-muted">
                    Please complete your profile to unlock all features.
                </Card.Text>
                <Button className="theme-button" onClick={handleShowModal}>
                    Complete Profile Now
                </Button>
            </Card.Body>
        </Card>
    );

    // --- HEAVILY UPDATED: To show new data ---
    const renderDashboardContent = () => {
        if (!user) {
            return <p className="text-muted text-center">Loading...</p>;
        }

        // --- Doctor Flow ---
        if (user.user_type === 'DOCTOR') {
            if (!profile) {
                // Doctor has no profile, show reminder card
                return renderIncompleteProfileCard();
            }
            // PENDING Doctor Flow
            if (profile.verification_status === 'PENDING') {
                return (
                    <>
                        <Alert variant="warning" className="text-center">
                            <Alert.Heading>Your Profile is Under Review</Alert.Heading>
                            <p>Thank you for submitting. We will notify you upon approval.</p>
                        </Alert>
                        {/* Show them the data they submitted */}
                        <DoctorProfileSummary profile={profile} onEdit={handleShowModal} />
                    </>
                );
            }
            // REJECTED Doctor Flow
            if (profile.verification_status === 'REJECTED') {
                return (
                    <>
                        <Alert variant="danger" className="text-center">
                            <Alert.Heading>Your Profile Was Rejected</Alert.Heading>
                            <p>Please review your details and resubmit, or contact support.</p>
                        </Alert>
                        <DoctorProfileSummary profile={profile} onEdit={handleShowModal} />
                    </>
                );
            }
            // VERIFIED Doctor Flow
            return (
                <Row>
                    <Col md={8}>
                        {/* We'll put appointments and patient list here later */}
                        <h2 className="theme-title">Doctor Dashboard ✅</h2>
                        <p>Welcome, {profile.name}!</p>
                    </Col>
                    <Col md={4}>
                        {/* Profile and Connection requests go here */}
                        <DoctorProfileSummary profile={profile} onEdit={handleShowModal} />
                        
                        {/* --- 3. ADD THE NEW INBOX COMPONENT --- */}
                        <DoctorConnectionInbox /> 
                    </Col>
                </Row>
            );
        }

        // --- Patient Flow ---
        if (user.user_type === 'PATIENT') {
            return (
                <div>
                    <Row>
                        <Col lg={8}>
                            <PatientReports />
                        </Col>
                        <Col lg={4}>
                            {profile ? (
                                // If profile IS complete, show it
                                <PatientProfileSummary profile={profile} onEdit={handleShowModal} />
                            ) : (
                                // If profile is NOT complete, show reminder
                                renderIncompleteProfileCard()
                            )}
                            {/* We can add other cards here (e.g., Vitals, Appointments) */}
                        </Col>
                    </Row>
                </div>
            );
        }
    };

    return (
        <Container className="mt-4">
            {/* The main dashboard content */}
            {renderDashboardContent()}

            {/* This is the pop-up modal for completing the profile */}
            <Modal
                show={showModal}
                onHide={handleCloseModal} // <-- LETS THE USER CLOSE IT
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    {/* We removed the static title, the form provides it now */}
                </Modal.Header>
                <Modal.Body>
                    {/* Render the Patient or Doctor form inside the modal */}
                    {renderProfileForm()}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Dashboard;