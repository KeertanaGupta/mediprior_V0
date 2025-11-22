// src/pages/LandingPage.js
import React from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// --- FIX: Added FiUsers and FiPlus ---
import { 
    FiArrowRight, FiPlay, FiSearch, FiCalendar, FiClock, FiVideo, 
    FiStar, FiCheckCircle, FiFacebook, FiTwitter, FiInstagram, FiLinkedin,
    FiUsers, FiPlus
} from 'react-icons/fi';

// --- PLACEHOLDER IMAGES ---
const IMG_HERO_DOC = "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg";
const IMG_FEATURE_DOC = "https://img.freepik.com/free-photo/doctor-nurses-special-equipment_23-2148980721.jpg";
const IMG_USER_1 = "https://randomuser.me/api/portraits/women/44.jpg";
const IMG_USER_2 = "https://randomuser.me/api/portraits/men/32.jpg";
const IMG_USER_3 = "https://randomuser.me/api/portraits/women/68.jpg";

function LandingPage() {
    return (
        <div className="landing-wrapper">
            
            {/* --- 1. TOP NAVIGATION --- */}
            <Navbar expand="lg" className="py-4 landing-navbar">
                <Container>
                    <Navbar.Brand className="landing-brand">
                        <div className="brand-icon"><FiPlus /></div> Mediprior
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto landing-nav">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#features">Features</Nav.Link>
                            <Nav.Link href="#testimonials">Testimonials</Nav.Link>
                            <Nav.Link href="#faq">FAQ</Nav.Link>
                        </Nav>
                        <div className="d-flex gap-3">
                            <Link to="/login">
                                <Button variant="link" className="landing-login-btn">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="landing-signup-btn">Get Started</Button>
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* --- 2. HERO SECTION --- */}
            <section className="landing-hero" id="home">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <div className="hero-badge">
                                <FiCheckCircle /> #1 Health App
                            </div>
                            <h1 className="hero-title">
                                Providing Quality <br /> 
                                <span className="highlight-text">Healthcare</span> for a <br /> 
                                Brighter Future
                            </h1>
                            <p className="hero-subtitle">
                                We provide a comprehensive digital health ecosystem designed to make healthcare accessible, efficient, and secure for everyone.
                            </p>
                            <div className="d-flex gap-3 hero-buttons">
                                <Link to="/signup">
                                    <Button className="landing-btn-primary btn-lg">
                                        Book Appointment <FiArrowRight className="ms-2"/>
                                    </Button>
                                </Link>
                                <Button className="landing-btn-secondary btn-lg">
                                    <div className="play-icon"><FiPlay fill="currentColor"/></div>
                                    Watch Video
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center position-relative">
                            <div className="hero-blob"></div>
                            <img src={IMG_HERO_DOC} alt="Doctor" className="hero-main-img" />
                            
                            {/* Floating Stats Card */}
                            <div className="hero-float-card float-1">
                                <div className="icon-box blue-box"><FiUsers /></div>
                                <div>
                                    <h4>5,000+</h4>
                                    <p>Happy Patients</p>
                                </div>
                            </div>

                            <div className="hero-float-card float-2">
                                <div className="icon-box green-box"><FiCheckCircle /></div>
                                <div>
                                    <h4>Verified</h4>
                                    <p>Specialists</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- 3. FEATURES SECTION --- */}
            <section className="landing-features" id="features">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <div className="feature-img-container">
                                <img src={IMG_FEATURE_DOC} alt="Features" className="feature-main-img" />
                                <div className="feature-overlay-card">
                                    <span>24/7</span>
                                    <p>Online Support</p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6} className="ps-lg-5">
                            <h6 className="section-tag">Our Services</h6>
                            <h2 className="section-title">Building a successful legacy for you and your family.</h2>
                            <p className="section-desc">Connect with top doctors, track your vitals, and manage your medical history securely.</p>

                            <div className="feature-grid">
                                <div className="feature-item">
                                    <div className="f-icon"><FiSearch /></div>
                                    <div>
                                        <h5>Find Doctors</h5>
                                        <p>Search verified specialists near you.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="f-icon"><FiCalendar /></div>
                                    <div>
                                        <h5>Appointments</h5>
                                        <p>Easy online scheduling for clinics.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="f-icon"><FiVideo /></div>
                                    <div>
                                        <h5>Video Consult</h5>
                                        <p>Secure video calls from home.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="f-icon"><FiClock /></div>
                                    <div>
                                        <h5>Emergency Care</h5>
                                        <p>24/7 access to emergency contacts.</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- 4. TESTIMONIALS --- */}
            <section className="landing-testimonials" id="testimonials">
                <Container>
                    <div className="text-center mb-5">
                        <h6 className="section-tag">Testimonials</h6>
                        <h2 className="section-title">What our patients say</h2>
                    </div>
                    <Row>
                        {[
                            {img: IMG_USER_1, name: "Sarah Jenkins", text: "The best experience I've had. Booking was instant!"},
                            {img: IMG_USER_2, name: "Michael Chen", text: "I love the dashboard. Seeing my heart rate trends helped me."},
                            {img: IMG_USER_3, name: "Emily Davis", text: "The doctor was so professional and the video call was clear."}
                        ].map((item, i) => (
                            <Col md={4} key={i} className="mb-4">
                                <div className="testimonial-card">
                                    <img src={item.img} alt={item.name} />
                                    <div className="stars">
                                        {[1,2,3,4,5].map(s => <FiStar key={s} fill="#ffc107" stroke="none"/>)}
                                    </div>
                                    <p>"{item.text}"</p>
                                    <h5>{item.name}</h5>
                                    <small>Patient</small>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* --- 5. FAQ --- */}
            <section className="landing-faq" id="faq">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="section-title">Frequently Asked Questions</h2>
                    </div>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Accordion className="landing-accordion">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>How do I book an appointment?</Accordion.Header>
                                    <Accordion.Body>Simply log in, go to "Find Doctors", select a specialist, and choose a time slot.</Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Is my medical data secure?</Accordion.Header>
                                    <Accordion.Body>Yes, we use industry-standard encryption to ensure your reports are private.</Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Can I cancel an appointment?</Accordion.Header>
                                    <Accordion.Body>Yes, you can cancel or reschedule directly from your dashboard.</Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- 6. FOOTER --- */}
            <footer className="landing-footer">
                <Container>
                    <Row>
                        <Col md={4} className="mb-4">
                            <h3 className="footer-brand"><FiPlus /> Mediprior</h3>
                            <p>Making healthcare simple, accessible, and secure for everyone.</p>
                            <div className="social-links">
                                <FiFacebook /><FiTwitter /><FiInstagram /><FiLinkedin />
                            </div>
                        </Col>
                        <Col md={2} className="mb-4">
                            <h5>Company</h5>
                            <Link to="#">About Us</Link>
                            <Link to="#">Careers</Link>
                            <Link to="#">Blog</Link>
                        </Col>
                        <Col md={2} className="mb-4">
                            <h5>Services</h5>
                            <Link to="#">For Patients</Link>
                            <Link to="#">For Doctors</Link>
                            <Link to="#">Video Consults</Link>
                        </Col>
                        <Col md={4} className="mb-4">
                            <h5>Contact</h5>
                            <p>support@mediprior.com</p>
                            <p>+1 (555) 123-4567</p>
                            <p>123 Health St, Wellness City</p>
                        </Col>
                    </Row>
                    <div className="footer-bottom">
                        <small>&copy; 2025 Mediprior. All rights reserved.</small>
                    </div>
                </Container>
            </footer>
        </div>
    );
}

export default LandingPage;