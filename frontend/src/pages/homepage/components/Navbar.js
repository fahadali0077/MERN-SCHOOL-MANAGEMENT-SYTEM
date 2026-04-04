import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [pagesOpen, setPagesOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="hp-navbar">
            <div className="hp-navbar-inner">
                <Link to="/" className="hp-navbar-brand">
                    The Punjab School
                </Link>

                {/* Mobile toggle */}
                <button
                    className="hp-navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span />
                    <span />
                    <span />
                </button>

                {/* Nav links */}
                <ul className={`hp-nav-links ${menuOpen ? 'open' : ''}`}>
                    <li>
                        <Link
                            to="/"
                            className={isActive('/') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/courses"
                            className={isActive('/courses') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Courses
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/teachers"
                            className={isActive('/teachers') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Teachers
                        </Link>
                    </li>

                    {/* Pages dropdown */}
                    <li
                        className="hp-dropdown"
                        onMouseEnter={() => setPagesOpen(true)}
                        onMouseLeave={() => setPagesOpen(false)}
                    >
                        <button onClick={() => setPagesOpen(!pagesOpen)}>Pages ▾</button>
                        {(pagesOpen) && (
                            <ul className="hp-dropdown-menu">
                                <li>
                                    <Link to="/about" onClick={() => { setMenuOpen(false); setPagesOpen(false); }}>About Us</Link>
                                </li>
                                <li>
                                    <Link to="/courses" onClick={() => { setMenuOpen(false); setPagesOpen(false); }}>Courses</Link>
                                </li>
                                <li>
                                    <Link to="/gallery" onClick={() => { setMenuOpen(false); setPagesOpen(false); }}>Gallery</Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li>
                        <Link
                            to="/contact"
                            className={isActive('/contact') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Contact
                        </Link>
                    </li>

                    {/* Login Button */}
                    <li>
                        <Link
                            to="/choose"
                            className="hp-login-btn"
                            onClick={() => setMenuOpen(false)}
                        >
                            Login
                        </Link>
                    </li>

                    {/* Guest Login Button */}
                    <li>
                        <Link
                            to="/chooseasguest"
                            className="hp-guest-btn"
                            onClick={() => setMenuOpen(false)}
                        >
                            Try Demo
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
