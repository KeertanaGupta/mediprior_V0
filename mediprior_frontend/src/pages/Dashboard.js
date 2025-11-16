// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Modal, Alert, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    FiCheckCircle, FiUsers, FiClipboard, FiStar, FiHeart, FiDroplet, 
    FiActivity, FiTrendingUp, FiSmile, FiMeh, FiFrown, FiMoon, FiZap, FiPlus 
} from 'react-icons/fi';
import axios from 'axios'; // <-- 1. Fixed missing import

// Import the forms
import PatientProfileForm from '../components/PatientProfileForm';
import DoctorProfileForm from '../components/DoctorProfileForm';
// Import the dashboard components
import VitalsCard from '../components/dashboard/VitalsCard'; 
import DoctorProfileCard from '../components/dashboard/DoctorProfileCard';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import AvailabilityGrid from '../components/dashboard/DoctorAvailability'; // Swapped for the new one
import HealthMetricForm from '../components/dashboard/HealthMetricForm'; 
import SmartwatchConnect from '../components/dashboard/SmartwatchConnect';
import BmiCard from '../components/dashboard/BmiCard';
import HeartRateGraph from '../components/dashboard/HeartRateGraph';

// --- (Helper Component for Patient Summary) ---
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

// --- (Helper Component for Doctor Summary) ---
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
                <ListGroup.Item><strong>Experience:</strong> {profile.years_of_experience} years</ListGroup.Item>
            </ListGroup>
        </Card.Body>
    </Card>
);

// --- Main Patient Dashboard Layout ---
const PatientDashboard = ({ profile, onEdit, onLogVitals }) => {
    const [metrics, setMetrics] = useState(null); 
    const { authTokens } = useAuth();
    const { theme } = useTheme(); 
    const fileBaseUrl = 'http://127.0.0.1:8000';
    
    useEffect(() => {
        const fetchLatestMetric = async () => {
            if (authTokens) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/health-metrics/', {
                        headers: { Authorization: `Bearer ${authTokens.access}` }
                    });
                    if (response.data.length > 0) {
                        setMetrics(response.data[0]);
                    }
                } catch (err) { console.error("Could not fetch health metrics", err); }
            }
        };
        fetchLatestMetric();
    }, [authTokens, profile]);

    const userAvatar = profile?.profile_photo 
        ? `${fileBaseUrl}${profile.profile_photo}`
        : `https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=3a7bff&color=fff&rounded=true`;

    const bloodStatus = metrics ? `${metrics.blood_pressure_systolic || '...'} / ${metrics.blood_pressure_diastolic || '...'}` : 'N/A';
    const heartRate = metrics?.heart_rate_bpm || 'N/A';
    const bloodCount = metrics?.blood_count || 'N/A';
    const glucose = metrics?.glucose_level_mg_dl || 'N/A';
    const mood = metrics?.mood || 'N/A';
    const sleep = metrics?.sleep_hours || 'N/A';
    const steps = metrics?.steps_taken || 'N/A';
    
    const getMoodIcon = () => {
        switch (mood) {
            case 'Happy': return <FiSmile size={24} />;
            case 'Calm': return <FiMeh size={24} />;
            default: return <FiFrown size={24} />;
        }
    };

    return (
        <Row>
            {/* --- Left Column (Main Vitals & Graphs) --- */}
            <Col lg={8}>
                <h1 className="theme-title mb-4" style={{fontWeight: '700', fontSize: '3rem'}}>Overview Conditions</h1>
                
                <div className="d-flex align-items-center mb-4">
                    <img src={userAvatar} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div className="ms-3">
                        <h3 className="theme-title mb-0">{profile?.name || 'Welcome!'}</h3>
                        <p className="text-muted mb-0">{profile?.gender || ''} {profile?.dob ? `(${new Date().getFullYear() - new Date(profile.dob).getFullYear()} yrs)` : ''}</p>
                    </div>
                    <Button variant="outline-secondary" size="sm" className="ms-auto" onClick={onEdit}>Edit Profile</Button>
                </div>

                <h5 className="theme-title mt-5 mb-3">My Vitals</h5>
                <Row className="mb-4">
                    <Col sm={6} lg={3} className="mb-3"><VitalsCard icon={<FiActivity size={24} />} title="Blood Status" value={bloodStatus} unit="mmHg" iconColor="#3a7bff" /></Col>
                    <Col sm={6} lg={3} className="mb-3"><VitalsCard icon={<FiHeart size={24} />} title="Heart Rate" value={heartRate} unit="bpm" iconColor="#e63946" /></Col>
                    <Col sm={6} lg={3} className="mb-3"><VitalsCard icon={<FiDroplet size={24} />} title="Blood Count" value={bloodCount} unit="Hgb" iconColor="#fca311" /></Col>
                    <Col sm={6} lg={3} className="mb-3"><VitalsCard icon={<FiTrendingUp size={24} />} title="Glucose Level" value={glucose} unit="mg/dL" iconColor="#1ee0ac" /></Col>
                </Row>

                <Row>
                    <Col md={7} className="mb-4">
                        <HeartRateGraph metrics={metrics} theme={theme} />
                    </Col>
                    <Col md={5} className="mb-4">
                        <BmiCard profile={profile} />
                    </Col>
                </Row>

                <h5 className="theme-title mt-4 mb-3">Other Vitals</h5>
                <Row>
                    <Col md={4} className="mb-3"><VitalsCard icon={getMoodIcon()} title="Mood" value={mood} unit="" iconColor="#ffc107" /></Col>
                    <Col md={4} className="mb-3"><VitalsCard icon={<FiMoon size={24} />} title="Sleep" value={sleep} unit="hours" iconColor="#6610f2" /></Col>
                    <Col md={4} className="mb-3"><VitalsCard icon={<FiZap size={24} />} title="Steps" value={steps} unit="" iconColor="#fd7e14" /></Col>
                </Row>
            </Col>
            
            {/* --- Right Column (Forms & Schedule) --- */}
            <Col lg={4}>
                <Button className="theme-button w-100 mb-4" onClick={onLogVitals}>
                    <FiPlus /> Log Your Daily Vitals
                </Button>
                <SmartwatchConnect />
                <Card className="theme-card mt-4">
                    <Card.Body>
                        <Card.Title className="theme-title">My Schedule</Card.Title>
                        <p className="text-muted">(Appointments will be shown here)</p>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};


