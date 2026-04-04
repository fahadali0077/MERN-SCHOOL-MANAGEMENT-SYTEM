import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

const teachers = [
    { img: '/homepage/img/person_1.jpg', name: 'Dr. Yaseen Ul Haq', subject: 'Computer Science' },
    { img: '/homepage/img/person_5.jpg', name: 'Sir Ishaaq', subject: 'English' },
    { img: '/homepage/img/person_6.jpg', name: 'Sir Zeeshan', subject: 'Mathematics' },
    { img: '/homepage/img/person_7.jpg', name: 'Dr. Mubashar Khatana', subject: 'Physics' },
];

const TeachersPage = () => {
    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Page Header ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <div className="hp-section-left-heading">
                        <h1>Our Teachers</h1>
                    </div>
                </div>
            </section>

            {/* ---- Intro Flex Block ---- */}
            <section className="hp-section">
                <div className="hp-container">
                    <div className="hp-flex-block">
                        <div className="hp-flex-text">
                            <h3>We Hired Certified Teachers For Our Students</h3>
                            <p>
                                Our teachers are highly qualified professionals dedicated to providing quality
                                education. They bring experience, knowledge, and passion to help students achieve
                                academic excellence and personal growth.
                            </p>
                        </div>
                        <div
                            className="hp-flex-image"
                            style={{ backgroundImage: 'url(/homepage/img/slider_3.jpg)' }}
                        >
                            <a
                                href="https://vimeo.com/45830194"
                                className="hp-btn-video"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Watch video"
                            >
                                ▶
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Teacher Cards Grid ---- */}
            <section className="hp-section" style={{ paddingTop: 0 }}>
                <div className="hp-container">
                    <div className="hp-row">
                        {teachers.map((t, i) => (
                            <div className="hp-col hp-col-3" key={i}>
                                <div className="hp-teacher">
                                    <figure>
                                        <img src={t.img} alt={t.name} />
                                    </figure>
                                    <div>
                                        <h3>{t.name}</h3>
                                        <p>{t.subject}</p>
                                        <ul className="hp-social">
                                            <li><a href="#twitter" aria-label="Twitter"><i className="icon-twitter" /></a></li>
                                            <li><a href="#facebook" aria-label="Facebook"><i className="icon-facebook2" /></a></li>
                                            <li><a href="#instagram" aria-label="Instagram"><i className="icon-instagram2" /></a></li>
                                            <li><a href="#google" aria-label="Google+"><i className="icon-google-plus" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TeachersPage;
