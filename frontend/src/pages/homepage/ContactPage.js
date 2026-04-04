import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

const ContactPage = () => {
    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Page Header ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <div className="hp-section-left-heading">
                        <h1>Contact Us</h1>
                    </div>
                </div>
            </section>

            {/* ---- Contact Layout ---- */}
            <section className="hp-section" style={{ background: '#f9f9f9' }}>
                <div className="hp-container">
                    <div className="hp-contact-layout">

                        {/* Sidebar */}
                        <div className="hp-contact-sidebar">
                            <h3>Pages</h3>
                            <ul className="hp-side-menu">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/courses">Courses</Link></li>
                                <li><Link to="/teachers">Teachers</Link></li>
                                <li><Link to="/about">About Us</Link></li>
                                <li className="active"><a href="/contact">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Main Content */}
                        <div className="hp-contact-main">
                            <div className="hp-contact-card">
                                <h2>Contact Information</h2>

                                <div className="hp-contact-detail">
                                    <h3>School Address</h3>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>📍</span>
                                        The Punjab School, Sialkot, Punjab, Pakistan
                                    </p>
                                </div>

                                <div className="hp-contact-detail">
                                    <h3>Contact Numbers</h3>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>📞</span>
                                        +92 309 9639354
                                    </p>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>📞</span>
                                        +92 318 7281385
                                    </p>
                                </div>

                                <div className="hp-contact-detail">
                                    <h3>Email Addresses</h3>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>✉️</span>
                                        fahadj698@gmail.com
                                    </p>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>✉️</span>
                                        ua5122843@gmail.com
                                    </p>
                                </div>

                                <div className="hp-contact-detail">
                                    <h3>Office Hours</h3>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>🕐</span>
                                        Monday – Friday: 8:00 AM – 4:00 PM
                                    </p>
                                    <p>
                                        <span style={{ color: '#007bff', marginRight: 8 }}>🕐</span>
                                        Saturday, Sunday: Closed
                                    </p>
                                </div>

                                <div className="hp-map-section">
                                    <h3>Our Location</h3>
                                    <a
                                        href="https://www.google.com/maps/place/University+of+Engineering+and+Technology+(UET)+Narowal+Campus/@32.0992582,74.8436214,15z"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Location on Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
