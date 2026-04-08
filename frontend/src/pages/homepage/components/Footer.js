import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="hp-footer">
            <div className="hp-container">
                <div className="hp-row">

                    {/* Column 1 - About + Social */}
                    <div className="hp-col hp-col-4">
                        <div style={{ paddingBottom: '30px' }}>
                            <h3>About The School</h3>
                            <p>
                                Our school provides quality education with care and innovation.
                                Dedicated teachers inspire students to explore their potential,
                                grow with confidence, and succeed. Modern facilities, creative programs,
                                and a nurturing environment empower learners to achieve academic excellence
                                while building character and leadership for the future.
                            </p>
                            <h3 style={{ marginTop: '25px' }}>Social</h3>
                            <ul className="hp-footer-social">
                                <li>
                                    <a href="https://x.com/FahadAli_0_7?s=09" target="_blank" rel="noreferrer" aria-label="Twitter">
                                        <i className="icon-twitter" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.facebook.com/profile.php?id=100041976341114&mibextid=ZbWKwL" target="_blank" rel="noreferrer" aria-label="Facebook">
                                        <i className="icon-facebook" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/fahadali0077" target="_blank" rel="noreferrer" aria-label="GitHub">
                                        <i className="icon-github" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://dribbble.com/fahadali_07" target="_blank" rel="noreferrer" aria-label="Dribbble">
                                        <i className="icon-dribbble" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.linkedin.com/in/fahad-ali-32aa71339/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                                        <i className="icon-linkedin" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.youtube.com/@FahadAli-0_7" target="_blank" rel="noreferrer" aria-label="YouTube">
                                        <i className="icon-youtube" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2 - Links */}
                    <div className="hp-col hp-col-3" style={{ paddingLeft: '60px' }}>
                        <div style={{ paddingBottom: '30px' }}>
                            <h3>Links</h3>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/courses">Courses</Link></li>
                                <li><Link to="/teachers">Teachers</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 3 - Contact Info */}
                    <div className="hp-col hp-col-4">
                        <div style={{ paddingBottom: '30px' }}>
                            <h3>Contact Info</h3>
                            <ul className="hp-contact-info">
                                <li>
                                    <span className="hp-ci-icon">📍</span>
                                    <span>The Punjab School, Sialkot</span>
                                </li>
                                <li>
                                    <span className="hp-ci-icon">✉️</span>
                                    <span>fahadj698@gmail.com</span>
                                </li>
                                <li>
                                    <span className="hp-ci-icon">📞</span>
                                    <span>+92 309 9639354</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* Copyright Bar */}
            <div className="hp-footer-copyright">
                <div className="hp-copyright-row">
                    <p>
                        &copy; 2024{' '}
                        <a href="https://probootstrap.com/" style={{ color: '#68c19f' }}>kapz Developers</a>.
                        {' '}All Rights Reserved. Designed &amp; Developed with ❤️ by{' '}
                        <a href="https://probootstrap.com/" style={{ color: '#68c19f' }}>kapz Group</a>
                    </p>
                    <div className="hp-backtotop">
                        <a href="#top" onClick={scrollToTop}>Back to top ↑</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
