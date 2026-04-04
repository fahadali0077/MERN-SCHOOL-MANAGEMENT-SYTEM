import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

const allCourses = [
    {
        img: '/homepage/img/english.png',
        title: 'English',
        desc: 'Enhance your reading, writing, and communication skills through grammar and creative expression. This subject fosters critical thinking and effective language use.',
    },
    {
        img: '/homepage/img/math.jpg',
        title: 'Mathematics',
        desc: 'Build a strong foundation in arithmetic, algebra, geometry, and problem-solving. Develop logical reasoning and analytical skills for real-world applications.',
    },
    {
        img: '/homepage/img/chemistry.png',
        title: 'Chemistry',
        desc: 'Discover the world of atoms, molecules, and chemical reactions. Learn about the properties of matter and how science shapes the world around us.',
    },
    {
        img: '/homepage/img/physics.png',
        title: 'Physics',
        desc: 'Explore the laws of nature, motion, energy, and forces. Develop a deeper understanding of how the physical world works through experiments and theory.',
    },
    {
        img: '/homepage/img/islamic_studies.jpeg',
        title: 'Islamic Studies',
        desc: 'Explore the teachings of the Quran, Hadith, and Islamic history. This subject builds strong moral values, fosters understanding of Islam, and develops a connection with its heritage.',
    },
    {
        img: '/homepage/img/science.png',
        title: 'Science',
        desc: 'Discover engaging concepts, experiments, and theories. This subject covers basic physics, chemistry, and biology tailored to school-level learning.',
    },
    {
        img: '/homepage/img/urdu.png',
        title: 'Urdu',
        desc: 'Develop strong reading, writing, and speaking skills in Urdu. This subject emphasizes grammar and literature helping students appreciate the language\'s richness.',
    },
    {
        img: '/homepage/img/history.jpeg',
        title: 'History',
        desc: 'Learn about events, civilizations, and historical figures that have shaped the world. This subject brings history to life by fostering curiosity and critical thinking about the past.',
    },
];

const teachers = [
    { img: '/homepage/img/person_1.jpg', name: 'Dr. Yaseen Ul Haq', subject: 'Computer Science' },
    { img: '/homepage/img/person_5.jpg', name: 'Sir Ishaaq', subject: 'English' },
    { img: '/homepage/img/person_6.jpg', name: 'Sir Zeeshan', subject: 'Mathematics' },
    { img: '/homepage/img/person_7.jpg', name: 'Dr. Mubashar Khatana', subject: 'Physics' },
];

const CoursesPage = () => {
    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Page Header ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <div className="hp-section-left-heading">
                        <h1>Our Courses</h1>
                    </div>
                </div>
            </section>

            {/* ---- Featured Course Intro ---- */}
            <section className="hp-section">
                <div className="hp-container">
                    <div className="hp-flex-block">
                        <div className="hp-flex-text">
                            <div className="hp-uppercase">Featured Course</div>
                            <h3>Computer Science</h3>
                            <p>
                                Computer Science is the study of processes that interact with data and that can be
                                represented as data in the form of programs. It enables the use of algorithms to
                                manipulate, store, and communicate digital information. A computer scientist
                                specializes in the theory of computation and the design of computational systems.
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

            {/* ---- All Courses Grid ---- */}
            <section className="hp-section" style={{ paddingTop: 0 }}>
                <div className="hp-container">
                    <div className="hp-row">
                        <div className="hp-col hp-col-6">
                            {allCourses.filter((_, i) => i % 2 === 0).map((c, i) => (
                                <div className="hp-service-2" key={i}>
                                    <div className="hp-img-wrap">
                                        <img src={c.img} alt={c.title} />
                                    </div>
                                    <div className="hp-card-text">
                                        <h3>{c.title}</h3>
                                        <p>{c.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hp-col hp-col-6">
                            {allCourses.filter((_, i) => i % 2 !== 0).map((c, i) => (
                                <div className="hp-service-2" key={i}>
                                    <div className="hp-img-wrap">
                                        <img src={c.img} alt={c.title} />
                                    </div>
                                    <div className="hp-card-text">
                                        <h3>{c.title}</h3>
                                        <p>{c.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Teachers Section ---- */}
            <section className="hp-section hp-border-top">
                <div className="hp-container">
                    <div className="hp-section-heading">
                        <h2>Meet Our Qualified Teachers</h2>
                        <p>
                            Our dedicated team of professional educators combines passion and expertise to inspire
                            students and foster lifelong learning. Each teacher brings unique skills and knowledge
                            to the classroom, ensuring your child's academic and personal growth.
                        </p>
                    </div>
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

export default CoursesPage;
