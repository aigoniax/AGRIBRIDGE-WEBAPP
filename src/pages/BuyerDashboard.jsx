import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllListings } from '../api/auth';
import './BuyerDashboard.css';

function BuyerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Herbs', 'Others'];

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) {
        navigate('/login');
        return;
        }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'BUYER') {
        navigate('/login');
        return;
        }
        setUser(parsedUser);
        fetchListings('', '');
    }, [navigate]);

    const fetchListings = async (searchTerm, categoryFilter) => {
        setLoading(true);
        try {
        const data = await getAllListings(
            searchTerm,
            categoryFilter === 'All' ? '' : categoryFilter
        );
        if (data.success) setListings(data.data || []);
        } catch (err) {
        console.error('Failed to fetch listings', err);
        } finally {
        setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        fetchListings(value, category);
    };

    const handleCategory = (cat) => {
        setCategory(cat);
        fetchListings(search, cat);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const getFreshnessLabel = (freshness) => {
        if (freshness === 'TODAY') return '🟢 Harvested Today';
        if (freshness === '1-2_DAYS') return '🟡 1-2 Days Old';
        return '🔴 3+ Days Old';
    };

    if (!user) return null;

    return (
        <div className="bd-container">
        {/* NAV */}
        <nav className="bd-nav">
            <div className="bd-nav-brand">
            <span className="bd-nav-title">AgriBridge</span>
            <span className="bd-nav-badge">Buyer</span>
            </div>
            <div className="bd-nav-right">
            <span className="bd-nav-name">👤 {user.fullName}</span>
            <button className="bd-orders-btn" onClick={() => navigate('/my-orders')}>
                📦 My Orders
            </button>
            <button className="bd-profile-btn" onClick={() => navigate('/profile')}>Profile</button>
            <button className="bd-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        <div className="bd-body">
            {/* HEADER */}
            <div className="bd-welcome">
            <h1>Fresh Produce Near You 🥦</h1>
            <p>Browse farm-fresh produce directly from local farmers.</p>
            </div>

            {/* SEARCH */}
            <div className="bd-search-bar">
            <span className="bd-search-icon">🔍</span>
            <input
                type="text"
                placeholder="Search for produce (e.g. tomatoes, carrots...)"
                value={search}
                onChange={handleSearch}
            />
            </div>

            {/* CATEGORY FILTERS */}
            <div className="bd-categories">
            {categories.map((cat) => (
                <button
                key={cat}
                className={`bd-cat-btn ${category === cat || (cat === 'All' && !category) ? 'active' : ''}`}
                onClick={() => handleCategory(cat === 'All' ? '' : cat)}
                >
                {cat}
                </button>
            ))}
            </div>

            {/* LISTINGS GRID */}
            {loading ? (
            <div className="bd-loading">Loading fresh produce...</div>
            ) : listings.length === 0 ? (
            <div className="bd-empty">
                <span>🌾</span>
                <p>No produce available right now. Check back soon!</p>
            </div>
            ) : (
            <div className="bd-listings-grid">
                {listings.map((listing) => (
                <div className="bd-listing-card" key={listing.id}>
                    <div className="bd-listing-img">
                    {listing.photoBase64 ? (
                        <img src={listing.photoBase64} alt={listing.produceName} />
                    ) : (
                        <div className="bd-listing-img-placeholder">🥬</div>
                    )}
                    </div>
                    <div className="bd-listing-info">
                    <div className="bd-listing-top">
                        <h3>{listing.produceName}</h3>
                        <span className="bd-category-tag">{listing.category}</span>
                    </div>
                    <p className="bd-price">₱{listing.price}/{listing.unit}</p>
                    <p className="bd-quantity">📦 {listing.quantity} {listing.unit} available</p>
                    <p className="bd-freshness">{getFreshnessLabel(listing.freshness)}</p>
                    <p className="bd-location">📍 {listing.pickupLocation}</p>
                    {listing.farmerName && (
                        <p className="bd-farmer">🧑‍🌾 {listing.farmerName}</p>
                    )}
                    <button
                        className="bd-order-btn"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                        View Details
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}

export default BuyerDashboard;