// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from '../context/AuthContext';
import { FiCamera, FiPaperclip } from 'react-icons/fi'; // Icons for input

// --- NEW STYLING TO MATCH YOUR IMAGE ---
const bubbleStyles = {
    messageContainer: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 20px', // More padding
        overflowY: 'auto',
        height: 'calc(100vh - 220px)', // Adjusted height
    },
    bubble: {
        maxWidth: '70%',
        padding: '10px 15px',
        borderRadius: '15px', // Less rounded
        marginBottom: '10px',
        wordWrap: 'break-word',
        lineHeight: '1.4',
        fontSize: '0.95rem',
    },
    sent: {
        backgroundColor: 'var(--accent-primary)', // Blue
        color: 'white',
        alignSelf: 'flex-end',
    },
    received: {
        backgroundColor: 'var(--bg-tertiary)', // Dark grey
        color: 'var(--text-primary)',
        alignSelf: 'flex-start',
    },
    timestamp: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginTop: '5px',
    },
    sentTimestamp: {
        textAlign: 'right',
    },
    receivedTimestamp: {
        textAlign: 'left',
    }
};

const inputFooterStyle = {
    borderTop: '1px solid var(--border-color)',
    padding: '1.25rem',
};

const textInputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: 'none',
    color: 'var(--text-primary)',
    borderRadius: '10px 0 0 10px',
    height: '45px',
};
// --- END OF STYLING ---


function ChatWindow({ conversation }) {
    const [messageHistory, setMessageHistory] = useState([]);
    const [message, setMessage] = useState('');
    const { user, authTokens } = useAuth();
    const lastMessageRef = useRef(null); 

    const otherPerson = user.user_type === 'PATIENT' 
        ? conversation.doctor_profile
        : conversation.patient_profile;

    const socketUrl = `ws://127.0.0.1:8000/ws/chat/${conversation.id}/?token=${authTokens.access}`;

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            if (data.type === 'history') {
                setMessageHistory(data.messages);
            } else if (data.type === 'message') {
                setMessageHistory((prev) => [...prev, data]);
            }
        }
    }, [lastMessage, setMessageHistory]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageHistory]);

    const handleSend = () => {
        if (message.trim() === '') return;
        sendMessage(JSON.stringify({ 'message': message }));
        setMessage('');
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting...',
        [ReadyState.OPEN]: 'Online',
        [ReadyState.CLOSING]: 'Closing...',
        [ReadyState.CLOSED]: 'Offline',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const getAvatar = (profile) => {
        if (profile?.profile_photo) {
            return `http://127.0.0.1:8000${profile.profile_photo}`;
        }
        const name = profile?.name || 'User';
        return `https://ui-avatars.com/api/?name=${name}&background=3a7bff&color=fff&rounded=true`;
    };

    return (
        <Card className="theme-card h-100">
            <Card.Header className="d-flex align-items-center">
                <img 
                    src={getAvatar(otherPerson)}
                    alt="avatar"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }}
                />
                <div>
                    <h5 className="theme-title mb-0">{otherPerson.name}</h5>
                    <small className="text-muted">{connectionStatus}</small>
                </div>
            </Card.Header>

            <div style={bubbleStyles.messageContainer}>
                {readyState !== ReadyState.OPEN && <Alert variant="warning">Connecting to chat...</Alert>}
                
                {messageHistory.map((msg, idx) => {
                    const isSent = msg.sender_id === user.user_id;
                    return (
                        <div 
                            key={idx}
                            style={{
                                ...bubbleStyles.bubble,
                                ...(isSent ? bubbleStyles.sent : bubbleStyles.received)
                            }}
                        >
                            {msg.message}
                            <div style={{
                                ...bubbleStyles.timestamp,
                                ...(isSent ? bubbleStyles.sentTimestamp : bubbleStyles.receivedTimestamp)
                            }}>
                                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={lastMessageRef} />
            </div>
            
            <Card.Footer style={inputFooterStyle}>
                <InputGroup>
                    {/* Placeholder buttons from your image */}
                    <Button variant="outline-secondary" style={{border: 'none', color: 'var(--text-secondary)', height: '45px'}}><FiPaperclip /></Button>
                    <Button variant="outline-secondary" style={{border: 'none', color: 'var(--text-secondary)', height: '45px'}}><FiCamera /></Button>

                    <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        style={textInputStyle}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                        className="theme-button" 
                        onClick={handleSend} 
                        disabled={readyState !== ReadyState.OPEN}
                        style={{ borderRadius: '0 10px 10px 0', height: '45px' }}
                    >
                        Send
                    </Button>
                </InputGroup>
            </Card.Footer>
        </Card>
    );
}

export default ChatWindow;