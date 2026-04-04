import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

// Slider images from public/homepage/img/
const slides = [
    {
        img: '/homepage/img/slider_1.jpg',
        text: 'Your Bright Future is Our Mission',
    },
    {
        img: '/homepage/img/slider_2.jpg',
        text: 'Education is Life',
    },
    {
        img: '/homepage/img/slider_3.jpg',
        text: 'Helping Each of Our Students Fulfill the Potential',
    },
];

const courses = [
    {
        img: '/homepage/img/english.png',
        title: 'English',
        desc: 'Enhance your reading, writing, and communication skills through grammar creative expression. This subject fosters critical thinking and effective language use.',
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
];

const teachers = [
    { img: '/homepage/img/person_1.jpg', name: 'Dr. Yaseen Ul Haq', subject: 'Computer Science' },
    { img: '/homepage/img/person_5.jpg', name: 'Sir Zeeshan', subject: 'Mathematics' },
    { img: '/homepage/img/person_6.jpg', name: 'Sir Ishaaq', subject: 'English' },
    { img: '/homepage/img/person_7.jpg', name: 'Dr. Mubashar Khatana', subject: 'Physics' },
];

const testimonials = [
    {
        img: '/homepage/img/person_1.jpg',
        quote: '"Design must be functional and functionality must be translated into visual aesthetics, without any reliance on gimmicks that have to be explained."',
        author: 'Dr. Yaseen',
    },
    {
        img: '/homepage/img/person_2.jpg',
        quote: '"Creativity is just connecting things. When you ask creative people how they did something, they feel a little guilty because they didn\'t really do it, they just saw something."',
        author: 'Jorge Smith',
    },
    {
        img: '/homepage/img/person_3.jpg',
        quote: '"I think design would be better if designers were much more skeptical about its applications. If you believe in the potency of your craft, where you choose to dole it out is not something to take lightly."',
        author: 'Brandon White',
    },
];

const whyChoose = [
    { title: 'Qualified Teachers', desc: 'Our experienced and dedicated teachers are committed to providing quality education and fostering a love for learning in every student.' },
    { title: 'Modern Learning Facilities', desc: 'Equipped with state-of-the-art classrooms, science labs, libraries, and technology to enhance the student learning experience.' },
    { title: 'Extracurricular Activities', desc: 'A wide range of activities like sports, arts, music, and drama to ensure holistic development of students.' },
    { title: 'Focus on Academic Excellence', desc: 'A well-structured curriculum that ensures top academic performance and prepares students for future challenges.' },
    { title: 'Safe and Nurturing Environment', desc: 'A secure and inclusive atmosphere where every child feels safe, supported, and encouraged to grow.' },
    { title: 'Strong Parent-Teacher Partnership', desc: 'Regular communication and collaboration between parents and teachers to ensure each child\'s success.' },
];

const HomePageMain = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Hero Slider ---- */}
            <section className="hp-hero">
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`hp-slide${currentSlide === i ? ' active' : ''}`}
                        style={{ backgroundImage: `url(${slide.img})` }}
                    >
                        <div className="hp-slide-text">
                            <h1>{slide.text}</h1>
                        </div>
                    </div>
                ))}
                <div className="hp-slider-dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={`hp-slider-dot${currentSlide === i ? ' active' : ''}`}
                            onClick={() => setCurrentSlide(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* ---- Welcome Banner ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <h2>Welcome to School of Excellence</h2>
                </div>
            </section>

            {/* ---- About School ---- */}
            <section className="hp-section">
                <div className="hp-container">
                    <div className="hp-flex-block">
                        <div className="hp-flex-text">
                            <h3>About School</h3>
                            <p>
                                Our school provides quality education with care and innovation. Dedicated teachers
                                inspire students to explore their potential, grow with confidence, and succeed.
                                Modern facilities, creative programs, and a nurturing environment empower learners
                                to achieve academic excellence while building character and leadership for the future.
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

            {/* ---- Featured Courses ---- */}
            <section className="hp-section hp-bg-white hp-border-top">
                <div className="hp-container">
                    <div className="hp-section-heading">
                        <h2>Our Featured Courses</h2>
                        <p>
                            Discover our diverse range of courses designed to help you excel in your chosen field.
                            Learn from industry experts and gain valuable skills to achieve your academic and career goals.
                        </p>
                    </div>
                    <div className="hp-row">
                        <div className="hp-col hp-col-6">
                            {courses.slice(0, 2).map((c, i) => (
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
                            {courses.slice(2, 4).map((c, i) => (
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

            {/* ---- Meet Our Teachers ---- */}
            <section className="hp-section">
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

            {/* ---- Testimonials ---- */}
            <section
                className="hp-testimonial-bg"
                style={{ backgroundImage: 'url(/homepage/img/slider_4.jpg)' }}
            >
                <div className="hp-container">
                    <div className="hp-section-heading" style={{ color: '#fff' }}>
                        <h2 style={{ color: '#fff' }}>Alumni Testimonial</h2>
                        <p style={{ color: '#ddd' }}>
                            Our alumni are a testament to the quality education and values instilled at The Punjab School.
                            Here's what some of our proud alumni have to say about their experiences:
                        </p>
                    </div>

                    <div className="hp-testimonial-slider">
                        <div
                            className="hp-testimonial-slides"
                            style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                        >
                            {testimonials.map((t, i) => (
                                <div className="hp-testimonial-item" key={i}>
                                    <figure>
                                        <img src={t.img} alt={t.author} />
                                    </figure>
                                    <blockquote>{t.quote}</blockquote>
                                    <span className="hp-author">— {t.author}</span>
                                </div>
                            ))}
                        </div>
                        <div className="hp-testimonial-arrows">
                            <button
                                className="hp-arrow-btn"
                                onClick={() => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)}
                                aria-label="Previous"
                            >
                                ‹
                            </button>
                            <button
                                className="hp-arrow-btn"
                                onClick={() => setCurrentTestimonial((p) => (p + 1) % testimonials.length)}
                                aria-label="Next"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Why Choose Us ---- */}
            <section className="hp-section">
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

export default HomePageMain;
