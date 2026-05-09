import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllListings, getUnreadCount } from '../api/auth';
import './BuyerDashboard.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdShoppingBag } from 'react-icons/md';
import { IoSearch } from 'react-icons/io5';
import { GiWheat } from 'react-icons/gi';

function BuyerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef(null);

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
        fetchUnreadCount(token);

        pollRef.current = setInterval(() => {
            fetchUnreadCount(sessionStorage.getItem('token'));
        }, 10000);

        return () => clearInterval(pollRef.current);
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

    const fetchUnreadCount = async (token) => {
        try {
            const data = await getUnreadCount(token);
            if (data.success) setUnreadCount(data.data || 0);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
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

    const getFreshnessLabel = (freshness, postedAt) => {
        if (postedAt) {
            const posted = new Date(postedAt);
            const now = new Date();
            const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                if (freshness === 'TODAY') return '🟢 Harvested Today';
                if (freshness === '1-2_DAYS') return '🟡 1-2 Days Old';
                return '🔴 3+ Days Old';
            } else if (diffDays === 1) {
                return '🟡 1-2 Days Old';
            } else {
                return '🔴 3+ Days Old';
            }
        }
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
                    <span className="bd-nav-name">
                        <RiUserFill style={{ color: '#52B788', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                        {user.fullName}
                    </span>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="bd-orders-btn" onClick={() => navigate('/my-orders')}>
                            <MdShoppingBag style={{ color: '#ffffff', marginRight: '0.35rem', verticalAlign: 'middle', fontSize: '1rem' }} />
                            My Orders
                        </button>
                        {unreadCount > 0 && (
                            <span className="bd-msg-badge">{unreadCount}</span>
                        )}
                    </div>
                    <button className="bd-profile-btn" onClick={() => navigate('/profile')}>
                        Profile
                    </button>
                    <button className="bd-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt style={{ color: '#ef4444', marginRight: '0.35rem', verticalAlign: 'middle', fontSize: '0.85rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="bd-body">
                {/* HEADER */}
                <div className="bd-welcome">
                    <h1>Fresh Produce Near You <GiWheat style={{ color: '#52B788', verticalAlign: 'middle', fontSize: '1.8rem' }} /></h1>
                    <p>Browse farm-fresh produce directly from local farmers.</p>
                </div>

                {/* SEARCH */}
                <div className="bd-search-bar">
                    <IoSearch style={{ color: '#52B788', fontSize: '1.2rem', flexShrink: 0 }} />
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
                                    <p className="bd-freshness">{getFreshnessLabel(listing.freshness, listing.postedAt)}</p>
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