import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllListings, getUnreadCount } from '../api/auth';
import './BuyerDashboard.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { MdShoppingBag } from 'react-icons/md';
import { IoSearch, IoLocation } from 'react-icons/io5';
import { GiWheat } from 'react-icons/gi';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Herbs', 'Others'];

/* reshness helper */
const getFreshnessLabel = (freshness, postedAt) => {
    if (postedAt) {
        const diffDays = Math.floor((new Date() - new Date(postedAt)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            if (freshness === 'TODAY')    return '🟢 Harvested Today';
            if (freshness === '1-2_DAYS') return '🟡 1–2 Days Old';
            return '🔴 3+ Days Old';
        } else if (diffDays === 1) {
            return '🟡 1–2 Days Old';
        }
        return '🔴 3+ Days Old';
    }
    if (freshness === 'TODAY')    return '🟢 Harvested Today';
    if (freshness === '1-2_DAYS') return '🟡 1–2 Days Old';
    return '🔴 3+ Days Old';
};

/* listing card */
function ListingCard({ listing, onView }) {
    return (
        <div className="bd-listing-card">
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

                <p className="bd-quantity">
                    📦 {listing.quantity} {listing.unit} available
                </p>

                <p className="bd-freshness">
                    {getFreshnessLabel(listing.freshness, listing.postedAt)}
                </p>

                {listing.farmerName && (
                    <p className="bd-farmer">🧑‍🌾 {listing.farmerName}</p>
                )}

                <p className="bd-location">
                    <FaMapMarkerAlt style={{ fontSize: '0.65rem', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.pickupLocation}
                    </span>
                </p>

                <button className="bd-order-btn" onClick={() => onView(listing.id)}>
                    View Details
                </button>
            </div>
        </div>
    );
}

/* main component */
function BuyerDashboard() {
    const navigate = useNavigate();
    const [user, setUser]           = useState(null);
    const [listings, setListings]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [category, setCategory]   = useState('');
    const [location, setLocation]   = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token  = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'BUYER') { navigate('/login'); return; }
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
        } catch (err) { console.error(err); }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        fetchListings(value, category);
    };

    const handleCategory = (cat) => {
        const next = cat === 'All' ? '' : cat;
        setCategory(next);
        fetchListings(search, next);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const filteredListings = location.trim()
        ? listings.filter(l =>
            l.pickupLocation?.toLowerCase().includes(location.trim().toLowerCase())
        )
        : listings;

    if (!user) return null;

    return (
        <div className="bd-container">

            {/* NAV */}
            <nav className="bd-nav">
                <div className="bd-nav-brand">
                    <span className="bd-nav-grain">🌾</span>
                    <span className="bd-nav-title">AgriBridge</span>
                    <span className="bd-nav-badge">Buyer</span>
                </div>

                <div className="bd-nav-right">
                    <span className="bd-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            className="bd-nav-btn bd-nav-btn-orders"
                            onClick={() => navigate('/my-orders')}
                        >
                            <MdShoppingBag style={{ fontSize: '0.95rem' }} />
                            My Orders
                        </button>
                        {unreadCount > 0 && (
                            <span className="bd-msg-badge">{unreadCount}</span>
                        )}
                    </div>

                    <button
                        className="bd-nav-btn bd-nav-btn-profile"
                        onClick={() => navigate('/profile')}
                    >
                        <FaUser style={{ fontSize: '0.8rem' }} />
                        Profile
                    </button>

                    <button
                        className="bd-nav-btn bd-nav-btn-logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* BODY */}
            <div className="bd-body">

                {/* WELCOME */}
                <div className="bd-welcome">
                    <h1>
                        Fresh Produce Near You
                        <GiWheat style={{ color: '#10b981', fontSize: '1.6rem' }} />
                    </h1>
                    <p>Browse farm-fresh produce directly from local farmers.</p>
                </div>

                {/* SEARCH + LOCATION */}
                <div className="bd-search-row">
                    <div className="bd-search-bar">
                        <IoSearch style={{ color: '#10b981', fontSize: '1.1rem', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search for produce (e.g. tomatoes, carrots…)"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="bd-location-bar">
                        <IoLocation style={{ color: '#fb923c', fontSize: '1.1rem', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Filter by location (e.g. Cebu City)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        {location && (
                            <button
                                className="bd-location-clear"
                                onClick={() => setLocation('')}
                                title="Clear location filter"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* CATEGORIES */}
                <div className="bd-categories">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`bd-cat-btn ${
                                cat === 'All'
                                    ? !category ? 'active' : ''
                                    : category === cat ? 'active' : ''
                            }`}
                            onClick={() => handleCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* LISTINGS */}
                {loading ? (
                    <div className="bd-loading">Loading fresh produce…</div>
                ) : filteredListings.length === 0 ? (
                    <div className="bd-empty">
                        <span>🌾</span>
                        <p>
                            {location
                                ? `No produce found in "${location}". Try a different location.`
                                : 'No produce available right now. Check back soon!'}
                        </p>
                        {location && (
                            <button
                                className="bd-clear-location-btn"
                                onClick={() => setLocation('')}
                            >
                                Clear Location Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bd-listings-grid">
                        {filteredListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onView={(id) => navigate(`/listing/${id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuyerDashboard;