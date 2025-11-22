// src/pages/ChatPage.js
import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow'; // <-- 1. IMPORT

function ChatPage() {
    const [selectedConversation, setSelectedConversation] = useState(null);

    return (
        <Row style={{ height: 'calc(100vh - 4rem)' }}>
            
            <Col lg={4} style={{ height: '100%' }}>
                <ChatList onSelectConversation={setSelectedConversation} />
            </Col>
            <Col lg={8} style={{ height: '100%' }}>
                {/* --- 2. USE THE CHAT WINDOW --- */}
                {selectedConversation ? (
                    <ChatWindow conversation={selectedConversation} />
                ) : (
                    <Card className="theme-card h-100">
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <p className="text-muted">Select a conversation to start chatting.</p>
                        </Card.Body>
                    </Card>
                )}
            </Col>
        </Row>
    );
}

export default ChatPage;