import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyListings } from '../api/auth';
import './FarmerDashboard.css';

function FarmerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) {
        navigate('/login');
        return;
        }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'FARMER') {
        navigate('/login');
        return;
        }
        setUser(parsedUser);
        fetchMyListings(token);
    }, [navigate]);

    const fetchMyListings = async (token) => {
        setLoading(true);
        try {
        const data = await getMyListings(token);
        if (data.success) setListings(data.data || []);
        } catch (err) {
        console.error('Failed to fetch listings', err);
        } finally {
        setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    // Stats
    const activeListings = listings.filter(l => l.status === 'AVAILABLE').length;
    const pendingOrders = 0;   // will be real data when orders are built
    const completedOrders = 0; // will be real data when orders are built
    const totalEarnings = 0;   // will be real data when orders are built

    const getFreshnessLabel = (freshness) => {
        if (freshness === 'TODAY') return '🟢 Harvested Today';
        if (freshness === '1-2_DAYS') return '🟡 1-2 Days Old';
        return '🔴 3+ Days Old';
    };

    return (
        <div className="fd-container">
        {/* NAV */}
        <nav className="fd-nav">
            <div className="fd-nav-brand">
            <span className="fd-nav-title">AgriBridge</span>
            <span className="fd-nav-badge">Farmer</span>
            </div>
            <div className="fd-nav-right">
            <span className="fd-nav-name">👤 {user.fullName}</span>
            <button className="fd-profile-btn" onClick={() => navigate('/profile')}>Profile</button>
            <button className="fd-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        <div className="fd-body">
            {/* WELCOME */}
            <div className="fd-welcome">
            <h1>Welcome back, <span>{user.fullName}</span>! 🌾</h1>
            <p>Here's an overview of your farm activity.</p>
            </div>

            {/* STATS CARDS */}
            <div className="fd-stats">
            <div className="fd-stat-card">
                <div className="fd-stat-icon">📋</div>
                <div className="fd-stat-info">
                <h3>{activeListings}</h3>
                <p>Active Listings</p>
                </div>
            </div>
            <div className="fd-stat-card">
                <div className="fd-stat-icon">⏳</div>
                <div className="fd-stat-info">
                <h3>{pendingOrders}</h3>
                <p>Pending Orders</p>
                </div>
            </div>
            <div className="fd-stat-card">
                <div className="fd-stat-icon">✅</div>
                <div className="fd-stat-info">
                <h3>{completedOrders}</h3>
                <p>Completed Orders</p>
                </div>
            </div>
            <div className="fd-stat-card">
                <div className="fd-stat-icon">💰</div>
                <div className="fd-stat-info">
                <h3>₱{totalEarnings}</h3>
                <p>Total Earnings</p>
                </div>
            </div>
            </div>

            {/* RECENT LISTINGS */}
            <div className="fd-section">
            <div className="fd-section-header">
                <h2>My Recent Listings</h2>
            </div>

            {loading ? (
                <div className="fd-empty">Loading your listings...</div>
            ) : listings.length === 0 ? (
                <div className="fd-empty">
                <span>🌱</span>
                <p>You have no listings yet. Add your first produce!</p>
                </div>
            ) : (
                <div className="fd-listings">
                {listings.slice(0, 5).map((listing) => (
                    <div className="fd-listing-card" key={listing.id}>
                    <div className="fd-listing-info">
                        <div className="fd-listing-top">
                        <h3>{listing.produceName}</h3>
                        <span className={`fd-status ${listing.status === 'AVAILABLE' ? 'status-available' : 'status-out'}`}>
                            {listing.status === 'AVAILABLE' ? 'Available' : 'Out of Stock'}
                        </span>
                        </div>
                        <p className="fd-listing-detail">
                        📦 {listing.quantity} {listing.unit} &nbsp;•&nbsp;
                        ₱{listing.price}/{listing.unit} &nbsp;•&nbsp;
                        {getFreshnessLabel(listing.freshness)}
                        </p>
                        <p className="fd-listing-location">📍 {listing.pickupLocation}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="fd-actions">
            <button className="fd-btn-primary" onClick={() => navigate('/add-listing')}>
                + Add New Listing
            </button>
            <button className="fd-btn-secondary" onClick={() => navigate('/my-listings')}>
                View All Listings
            </button>
            </div>
        </div>
        </div>
    );
}

export default FarmerDashboard;