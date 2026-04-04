import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../homepage/homepage.css';

// Gallery images from public/homepage/img/
const galleryImages = [
    { thumb: '/homepage/img/gal_img_sm_1.jpg', full: '/homepage/img/gal_img_full_1.jpg', caption: 'School Event 1' },
    { thumb: '/homepage/img/gal_img_sm_2.jpg', full: '/homepage/img/gal_img_full_2.jpg', caption: 'School Event 2' },
    { thumb: '/homepage/img/gal_img_sm_3.jpg', full: '/homepage/img/gal_img_full_3.jpg', caption: 'School Event 3' },
    { thumb: '/homepage/img/gal_img_sm_4.jpg', full: '/homepage/img/gal_img_full_4.jpg', caption: 'School Event 4' },
    { thumb: '/homepage/img/gal_img_sm_1.jpg', full: '/homepage/img/gal_img_full_1.jpg', caption: 'School Event 5' },
    { thumb: '/homepage/img/gal_img_sm_2.jpg', full: '/homepage/img/gal_img_full_2.jpg', caption: 'School Event 6' },
    { thumb: '/homepage/img/gal_img_sm_3.jpg', full: '/homepage/img/gal_img_full_3.jpg', caption: 'School Event 7' },
    { thumb: '/homepage/img/gal_img_sm_4.jpg', full: '/homepage/img/gal_img_full_4.jpg', caption: 'School Event 8' },
    { thumb: '/homepage/img/gal_img_sm_1.jpg', full: '/homepage/img/gal_img_full_1.jpg', caption: 'School Event 9' },
    { thumb: '/homepage/img/gal_img_sm_2.jpg', full: '/homepage/img/gal_img_full_2.jpg', caption: 'School Event 10' },
    { thumb: '/homepage/img/gal_img_sm_3.jpg', full: '/homepage/img/gal_img_full_3.jpg', caption: 'School Event 11' },
    { thumb: '/homepage/img/gal_img_sm_4.jpg', full: '/homepage/img/gal_img_full_4.jpg', caption: 'School Event 12' },
];

const GalleryPage = () => {
    const [lightboxImg, setLightboxImg] = useState(null);
    const [lightboxIdx, setLightboxIdx] = useState(null);

    const openLightbox = useCallback((img, idx) => {
        setLightboxImg(img);
        setLightboxIdx(idx);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxImg(null);
        setLightboxIdx(null);
    }, []);

    const prevImg = useCallback(() => {
        const newIdx = (lightboxIdx - 1 + galleryImages.length) % galleryImages.length;
        setLightboxIdx(newIdx);
        setLightboxImg(galleryImages[newIdx].full);
    }, [lightboxIdx]);

    const nextImg = useCallback(() => {
        const newIdx = (lightboxIdx + 1) % galleryImages.length;
        setLightboxIdx(newIdx);
        setLightboxImg(galleryImages[newIdx].full);
    }, [lightboxIdx]);

    return (
        <div className="hp-page">
            <Navbar />

            {/* ---- Page Header ---- */}
            <section className="hp-section-colored">
                <div className="hp-container">
                    <div className="hp-section-left-heading">
                        <h1>School Gallery</h1>
                    </div>
                </div>
            </section>

            {/* ---- Gallery Grid ---- */}
            <section className="hp-section hp-bg-white">
                <div className="hp-container">
                    <div className="hp-gallery-grid">
                        {galleryImages.map((img, i) => (
                            <figure
                                key={i}
                                className="hp-gallery-item"
                                onClick={() => openLightbox(img.full, i)}
                            >
                                <img src={img.thumb} alt={img.caption} />
                                <figcaption>{img.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Lightbox ---- */}
            {lightboxImg && (
                <div className="hp-lightbox" onClick={closeLightbox}>
                    <button className="hp-lightbox-close" onClick={closeLightbox} aria-label="Close">×</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImg(); }}
                        style={{
                            position: 'absolute', left: 20, background: 'rgba(104,193,159,0.8)',
                            border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer',
                            width: 48, height: 48, borderRadius: '50%',
                        }}
                        aria-label="Previous"
                    >
                        ‹
                    </button>
                    <img
                        src={lightboxImg}
                        alt="Gallery full view"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImg(); }}
                        style={{
                            position: 'absolute', right: 20, background: 'rgba(104,193,159,0.8)',
                            border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer',
                            width: 48, height: 48, borderRadius: '50%',
                        }}
                        aria-label="Next"
                    >
                        ›
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default GalleryPage;
