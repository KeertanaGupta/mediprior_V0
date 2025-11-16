// src/components/PatientReports.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import axios from 'axios';
// --- THIS IS THE FIX ---
import { useAuth } from '../context/AuthContext'; // It was ../../

function PatientReports() {
    const [reports, setReports] = useState([]);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const { user, authTokens } = useAuth(); 

    const fetchReports = React.useCallback(async() => {
        if (!authTokens) {
            setError('You must be logged in to see reports.');
            return;
        }
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/reports/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setReports(response.data);
            setError(''); 
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Could not load reports.');
        }
    },[authTokens]);

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user, authTokens]); 

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        try {
            await axios.post('http://127.0.0.1:8000/api/reports/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authTokens.access}` 
                }
            });
            
            setTitle('');
            setFile(null);
            e.target.reset();
            setUploading(false);
            fetchReports();
        } catch (err) {
            console.error('Error uploading report:', err);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/reports/${reportId}/`, {
                    headers: { Authorization: `Bearer ${authTokens.access}` }
                });
                fetchReports();
            } catch (err) {
                console.error('Error deleting report:', err);
                setError('Could not delete the report.');
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Card className="theme-card mb-4">
                <Card.Body>
                    <Card.Title className="theme-title">Upload New Report</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleUpload}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="reportTitle">
                                    <Form.Label>Report Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Blood Test Results"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="theme-input"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="reportFile">
                                    <Form.Label>Report File (PDF, JPG, etc.)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="theme-input"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" className="theme-button" disabled={uploading}>
                            {uploading ? <Spinner as="span" animation="border" size="sm" /> : 'Upload'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="theme-card">
                <Card.Body>
                    <Card.Title className="theme-title">My Medical Reports</Card.Title>
                    <ListGroup variant="flush">
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <ListGroup.Item 
                                    key={report.id} 
                                    className="d-flex justify-content-between align-items-center"
                                    style={{backgroundColor: 'transparent', color: 'var(--text-primary)'}}
                                >
                                    <div>
                                        <strong>{report.title}</strong>
                                        <br />
                                        <small className="text-muted">Uploaded: {formatDate(report.uploaded_at)}</small>
                                    </div>
                                    <div>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            href={`http://127.0.0.1:8000${report.file}`}
                                            target="_blank"
                                        >
                                            View/Export
                                        </Button>
                                        
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleDelete(report.id)}
                                        >
                                            Delete
                                        </Button> 
                                    </div>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p className="text-muted">You have not uploaded any reports yet.</p>
                        )}
                    </ListGroup>
                </Card.Body>
            </Card>
        </>
    );
}

export default PatientReports;