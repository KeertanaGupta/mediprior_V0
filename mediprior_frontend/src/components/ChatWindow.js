// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, InputGroup, Row, Col, Tabs, Tab, ListGroup, Toast, ToastContainer, Modal } from 'react-bootstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiCamera, FiPaperclip, FiSend, FiAlertTriangle, FiPhone, FiMapPin, FiTrash2, FiFileText } from 'react-icons/fi';

// ... (bubbleStyles, inputFooterStyle, textInputStyle, EmergencyContactCard are unchanged) ...
const bubbleStyles = {
    messageContainer: { display: 'flex', flexDirection: 'column', padding: '10px 20px', overflowY: 'auto', height: 'calc(100vh - 220px)' },
    bubble: { maxWidth: '70%', padding: '10px 15px', borderRadius: '15px', marginBottom: '10px', wordWrap: 'break-word', lineHeight: '1.4', fontSize: '0.95rem' },
    sent: { backgroundColor: 'var(--accent-primary)', color: 'white', alignSelf: 'flex-end', borderBottomRightRadius: '5px' },
    received: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', alignSelf: 'flex-start', borderBottomLeftRadius: '5px' },
    timestamp: { fontSize: '0.7rem', opacity: 0.7, marginTop: '5px' },
    sentTimestamp: { textAlign: 'right' },
    receivedTimestamp: { textAlign: 'left' }
};
const inputFooterStyle = { borderTop: '1px solid var(--border-color)', padding: '1rem', backgroundColor: 'var(--bg-primary)' };
const textInputStyle = { backgroundColor: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-primary)', borderRadius: '10px', height: '45px' };

