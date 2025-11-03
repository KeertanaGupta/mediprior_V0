// src/components/DoctorProfileForm.js
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// We pass 'onComplete' as a prop. The Dashboard will use this
// to close the modal and refresh the profile.
function DoctorProfileForm({ onComplete }) {
    // State for all 13 fields
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
    const [medicalCouncil, setMedicalCouncil] = useState('');
    const [qualification, setQualification] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [consultationType, setConsultationType] = useState('BOTH');
    const [bio, setBio] = useState('');
    
    // State for the files
    const [medicalDegreeCert, setMedicalDegreeCert] = useState(null);
    const [medicalRegCert, setMedicalRegCert] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);

    // State for loading and errors
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 1. We must use FormData for file uploads.
        const formData = new FormData();
        
        // 2. Append all the text fields
        formData.append('name', name);
        formData.append('phone_number', phoneNumber);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('medical_registration_number', medicalRegistrationNumber);
        formData.append('medical_council', medicalCouncil);
        formData.append('qualification', qualification);
        formData.append('specialization', specialization);
        formData.append('years_of_experience', yearsOfExperience);
        formData.append('clinic_name', clinicName);
        formData.append('consultation_type', consultationType);
        formData.append('bio', bio);

        // 3. Append files (only if they exist)
        if (medicalDegreeCert) {
            formData.append('medical_degree_certificate', medicalDegreeCert);
        }
        if (medicalRegCert) {
            formData.append('medical_registration_certificate', medicalRegCert);
        }
        if (profilePhoto) {
            formData.append('profile_photo', profilePhoto);
        }

        try {
            // 4. Send the FormData
            await axios.post('http://127.0.0.1:8000/api/profile/', formData);
            
            setLoading(false);
            // Tell the parent (Dashboard) that we are done
            if(onComplete) {
                onComplete();
            } else {
                navigate(0); // Fallback: reload the page
            }

        } catch (apiError) {
            setLoading(false);
            console.error('Profile setup error:', apiError.response);
            setError('Failed to save profile. Please check all fields and try again.');
        }
    };

    return (
        // This form will be placed inside a Modal, so we don't need a Card
        <Form onSubmit={handleSubmit} className="p-3">
            <h2 className="text-center mb-4 theme-title">Complete Your Doctor Profile</h2>
            <p className="text-center text-muted mb-4">
                Your profile will be reviewed for verification.
            </p>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docPhone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="theme-input" />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docDob">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="theme-input" />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docGender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} className="theme-input">
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <hr className="my-4" />
            <p className="text-muted small">Your registration will be verified with the National Medical Commission database before approval.</p>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docRegNum">
                        <Form.Label>Medical Registration Number</Form.Label>
                        <Form.Control type="text" value={medicalRegistrationNumber} onChange={(e) => setMedicalRegistrationNumber(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docCouncil">
                        <Form.Label>Medical Council Name (e.g., NMC)</Form.Label>
                        <Form.Control type="text" value={medicalCouncil} onChange={(e) => setMedicalCouncil(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docQual">
                        <Form.Label>Qualification (e.g., MBBS, MD)</Form.Label>
                        <Form.Control type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docSpec">
                        <Form.Label>Specialization</Form.Label>
                        <Form.Control type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
            </Row>

             <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docExp">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} className="theme-input" required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docConsult">
                        <Form.Label>Consultation Type</Form.Label>
                        <Form.Select value={consultationType} onChange={(e) => setConsultationType(e.target.value)} className="theme-input">
                            <option value="BOTH">Both</option>
                            <option value="ONLINE">Online</option>
                            <option value="IN_PERSON">In-Person</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="docClinic">
                <Form.Label>Clinic / Hospital Name</Form.Label>
                <Form.Control type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="theme-input" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="docBio">
                <Form.Label>Short Professional Bio (max 250 chars)</Form.Label>
                <Form.Control as="textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="theme-input" />
            </Form.Group>

            <hr className="my-4" />

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docDegree">
                        <Form.Label>Upload Medical Degree Certificate</Form.Label>
                        <Form.Control type="file" onChange={(e) => setMedicalDegreeCert(e.target.files[0])} className="theme-input" required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docReg">
                        <Form.Label>Upload Medical Registration Certificate</Form.Label>
                        <Form.Control type="file" onChange={(e) => setMedicalRegCert(e.target.files[0])} className="theme-input" required />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="docPhoto">
                <Form.Label>Profile Photo (Optional)</Form.Label>
                <Form.Control type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} className="theme-input" />
            </Form.Group>
            
            <div className="d-grid mt-4">
                <Button type="submit" size="lg" className="theme-button" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Submit for Verification'}
                </Button>
            </div>
        </Form>
    );
}

export default DoctorProfileForm;