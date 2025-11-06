// src/components/PatientReports.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To ensure we're logged in

function PatientReports() {
    const [reports, setReports] = useState([]);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth(); // Get user info

    // Function to fetch all reports from the backend
    const fetchReports = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/reports/');
            setReports(response.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Could not load reports.');
        }
    };

    // UseEffect to fetch reports when the component first loads
    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]); // Re-run if user changes

    // Handle the file upload form submission
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
            // Post the new report to the API
            await axios.post('http://127.0.0.1:8000/api/reports/', formData);
            
            // Clear the form and refresh the list
            setTitle('');
            setFile(null);
            e.target.reset(); // Reset file input
            setUploading(false);
            fetchReports(); // Refresh the list
        } catch (err) {
            console.error('Error uploading report:', err);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    // Function to handle deletion
    const handleDelete = async (reportId) => {
        // Show a confirmation dialog
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                // Send a DELETE request to our new endpoint
                await axios.delete(`http://127.0.0.1:8000/api/reports/${reportId}/`);
                // Refresh the list of reports
                fetchReports();
            } catch (err) {
                console.error('Error deleting report:', err);
                setError('Could not delete the report.');
            }
        }
    };

    // Helper to format the date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            {/* --- 1. Upload Report Form --- */}
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

            {/* --- 2. List of Existing Reports --- */}
            <Card className="theme-card">
                <Card.Body>
                    <Card.Title className="theme-title">My Medical Reports</Card.Title>
                    <ListGroup variant="flush">
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <ListGroup.Item key={report.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{report.title}</strong>
                                        <br />
                                        <small className="text-muted">Uploaded: {formatDate(report.uploaded_at)}</small>
                                    </div>
                                    <div> {/* Group buttons together */}
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            href={`http://127.0.0.1:8000${report.file}`} // Direct link
                                            target="_blank" // Open in a new tab
                                        >
                                            View
                                        </Button>
                                        
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleDelete(report.id)}
                                        >
                                            Delete
                                        </Button> 
                                        {/* The extra '>' is now removed */}
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