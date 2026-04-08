import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

const whyChoose = [
    { title: 'Qualified Teachers', desc: 'Our experienced and dedicated teachers are committed to providing quality education and fostering a love for learning in every student.' },
    { title: 'Modern Learning Facilities', desc: 'Equipped with state-of-the-art classrooms, science labs, libraries, and technology to enhance the student learning experience.' },
    { title: 'Extracurricular Activities', desc: 'A wide range of activities like sports, arts, music, and drama to ensure holistic development of students.' },
    { title: 'Focus on Academic Excellence', desc: 'A well-structured curriculum that ensures top academic performance and prepares students for future challenges.' },
    { title: 'Safe and Nurturing Environment', desc: 'A secure and inclusive atmosphere where every child feels safe, supported, and encouraged to grow.' },
    { title: 'Strong Parent-Teacher Partnership', desc: 'Regular communication and collaboration between parents and teachers to ensure each child\'s success.' },
];

const AboutPage = () => {
    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Page Header ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <div className="hp-section-left-heading">
                        <h1>About The School</h1>
                    </div>
                </div>
            </section>

            {/* ---- History / Intro Flex Block ---- */}
            <section className="hp-section">
                <div className="hp-container">
                    <div className="hp-flex-block">
                        <div className="hp-flex-text">
                            <div className="hp-uppercase">History</div>
                            <h3>Take A Look at How We Begin</h3>
                            <p>
                                We start with a strong foundation by creating a positive learning environment,
                                engaging students with interactive methods, and building essential skills to ensure
                                long-term success and growth.
                            </p>
                        </div>
                        <div
                            className="hp-flex-image"
                            style={{ backgroundImage: 'url(/homepage/img/slider_4.jpg)' }}
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

            {/* ---- Image + Text block ---- */}
            <section className="hp-section" style={{ paddingTop: 0 }}>
                <div className="hp-container">
                    <div className="hp-about-img-text">
                        <img src="/homepage/img/slider_1.jpg" alt="School of Excellence" />
                        <div className="hp-about-desc">
                            <h2>We Are a School Focused on Excellence.</h2>
                            <p>
                                Our school is dedicated to providing quality education and fostering a culture of
                                excellence. We focus on nurturing students' talents, encouraging critical thinking,
                                and building strong moral and academic foundations to prepare them for future success.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Why Choose Us ---- */}
            <section className="hp-section hp-border-top">
                <div className="hp-container">
                    <div className="hp-section-heading">
                        <h2>Why Choose The Punjab School</h2>
                        <p>
                            At The Punjab School, we believe in nurturing young minds by offering a perfect blend
                            of academic excellence, modern learning facilities, and holistic development. Here are
                            the top reasons why parents trust us for their children's education:
                        </p>
                    </div>
                    <div className="hp-row">
                        <div className="hp-col hp-col-6">
                            {whyChoose.slice(0, 3).map((w, i) => (
                                <div className="hp-service-icon" key={i}>
                                    <div className="hp-icon">✓</div>
                                    <div className="hp-icon-text">
                                        <h3>{w.title}</h3>
                                        <p>{w.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hp-col hp-col-6">
                            {whyChoose.slice(3).map((w, i) => (
                                <div className="hp-service-icon" key={i}>
                                    <div className="hp-icon">✓</div>
                                    <div className="hp-icon-text">
                                        <h3>{w.title}</h3>
                                        <p>{w.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
