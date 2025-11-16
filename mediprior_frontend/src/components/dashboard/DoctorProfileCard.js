// src/components/dashboard/DoctorProfileCard.js
import React from 'react';
import { Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

// Import the icons for the list
import {
    FiUser, FiMail, FiPhone, FiAward,
    FiBook, FiCheckSquare, FiBriefcase
} from 'react-icons/fi';

// Helper component for each detail row
const DetailRow = ({ icon, label, value }) => (
    <ListGroup.Item className="d-flex align-items-center">
        <FiUser as={icon} className="me-3" size={20} style={{ color: 'var(--text-secondary)' }} />
        <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
            <p className="theme-title mb-0" style={{ fontWeight: '500' }}>{value || 'Not set'}</p>
        </div>
    </ListGroup.Item>
);

function DoctorProfileCard({ profile, onEdit }) {
    const { user } = useAuth();
    const fileBaseUrl = 'http://127.0.0.1:8000';

    const userAvatar = profile?.profile_photo 
        ? `${fileBaseUrl}${profile.profile_photo}`
        : null; // We'll handle the placeholder below

    return (
        <Card className="theme-card h-100">
            <Card.Body>
                {/* --- Top Section --- */}
                <div className="text-center mb-3">
                    {/* 1. Use uploaded photo or placeholder icon */}
                    {userAvatar ? (
                        <img 
                            src={userAvatar} 
                            alt={profile.name}
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                    ) : (
                        // This is the placeholder, like your image
                        <div style={{ 
                            width: '100px', height: '100px', borderRadius: '50%', 
                            backgroundColor: 'var(--bg-primary)', display: 'grid', 
                            placeItems: 'center', margin: '0 auto', border: '2px solid var(--border-color)'
                        }}>
                            <FiUser size={40} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                    )}

                    <Badge bg={profile.verification_status === 'VERIFIED' ? 'success' : 'warning'} className="mt-3">
                        {profile.verification_status}
                    </Badge>

                    <h3 className="theme-title mt-2 mb-1">{profile.name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{profile.specialization}</p>
                    <Button className="theme-button" onClick={onEdit}>Edit Profile</Button>
                </div>

                {/* --- Details List Section --- */}
                <ListGroup variant="flush" className="mt-4">
                    <DetailRow icon={FiUser} label="Gender" value={profile.gender} />
                    <DetailRow icon={FiMail} label="Email" value={user.email} />
                    <DetailRow icon={FiPhone} label="Phone Number" value={profile.phone_number} />
                    <DetailRow icon={FiAward} label="Experience" value={`${profile.years_of_experience} years`} />
                    <DetailRow icon={FiBook} label="Education" value={profile.qualification} />
                    <DetailRow icon={FiCheckSquare} label="License Number" value={profile.medical_registration_number} />
                    <DetailRow icon={FiBriefcase} label="Specialization" value={profile.specialization} />
                    {/* We can add 'Address' back once we add it to the form */}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default DoctorProfileCard;