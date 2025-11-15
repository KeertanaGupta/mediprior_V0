// src/components/dashboard/HealthMetricForm.js
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function HealthMetricForm() {
    // State for all the new fields
    const [heartRate, setHeartRate] = useState('');
    const [bpSystolic, setBpSystolic] = useState('');
    const [bpDiastolic, setBpDiastolic] = useState('');
    const [glucose, setGlucose] = useState('');
    const [bloodCount, setBloodCount] = useState('');
    const [sleepHours, setSleepHours] = useState('');
    const [stepsTaken, setStepsTaken] = useState('');
    const [mood, setMood] = useState('');
    const [symptoms, setSymptoms] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { authTokens } = useAuth(); // Get tokens for the API call

    const clearForm = () => {
        setHeartRate('');
        setBpSystolic('');
        setBpDiastolic('');
        setGlucose('');
        setBloodCount('');
        setSleepHours('');
        setStepsTaken('');
        setMood('');
        setSymptoms('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const metricData = {
            heart_rate_bpm: parseFloat(heartRate) || null,
            blood_pressure_systolic: parseInt(bpSystolic) || null,
            blood_pressure_diastolic: parseInt(bpDiastolic) || null,
            glucose_level_mg_dl: parseFloat(glucose) || null,
            blood_count: parseFloat(bloodCount) || null,
            sleep_hours: parseFloat(sleepHours) || null,
            steps_taken: parseInt(stepsTaken) || null,
            mood: mood,
            symptoms: symptoms
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/health-metrics/', metricData, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setSuccess('Your health insights have been saved!');
            clearForm();
        } catch (err) {
            console.error('Error saving metrics:', err.response);
            setError('Failed to save. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="theme-card mb-4">
            <Card.Body>
                <Card.Title className="theme-title">Log Your Daily Vitals</Card.Title>
                <p className="text-muted">
                    Add your health insights here. This will update your dashboard.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="heartRate">
                                <Form.Label>Heart Rate (bpm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 70"
                                    value={heartRate}
                                    onChange={(e) => setHeartRate(e.target.value)}
                                    className="theme-input"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="bloodPressure">
                                <Form.Label>Blood Pressure (Systolic/Diastolic)</Form.Label>
                                <Row>
                                    <Col>
                                        <Form.Control type="number" placeholder="Sys (e.g., 120)" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} className="theme-input" />
                                    </Col>
                                    <Col>
                                        <Form.Control type="number" placeholder="Dia (e.g., 80)" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} className="theme-input" />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="glucose">
                                <Form.Label>Glucose Level (mg/dL)</Form.Label>
                                <Form.Control type="number" placeholder="e.g., 90" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="theme-input" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="bloodCount">
                                <Form.Label>Blood Count (e.g., Hgb)</Form.Label>
                                <Form.Control type="number" placeholder="e.g., 14.5" value={bloodCount} onChange={(e) => setBloodCount(e.target.value)} className="theme-input" />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="sleepHours">
                                <Form.Label>Hours Slept</Form.Label>
                                <Form.Control type="number" placeholder="e.g., 7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="theme-input" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="stepsTaken">
                                <Form.Label>Steps Taken</Form.Label>
                                <Form.Control type="number" placeholder="e.g., 8000" value={stepsTaken} onChange={(e) => setStepsTaken(e.target.value)} className="theme-input" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="mood">
                        <Form.Label>How are you feeling today?</Form.Label>
                        <Form.Select value={mood} onChange={(e) => setMood(e.target.value)} className="theme-input">
                            <option value="">Select mood...</option>
                            <option value="Happy">Happy</option>
                            <option value="Calm">Calm</option>
                            <option value="Stressed">Stressed</option>
                            <option value="Anxious">Anxious</option>
                            <option value="Sad">Sad</option>
                            <option value="Tired">Tired</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="symptoms">
                        <Form.Label>Any Symptoms?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="e.g., Mild headache, sore throat..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="theme-input"
                        />
                    </Form.Group>

                    <Button type="submit" className="theme-button" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Today\'s Insights'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default HealthMetricForm;