const EmergencyContactCard = ({ doctorProfile }) => (
    <Card className="theme-card mt-3 border-danger">
        <Card.Body>
            <Card.Title className="theme-title mb-3 d-flex align-items-center text-danger" style={{fontSize: '1rem'}}>
                <FiAlertTriangle className="me-2" /> Emergency Contacts
            </Card.Title>
            <ListGroup variant="flush" style={{fontSize: '0.9rem'}}>
                <ListGroup.Item style={{background: 'transparent', color: 'var(--text-primary)'}}>
                    <FiMapPin className="me-2" /> <strong>Hosp:</strong> {doctorProfile?.hospital_name || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item style={{background: 'transparent', color: 'var(--text-primary)'}}>
                    <FiPhone className="me-2" /> <strong>Recep:</strong> {doctorProfile?.hospital_reception_number || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item style={{background: 'transparent', color: 'var(--text-primary)'}}>
                    <FiPhone className="me-2 text-danger" /> <strong>Emerg:</strong> {doctorProfile?.emergency_contact_number || 'N/A'}
                </ListGroup.Item>
            </ListGroup>
        </Card.Body>
    </Card>
);

function ChatWindow({ conversation }) {
    const [messageHistory, setMessageHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [inputDisabled, setInputDisabled] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('warning');
    
    // --- NEW: Report Sharing ---
    const [showReportModal, setShowReportModal] = useState(false);
    const [myReports, setMyReports] = useState([]);

    const { user, authTokens } = useAuth();
    const lastMessageRef = useRef(null); 

    const otherPerson = user.user_type === 'PATIENT' ? conversation.doctor_profile : conversation.patient_profile;
    const socketUrl = `ws://127.0.0.1:8000/ws/chat/${conversation.id}/?token=${authTokens.access}`;
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    const [doctorStatus, setDoctorStatus] = useState('AVAILABLE'); 

    const updateDoctorStatus = async (newStatus) => {
        if (user.user_type !== 'DOCTOR') return;
        try {
            const formData = new FormData();
            formData.append('chat_status', newStatus);
            await axios.post('http://127.0.0.1:8000/api/profile/', formData, { headers: { Authorization: `Bearer ${authTokens.access}` } });
            setDoctorStatus(newStatus);
        } catch (e) { console.error(e); }
    };

    const handleClearChat = () => {
        if(window.confirm("Clear your chat history? This cannot be undone.")) {
            sendMessage(JSON.stringify({ 'command': 'clear_history' }));
        }
    };

    // --- Fetch Reports for Sharing ---
    const fetchReports = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/reports/', { headers: { Authorization: `Bearer ${authTokens.access}` } });
            setMyReports(response.data);
            setShowReportModal(true);
        } catch (e) { alert("Could not load reports."); }
    };

    const handleShareReport = (report) => {
        // Send a message with the report link
        const reportLink = `http://127.0.0.1:8000${report.file}`;
        sendMessage(JSON.stringify({ 'message': `Shared Report: ${report.title}\n${reportLink}` }));
        setShowReportModal(false);
    };

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            if (data.type === 'history') { setMessageHistory(data.messages); } 
            else if (data.type === 'message') { setMessageHistory((prev) => [...prev, data]); if (user.user_type === 'PATIENT' && data.sender_id !== user.user_id) setInputDisabled(false); } 
            else if (data.type === 'cleared') { setMessageHistory([]); setToastMessage('History cleared.'); setToastVariant('info'); setShowToast(true); } 
            else if (data.type === 'error') { setToastMessage(data.message); setToastVariant('danger'); setShowToast(true); if (data.code === 'limit_reached') setInputDisabled(true); }
        }
    }, [lastMessage, user]);

    useEffect(() => { lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messageHistory]);

    const handleSend = () => {
        if (message.trim() === '') return;
        sendMessage(JSON.stringify({ 'message': message }));
        setMessage('');
    };

    const getAvatar = (profile) => profile?.profile_photo ? `http://127.0.0.1:8000${profile.profile_photo}` : `https://ui-avatars.com/api/?name=${profile?.name}&background=3a7bff&color=fff&rounded=true`;

    return (
        <Row style={{height: '100%', margin: 0}}>
            <Col md={8} className="p-0 h-100">
                <Card className="theme-card h-100" style={{borderRadius: '15px 0 0 15px', borderRight: 'none'}}>
                    <Card.Header className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <img src={getAvatar(otherPerson)} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
                            <div><h5 className="theme-title mb-0">{otherPerson.name}</h5><small className="text-muted">{readyState === ReadyState.OPEN ? 'Online' : 'Connecting...'}</small></div>
                        </div>
                        <div className="d-flex align-items-center">
                             <Button variant="link" className="text-danger me-2" onClick={handleClearChat} title="Clear Chat History"><FiTrash2 /></Button>
                            {user.user_type === 'DOCTOR' && (
                                <Form.Select size="sm" style={{width: 'auto', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}} value={doctorStatus} onChange={(e) => updateDoctorStatus(e.target.value)}>
                                    <option value="AVAILABLE">Available</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option>
                                </Form.Select>
                            )}
                        </div>
                    </Card.Header>

                    <div style={bubbleStyles.messageContainer}>
                        <ToastContainer className="p-3" position="top-center" style={{zIndex: 1}}>
                            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
                                <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                            </Toast>
                        </ToastContainer>
                        {messageHistory.map((msg, idx) => {
                            const isSent = msg.sender_id === user.user_id;
                            return (
                                <div key={idx} style={{...bubbleStyles.bubble, ...(isSent ? bubbleStyles.sent : bubbleStyles.received)}}>
                                    {msg.message.startsWith('Shared Report:') ? (
                                        <div>
                                            <strong>File Shared</strong><br/>
                                            <a href={msg.message.split('\n')[1]} target="_blank" rel="noopener noreferrer" style={{color: isSent ? 'white' : 'var(--accent-primary)', textDecoration: 'underline'}}>
                                                {msg.message.split('\n')[0].replace('Shared Report: ', '')}
                                            </a>
                                        </div>
                                    ) : msg.message}
                                    <div style={{...bubbleStyles.timestamp, ...(isSent ? bubbleStyles.sentTimestamp : bubbleStyles.receivedTimestamp)}}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            );
                        })}
                        <div ref={lastMessageRef} />
                    </div>
                    
                    <Card.Footer style={inputFooterStyle}>
                        <InputGroup>
                            {/* SHARE REPORT BUTTON */}
                            {user.user_type === 'PATIENT' && (
                                <Button variant="outline-secondary" style={{border: 'none', color: 'var(--text-secondary)', height: '45px'}} onClick={fetchReports} title="Share Report">
                                    <FiFileText />
                                </Button>
                            )}
                            <Button variant="outline-secondary" style={{border: 'none', color: 'var(--text-secondary)', height: '45px'}} onClick={() => alert('Photo upload coming soon!')}><FiCamera /></Button>
                            <Form.Control type="text" placeholder="Type a message..." style={textInputStyle} value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={inputDisabled} />
                            <Button className="theme-button" onClick={handleSend} disabled={inputDisabled}><FiSend /></Button>
                        </InputGroup>
                    </Card.Footer>
                </Card>
            </Col>

            <Col md={4} className="p-0 h-100">
                <Card className="theme-card h-100" style={{borderRadius: '0 15px 15px 0', borderLeft: '1px solid var(--border-color)'}}>
                    <Card.Body>
                        <Tabs defaultActiveKey="profile" id="chat-info-tabs" className="mb-3">
                            <Tab eventKey="profile" title="Profile">
                                <div className="text-center mt-3 mb-3">
                                    <img src={getAvatar(otherPerson)} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
                                    <h5 className="theme-title">{otherPerson.name}</h5>
                                    <p className="text-muted">{otherPerson.specialization || 'Patient'}</p>
                                </div>
                                <ListGroup variant="flush">
                                    <ListGroup.Item style={{background: 'transparent', color: 'var(--text-primary)'}}><strong>Email:</strong> {otherPerson.email}</ListGroup.Item>
                                    {otherPerson.clinic_name && <ListGroup.Item style={{background: 'transparent', color: 'var(--text-primary)'}}><strong>Clinic:</strong> {otherPerson.clinic_name}</ListGroup.Item>}
                                </ListGroup>
                                {user.user_type === 'PATIENT' && <EmergencyContactCard doctorProfile={otherPerson} />}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Col>

            {/* REPORT SELECTION MODAL */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton><Modal.Title className="theme-title">Share a Report</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {myReports.length > 0 ? myReports.map(report => (
                            <ListGroup.Item key={report.id} action onClick={() => handleShareReport(report)} className="d-flex justify-content-between align-items-center">
                                {report.title}
                                <FiSend />
                            </ListGroup.Item>
                        )) : <p className="text-muted">No reports found.</p>}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </Row>
    );
}
export default ChatWindow;