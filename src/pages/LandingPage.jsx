import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="lp-container">

            {/* NAV */}
            <nav className="lp-nav">
                <div className="lp-nav-brand">
                    <span className="lp-nav-grain">🌾</span>
                    <span className="lp-nav-title">AgriBridge</span>
                </div>
                <div className="lp-nav-actions">
                    <button className="lp-nav-login" onClick={() => navigate('/login')}>
                        Log in
                    </button>
                    <button className="lp-nav-register" onClick={() => navigate('/register')}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="lp-hero">
                <div className="lp-hero-bg-circle-1"/>
                <div className="lp-hero-bg-circle-2"/>
                <div className="lp-hero-content">
                    <div className="lp-hero-badge">
                        Farm-Fresh Produce · Cebu, Philippines
                    </div>
                    <h1 className="lp-hero-title">
                        Bridging <span>Local Farmers</span> to{' '}
                        <em>Fresh Produce</em> Buyers
                    </h1>
                    <p className="lp-hero-sub">
                        AgriBridge connects Cebu's local farmers directly to buyers —
                        rescuing fresh produce from going to waste while delivering
                        farm-fresh food straight to your table.
                    </p>
                    <div className="lp-hero-actions">
                        <button className="lp-btn-primary" onClick={() => navigate('/register')}>
                            Join as Farmer
                        </button>
                        <button className="lp-btn-secondary" onClick={() => navigate('/register')}>
                            Browse as Buyer
                        </button>
                    </div>
                    <div className="lp-hero-stats">
                        <div className="lp-stat">
                            <span className="lp-stat-number">100%</span>
                            <span className="lp-stat-label">Local Farmers</span>
                        </div>
                        <div className="lp-stat-divider"/>
                        <div className="lp-stat">
                            <span className="lp-stat-number">0%</span>
                            <span className="lp-stat-label">Middlemen</span>
                        </div>
                        <div className="lp-stat-divider"/>
                        <div className="lp-stat">
                            <span className="lp-stat-number">Less</span>
                            <span className="lp-stat-label">Food Waste</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="lp-section lp-about">
                <div className="lp-section-inner">
                    <div className="lp-about-grid">

                        <div className="lp-about-text">
                            <p className="lp-section-label">About AgriBridge</p>
                            <h2 className="lp-section-title">
                                Fresh produce shouldn't go to waste
                            </h2>
                            <p className="lp-section-sub">
                                Every day, local farmers in Cebu struggle to sell their harvest
                                in time — while buyers search for fresh, affordable produce.
                                AgriBridge closes that gap by creating a direct, transparent
                                marketplace between those who grow and those who eat.
                            </p>
                            <div className="lp-about-highlight">
                                <div className="lp-about-highlight-item">
                                    <div className="lp-about-highlight-dot"/>
                                    <p className="lp-about-highlight-text">
                                        Farmers list their freshly harvested produce with real-time availability and pricing.
                                    </p>
                                </div>
                                <div className="lp-about-highlight-item">
                                    <div className="lp-about-highlight-dot"/>
                                    <p className="lp-about-highlight-text">
                                        Buyers browse, order, and coordinate cash-on-pickup directly with the farmer.
                                    </p>
                                </div>
                                <div className="lp-about-highlight-item">
                                    <div className="lp-about-highlight-dot"/>
                                    <p className="lp-about-highlight-text">
                                        No commissions, no middlemen — fair prices for farmers, fresh food for buyers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lp-about-visual">
                            <div className="lp-about-card">
                                <p className="lp-about-card-title">For Farmers</p>
                                <p className="lp-about-card-text">List your harvest, manage orders, and reach more buyers directly.</p>
                            </div>
                            <div className="lp-about-card">
                                <p className="lp-about-card-title">For Buyers</p>
                                <p className="lp-about-card-text">Browse fresh produce and order directly from farmers near you.</p>
                            </div>
                            <div className="lp-about-card">
                                <p className="lp-about-card-title">Built-in Chat</p>
                                <p className="lp-about-card-text">Coordinate pickup details with your farmer in real time.</p>
                            </div>
                            <div className="lp-about-card">
                                <p className="lp-about-card-title">Mobile App</p>
                                <p className="lp-about-card-text">Manage listings and orders on the go with our Android app.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="lp-section lp-how">
                <div className="lp-section-inner">
                    <div className="lp-how-header">
                        <p className="lp-section-label">How It Works</p>
                        <h2 className="lp-section-title">Simple. Direct. Fresh.</h2>
                        <p className="lp-section-sub" style={{ margin: '0 auto' }}>
                            From harvest to pickup — AgriBridge makes the whole process
                            straightforward for both farmers and buyers.
                        </p>
                    </div>
                    <div className="lp-how-grid">
                        <div className="lp-step">
                            <span className="lp-step-number">01</span>
                            <p className="lp-step-title">Create Your Account</p>
                            <p className="lp-step-text">
                                Sign up as a Farmer or Buyer. Farmers get approved by the
                                admin before listing. Buyers can browse immediately.
                            </p>
                            <span className="lp-step-role role-both">Farmers & Buyers</span>
                        </div>
                        <div className="lp-step">
                            <span className="lp-step-number">02</span>
                            <p className="lp-step-title">List or Browse Produce</p>
                            <p className="lp-step-text">
                                Farmers post their fresh harvest with pricing, quantity,
                                and pickup location. Buyers filter by category and location.
                            </p>
                            <span className="lp-step-role role-farmer">Farmers list · Buyers browse</span>
                        </div>
                        <div className="lp-step">
                            <span className="lp-step-number">03</span>
                            <p className="lp-step-title">Order & Pick Up</p>
                            <p className="lp-step-text">
                                Buyers place a rescue order, chat with the farmer to
                                coordinate, then pay cash on pickup. Simple and direct.
                            </p>
                            <span className="lp-step-role role-buyer">Buyers order</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="lp-cta">
                <div className="lp-cta-bg"/>
                <div className="lp-cta-inner">
                    <h2 className="lp-cta-title">
                        Ready to join AgriBridge?
                    </h2>
                    <p className="lp-cta-sub">
                        Whether you're a farmer with a fresh harvest or a buyer looking
                        for locally sourced produce — your spot is waiting.
                    </p>
                    <div className="lp-cta-actions">
                        <button className="lp-btn-white" onClick={() => navigate('/register')}>
                            Create an Account
                        </button>
                        <button className="lp-btn-outline-white" onClick={() => navigate('/login')}>
                            Log in
                        </button>
                    </div>
                    <div className="lp-cta-download">
                        <p className="lp-cta-download-label">Also available on Android</p>
                        <a href="/agribridge.apk" download="agribridge.apk" className="lp-btn-download">
                            Download Mobile App
                        </a>
                    </div>
                    <p className="lp-cta-note">Free to join · No hidden fees · Cash on pickup</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div className="lp-footer-brand">
                    <span style={{ fontSize: '1rem' }}>🌾</span>
                    <span className="lp-footer-title">AgriBridge</span>
                </div>
                <p className="lp-footer-copy">
                    © {new Date().getFullYear()} AgriBridge · Cebu, Philippines
                </p>
            </footer>

        </div>
    );
}

export default LandingPage;