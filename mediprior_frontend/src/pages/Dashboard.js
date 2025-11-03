// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Modal, Alert, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

// Import the forms we just built
import PatientProfileForm from '../components/PatientProfileForm';
import DoctorProfileForm from '../components/DoctorProfileForm';

function Dashboard() {
    // Get user and profile from our global context
    const { user, profile, fetchProfile } = useAuth();

    // State to control the profile pop-up
    const [showModal, setShowModal] = useState(false);

    // Function to close the modal
    const handleCloseModal = () => setShowModal(false);
    
    // Function to show the modal (for the reminder button)
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
        // We need to re-fetch the profile to get the new data
        // We will add 'fetchProfile' to our AuthContext
        if(fetchProfile) {
            fetchProfile();
        }
    };

    // Helper to render the correct form in the modal
    const renderProfileForm = () => {
        if (!user) return null; // Safety check

        if (user.user_type === 'PATIENT') {
            return <PatientProfileForm onComplete={handleProfileComplete} />;
        }
        if (user.user_type === 'DOCTOR') {
            return <DoctorProfileForm onComplete={handleProfileComplete} />;
        }
        return null;
    };

    // This is the "reminder" card that shows if the user is not verified
    const renderIncompleteProfileCard = () => (
        <Card className="theme-card text-center mb-4">
            <Card.Body>
                <Card.Title className="theme-title">Your Profile is Incomplete</Card.Title>
                <Card.Text className="text-muted">
                    Please complete your profile to get full access to your dashboard.
                </Card.Text>
                <Button className="theme-button" onClick={handleShowModal}>
                    Complete Profile Now
                </Button>
            </Card.Body>
        </Card>
    );

    // Helper to render the main dashboard content
    const renderDashboardContent = () => {
        // If profile is missing, show the reminder card
        if (!profile) {
            return renderIncompleteProfileCard();
        }

        // --- Doctor Flow ---
        if (user.user_type === 'DOCTOR') {
            if (profile.verification_status === 'PENDING') {
                return (
                    <Alert variant="warning" className="text-center">
                        <Alert.Heading>Your Profile is Under Review</Alert.Heading>
                        <p>
                            Thank you for submitting your details. Our team will review your
                            credentials, and you will be notified upon approval.
                        </p>
                    </Alert>
                );
            }
            if (profile.verification_status === 'REJECTED') {
                // (We'll also add a button here to re-submit the form)
                return (
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>Your Profile Was Rejected</Alert.Heading>
                        <p>
                            Unfortunately, we were unable to verify your credentials.
                            Please contact support for more information.
                        </p>
                    </Alert>
                );
            }
            // If VERIFIED, show the real dashboard
            return (
                <div>
                    <h2 className="theme-title">Doctor Dashboard ✅</h2>
                    <p>Welcome, Dr. {profile.name}!</p>
                    {/* All doctor dashboard features (appointments, patients) go here */}
                </div>
            );
        }

        // --- Patient Flow ---
        if (user.user_type === 'PATIENT') {
            return (
                <div>
                    <h2 className="theme-title">Patient Dashboard</h2>
                    <p>Welcome, {profile.name}!</p>
                    {/* All patient dashboard features (graphs, reports) go here */}
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
                    <Modal.Title>Complete Your Profile</Modal.Title>
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