// src/components/DoctorProfileForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';

// 1. ACCEPT 'profile' AS A PROP
function DoctorProfileForm({ onComplete, profile }) {
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
    const fileBaseUrl = 'http://127.0.0.1:8000'; // For "View" links

    // 2. NEW: useEffect TO FILL THE FORM for editing
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setPhoneNumber(profile.phone_number || '');
            setDob(profile.dob || '');
            setGender(profile.gender || '');
            setMedicalRegistrationNumber(profile.medical_registration_number || '');
            setMedicalCouncil(profile.medical_council || '');
            setQualification(profile.qualification || '');
            setSpecialization(profile.specialization || '');
            setYearsOfExperience(profile.years_of_experience || '');
            setClinicName(profile.clinic_name || '');
            setConsultationType(profile.consultation_type || 'BOTH');
            setBio(profile.bio || '');
        }
    }, [profile]); // This runs when the profile prop is passed in

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        
        // Append all the text fields
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

        // Append files (only if they are newly selected)
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
            // Send the FormData
            await axios.post('http://127.0.0.1:8000/api/profile/', formData);
            
            setLoading(false);
            if(onComplete) {
                onComplete(); // Tell the dashboard to close the modal and refresh
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
        <Form onSubmit={handleSubmit} className="p-3">
            {/* 3. DYNAMIC TITLE */}
            <h2 className="text-center mb-4 theme-title">
                {profile ? 'Edit Your Doctor Profile' : 'Complete Your Doctor Profile'}
            </h2>
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
                    {/* 4. NEW PHONE INPUT */}
                    <Form.Group className="mb-3" controlId="docPhone">
                        <Form.Label>Phone Number</Form.Label>
                        <PhoneInput
                            international
                            defaultCountry="IN"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            className="theme-input"
                        />
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

            {/* --- 5. UPDATED FILE INPUTS --- */}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docDegree">
                        <Form.Label>Medical Degree Certificate</Form.Label>
                        {/* Only required if it's a new profile */}
                        <Form.Control type="file" onChange={(e) => setMedicalDegreeCert(e.target.files[0])} className="theme-input" required={!profile} />
                        {/* Show link to existing file if it exists */}
                        {profile && profile.medical_degree_certificate && (
                            <Form.Text className="text-muted">
                                Current file: <a href={`${fileBaseUrl}${profile.medical_degree_certificate}`} target="_blank" rel="noopener noreferrer">View</a>
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="docReg">
                        <Form.Label>Medical Registration Certificate</Form.Label>
                        <Form.Control type="file" onChange={(e) => setMedicalRegCert(e.target.files[0])} className="theme-input" required={!profile} />
                        {profile && profile.medical_registration_certificate && (
                            <Form.Text className="text-muted">
                                Current file: <a href={`${fileBaseUrl}${profile.medical_registration_certificate}`} target="_blank" rel="noopener noreferrer">View</a>
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="docPhoto">
                <Form.Label>Profile Photo (Optional)</Form.Label>
                <Form.Control type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} className="theme-input" />
                {profile && profile.profile_photo && (
                    <Form.Text className="text-muted">
                        Current photo: <a href={`${fileBaseUrl}${profile.profile_photo}`} target="_blank" rel="noopener noreferrer">View</a>
                    </Form.Text>
                )}
            </Form.Group>
            
            <div className="d-grid mt-4">
                {/* 6. DYNAMIC BUTTON TEXT */}
                <Button type="submit" size="lg" className="theme-button" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (profile ? 'Update Profile' : 'Submit for Verification')}
                </Button>
            </div>
        </Form>
    );
}

export default DoctorProfileForm;