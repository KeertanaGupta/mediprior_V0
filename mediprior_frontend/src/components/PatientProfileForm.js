// src/components/PatientProfileForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT useAuth

function PatientProfileForm({ onComplete, profile }) {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); 
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 2. GET THE TOKEN
    const { authTokens } = useAuth(); 
    const fileBaseUrl = 'http://127.0.0.1:8000';

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setDob(profile.dob || '');
            setGender(profile.gender || '');
            setBloodGroup(profile.blood_group || '');
            setPhoneNumber(profile.phone_number || '');
            setHeight(profile.height || '');
            setWeight(profile.weight || '');
            setMedicalHistory(profile.medical_history || '');
        }
    }, [profile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('blood_group', bloodGroup);
        formData.append('phone_number', phoneNumber);
        formData.append('height', parseFloat(height) || null);
        formData.append('weight', parseFloat(weight) || null);
        formData.append('medical_history', medicalHistory);
        
        if (profilePhoto) {
            formData.append('profile_photo', profilePhoto);
        }

        try {
            // 5. SEND FORMDATA WITH TOKEN
            await axios.post('http://127.0.0.1:8000/api/profile/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data', // Let axios set this
                    Authorization: `Bearer ${authTokens.access}` 
                }
            });
            
            setLoading(false);
            if(onComplete) onComplete();
        } catch (apiError) {
            setLoading(false);
            console.error('Profile setup error:', apiError.response);
            setError('Failed to save profile. Please check your inputs and try again.');
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3">
            <h2 className="text-center mb-4 theme-title">
                {profile ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* 6. ADD PROFILE PHOTO UPLOAD FIELD */}
            <Form.Group className="mb-3" controlId="patientPhoto">
                <Form.Label>Profile Photo (Optional)</Form.Label>
                <Form.Control type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} className="theme-input" />
                {profile && profile.profile_photo && (
                    <Form.Text className="text-muted">
                        Current photo: <a href={`${fileBaseUrl}${profile.profile_photo}`} target="_blank" rel="noopener noreferrer">View</a>
                    </Form.Text>
                )}
            </Form.Group>
            
            <Row>
                <Col md={6}><Form.Group className="mb-3" controlId="patientName"><Form.Label>Full Name</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} className="theme-input" required /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3" controlId="patientPhone"><Form.Label>Phone Number</Form.Label><PhoneInput international defaultCountry="IN" value={phoneNumber} onChange={setPhoneNumber} className="theme-input" /></Form.Group></Col>
            </Row>
            <Row>
                <Col md={4}><Form.Group className="mb-3" controlId="patientDob"><Form.Label>Date of Birth</Form.Label><Form.Control type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="theme-input" required /></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3" controlId="patientGender"><Form.Label>Gender</Form.Label><Form.Select value={gender} onChange={(e) => setGender(e.target.value)} className="theme-input"><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></Form.Select></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-3" controlId="patientBlood"><Form.Label>Blood Group</Form.Label><Form.Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="theme-input"><option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></Form.Select></Form.Group></Col>
            </Row>
            <Row>
                <Col md={6}><Form.Group className="mb-3" controlId="patientHeight"><Form.Label>Height (in cm)</Form.Label><Form.Control type="number" placeholder="(Optional)" value={height} onChange={(e) => setHeight(e.target.value)} className="theme-input" /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3" controlId="patientWeight"><Form.Label>Weight (in kg)</Form.Label><Form.Control type="number" placeholder="(Optional)" value={weight} onChange={(e) => setWeight(e.target.value)} className="theme-input" /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3" controlId="patientHistory"><Form.Label>Medical History</Form.Label><Form.Control as="textarea" rows={3} placeholder="Any known allergies, conditions, etc." value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className="theme-input" /></Form.Group>
            <div className="d-grid mt-4"><Button type="submit" size="lg" className="theme-button" disabled={loading}>{loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Profile'}</Button></div>
        </Form>
    );
}

export default PatientProfileForm;