// --- Main Dashboard Component ---
function Dashboard() {
    const { user, profile, fetchProfile } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showVitalsModal, setShowVitalsModal] = useState(false); 

    const handleCloseProfileModal = () => setShowProfileModal(false);
    const handleShowProfileModal = () => setShowProfileModal(true);
    
    const handleCloseVitalsModal = () => setShowVitalsModal(false);
    const handleShowVitalsModal = () => setShowVitalsModal(true);

    useEffect(() => {
        if (!profile) {
            setShowProfileModal(true);
        }
    }, [profile]);

    const handleProfileComplete = () => {
        handleCloseProfileModal();
        if(fetchProfile) fetchProfile();
    };
    
    const handleVitalsLogged = () => {
        handleCloseVitalsModal();
        if(fetchProfile) fetchProfile();
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

    const renderIncompleteProfileCard = (userType) => (
        <Card className="theme-card text-center mb-4">
            <Card.Body>
                <Card.Title className="theme-title">Welcome to Mediprior!</Card.Title>
                {/* --- 4. THIS IS THE TYPO FIX --- */}
                <Card.Text className="text-muted">
                    Please complete your {userType === 'PATIENT' ? 'patient' : 'doctor'} profile.
                </Card.Text>
                {/* It was </Additional> before */}
                {/* ------------------------- */}
                <Button className="theme-button" onClick={handleShowProfileModal}>
                    Complete Profile Now
                </Button>
            </Card.Body>
        </Card>
    );

    const renderDashboardContent = () => {
        if (!user) return <p className="text-muted text-center">Loading...</p>;
        
        if (!profile && user.user_type === 'PATIENT') {
            return <PatientDashboard profile={null} onEdit={handleShowProfileModal} onLogVitals={handleShowVitalsModal} />
        }
        if (!profile && user.user_type === 'DOCTOR') {
            return renderIncompleteProfileCard(user.user_type);
        }

        // --- Doctor Flow ---
        if (user.user_type === 'DOCTOR') {
            if (profile.verification_status === 'PENDING') {
                return (
                    <>
                        <Alert variant="warning" className="text-center">
                            <Alert.Heading>Your Profile is Under Review</Alert.Heading>
                            <p>Thank you for submitting. We will notify you upon approval.</p>
                        </Alert>
                        <DoctorProfileCard profile={profile} onEdit={handleShowProfileModal} />
                    </>
                );
            }
            if (profile.verification_status === 'REJECTED') {
                return (
                    <>
                        <Alert variant="danger" className="text-center">
                            <Alert.Heading>Your Profile Was Rejected</Alert.Heading>
                            <p>Please review your details and resubmit, or contact support.</p>
                        </Alert>
                        <DoctorProfileCard profile={profile} onEdit={handleShowProfileModal} />
                    </>
                );
            }
            // VERIFIED Doctor Flow
            return (
                <div>
                    <h2 className="theme-title d-flex align-items-center mb-4">
                        Dashboard 
                        <Badge bg="success" className="ms-3 d-flex align-items-center">
                            <FiCheckCircle className="me-1" /> Verified
                        </Badge>
                    </h2>
                    <Row className="mb-4">
                        <Col sm={6} md={4} className="mb-3"><VitalsCard title="Total Patients" value="230" icon={<FiUsers />} iconColor="#3a7bff" /></Col>
                        <Col sm={6} md={4} className="mb-3"><VitalsCard title="Surgeries" value="90" icon={<FiClipboard />} iconColor="#1ee0ac" /></Col>
                        <Col sm={12} md={4} className="mb-3"><VitalsCard title="Reviews" value="4.5/5.0" icon={<FiStar />} iconColor="#ffc107" /></Col>
                    </Row>
                    <Row>
                        <Col lg={5} className="mb-4"><DoctorProfileCard profile={profile} onEdit={handleShowProfileModal} /></Col>
                        <Col lg={7}><TodaySchedule /><AvailabilityGrid /></Col>
                    </Row>
                </div>
            );
        }

        // --- Patient Flow ---
        if (user.user_type === 'PATIENT') {
            return <PatientDashboard profile={profile} onEdit={handleShowProfileModal} onLogVitals={handleShowVitalsModal} />;
        }
    };

    return (
        <Container fluid className="mt-4">
            {renderDashboardContent()}

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered size="lg">
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>{renderProfileForm()}</Modal.Body>
            </Modal>
            
            {/* NEW Vitals Modal */}
            <Modal show={showVitalsModal} onHide={handleCloseVitalsModal} centered size="lg">
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <HealthMetricForm onComplete={handleVitalsLogged} />
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Dashboard;