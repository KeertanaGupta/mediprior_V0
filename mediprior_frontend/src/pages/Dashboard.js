// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Modal, Alert, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiUsers, FiClipboard, FiStar } from 'react-icons/fi';

// Import the forms
import PatientProfileForm from '../components/PatientProfileForm';
import DoctorProfileForm from '../components/DoctorProfileForm';

// Import the dashboard components
import PatientReports from '../components/PatientReports';
import StatCard from '../components/dashboard/StatCard';
import DoctorProfileCard from '../components/dashboard/DoctorProfileCard';

// --- 1. IMPORT YOUR NEW COMPONENTS ---
import TodaySchedule from '../components/dashboard/TodaySchedule';
import AvailabilityGrid from '../components/dashboard/AvailabilityGrid';

// --- (Helper Component for Patient Summary - Unchanged) ---
const PatientProfileSummary = ({ profile, onEdit }) => (
    <Card className="theme-card mb-4">
        <Card.Body>
            <Card.Title className="theme-title d-flex justify-content-between align-items-center">
                My Profile
                <Button variant="outline-secondary" size="sm" onClick={onEdit}>Edit</Button>
            </Card.Title>
            <ListGroup variant="flush">
                <ListGroup.Item><strong>Name:</strong> {profile.name}</ListGroup.Item>
                <ListGroup.Item><strong>Blood Group:</strong> {profile.blood_group}</ListGroup.Item>
                <ListGroup.Item><strong>Phone:</strong> {profile.phone_number}</ListGroup.Item>
                <ListGroup.Item><strong>Gender:</strong> {profile.gender}</ListGroup.Item>
                <ListGroup.Item><strong>Born:</strong> {profile.dob}</ListGroup.Item>
            </ListGroup>
        </Card.Body>
    </Card>
);

// --- Main Dashboard Component ---
function Dashboard() {
    // ... (Your state and functions are unchanged) ...
    const { user, profile, fetchProfile } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    useEffect(() => {
        if (!profile) {
            setShowModal(true);
        }
    }, [profile]);

    const handleProfileComplete = () => {
        handleCloseModal();
        if(fetchProfile) {
            fetchProfile();
        }
    };

    const renderProfileForm = () => {
        if (!user) return null;
        if (user.user_type === 'PATIENT') {
            return <PatientProfileForm onComplete={handleProfileComplete} profile={profile} />;
        }
        if (user.user_type === 'DOCTOR') {
            return <DoctorProfileForm onComplete={handleProfileComplete} profile={profile} />;
        }
        return null;
    };

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

    // --- 2. THIS IS THE UPDATED DASHBOARD RENDER ---
    const renderDashboardContent = () => {
        if (!user) return <p className="text-muted text-center">Loading...</p>;

        // --- Doctor Flow ---
        if (user.user_type === 'DOCTOR') {
            if (!profile) {
                return renderIncompleteProfileCard();
            }
            
            // --- 3. NEW VERIFIED DOCTOR DASHBOARD LAYOUT ---
            return (
                <div>
                    {/* Top Row: Title and Status Alert */}
                    {profile.verification_status === 'VERIFIED' && (
                        <h2 className="theme-title d-flex align-items-center mb-4">
                            Dashboard 
                            <Badge bg="success" className="ms-3 d-flex align-items-center">
                                <FiCheckCircle className="me-1" /> Verified
                            </Badge>
                        </h2>
                    )}
                    {profile.verification_status === 'PENDING' && (
                        <Alert variant="warning" className="text-center">
                            <Alert.Heading>Your Profile is Under Review</Alert.Heading>
                            <p>Thank you for submitting. We will notify you upon approval.</p>
                        </Alert>
                    )}
                    {profile.verification_status === 'REJECTED' && (
                         <Alert variant="danger" className="text-center">
                            <Alert.Heading>Your Profile Was Rejected</Alert.Heading>
                            <p>Please review your details and resubmit, or contact support.</p>
                        </Alert>
                    )}

                    {/* Second Row: Stat Cards (Unchanged) */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <StatCard 
                                title="Total Patients" value="230" 
                                detail="3.5% Have increased from yesterday"
                                icon={<FiUsers />} iconColor="#3a7bff"
                            />
                        </Col>
                        <Col md={4}>
                            <StatCard 
                                title="Surgeries" value="90" 
                                detail="Total space ready for use"
                                icon={<FiClipboard />} iconColor="#1ee0ac"
                            />
                        </Col>
                        <Col md={4}>
                            <StatCard 
                                title="Reviews" value="4.5/5.0" 
                                detail="Based on 120 reviews"
                                icon={<FiStar />} iconColor="#ffc107"
                            />
                        </Col>
                    </Row>

                    {/* Third Row: Profile and Schedule (UPDATED) */}
                    <Row>
                        <Col lg={5} className="mb-4">
                            <DoctorProfileCard profile={profile} onEdit={handleShowModal} />
                        </Col>
                        <Col lg={7}>
                            {/* --- 4. USE THE NEW COMPONENTS --- */}
                            <TodaySchedule />
                            <AvailabilityGrid />
                        </Col>
                    </Row>
                </div>
            );
        }

        // --- Patient Flow (Unchanged) ---
        if (user.user_type === 'PATIENT') {
            return (
                <div>
                    <Row>
                        <Col lg={8}>
                            <PatientReports />
                        </Col>
                        <Col lg={4}>
                            {profile ? (
                                <PatientProfileSummary profile={profile} onEdit={handleShowModal} />
                            ) : (
                                renderIncompleteProfileCard()
                            )}
                        </Col>
                    </Row>
                </div>
            );
        }
    };

    return (
        <Container fluid className="mt-4"> {/* Use fluid for wider layout */}
            {renderDashboardContent()}

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    {/* The title is now inside the form components */}
                </Modal.Header>
                <Modal.Body>
                    {renderProfileForm()}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Dashboard;