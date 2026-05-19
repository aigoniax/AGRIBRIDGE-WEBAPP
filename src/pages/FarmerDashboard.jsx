import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyListings, createListing, getMyOrders, getUnreadCount } from '../api/auth';
import './FarmerDashboard.css';

import { MdListAlt, MdCheckCircle, MdStorefront } from 'react-icons/md';
import { FaClock, FaCoins, FaUser, FaSignOutAlt, FaCamera, FaSeedling, FaMapMarkerAlt } from 'react-icons/fa';
import { IoReceiptOutline } from 'react-icons/io5';
import { RiUserFill } from 'react-icons/ri';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Others'];
const FRESHNESS_OPTIONS = [
    { value: 'TODAY',    label: '🟢 Harvested Today' },
    { value: '1-2_DAYS', label: '🟡 1–2 Days Old' },
    { value: '3+_DAYS',  label: '🔴 3+ Days Old' },
];
const UNITS = ['kg', 'pieces', 'bundle', 'sack', 'liter'];

const getFreshnessLabel = (f) => {
    if (f === 'TODAY')    return { text: 'Harvested Today', cls: 'tag-today' };
    if (f === '1-2_DAYS') return { text: '1–2 Days Old',   cls: 'tag-1-2days' };
    return                       { text: '3+ Days Old',    cls: 'tag-3plus' };
};

function StatCard({ iconBg, icon, value, label }) {
    return (
        <div className="fd-stat-card">
            <div className="fd-stat-icon-wrap" style={{ background: iconBg }}>
                {icon}
            </div>
            <div className="fd-stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
}

function ProduceCard({ listing }) {
    const freshness = getFreshnessLabel(listing.freshness);
    const isAvailable = listing.status === 'AVAILABLE';

    return (
        <div className="fd-produce-card">
            <div className="fd-produce-img-wrap">
                {listing.photoBase64 ? (
                    <img
                        src={listing.photoBase64}
                        alt={listing.produceName}
                        className="fd-produce-img"
                    />
                ) : (
                    <div className="fd-produce-img-placeholder">🌿</div>
                )}
                <span className={`fd-produce-status-badge ${isAvailable ? 'tag-available' : 'tag-out'}`}>
                    {isAvailable ? 'Available' : 'Out of Stock'}
                </span>
            </div>

            <div className="fd-produce-body">
                <div className="fd-produce-name">{listing.produceName}</div>

                <div className="fd-produce-meta">
                    <span>{listing.quantity} {listing.unit}</span>
                    <span className="fd-produce-meta-dot">●</span>
                    <span className="fd-produce-price">₱{listing.price}/{listing.unit}</span>
                </div>

                <div className="fd-produce-tags">
                    <span className={`fd-produce-tag ${freshness.cls}`}>{freshness.text}</span>
                </div>

                <div className="fd-produce-location">
                    <FaMapMarkerAlt style={{ fontSize: '0.65rem', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.pickupLocation}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* main component */
function FarmerDashboard() {
    const navigate = useNavigate();
    const [user, setUser]                   = useState(null);
    const [listings, setListings]           = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [orders, setOrders]               = useState([]);
    const [showModal, setShowModal]         = useState(false);
    const [submitting, setSubmitting]       = useState(false);
    const [submitMsg, setSubmitMsg]         = useState('');
    const [photoPreview, setPhotoPreview]   = useState(null);
    const [photoFile, setPhotoFile]         = useState(null);

    const [produceName, setProduceName]         = useState('');
    const [category, setCategory]               = useState('Vegetables');
    const [quantity, setQuantity]               = useState('');
    const [unit, setUnit]                       = useState('kg');
    const [price, setPrice]                     = useState('');
    const [freshness, setFreshness]             = useState('TODAY');
    const [pickupLocation, setPickupLocation]   = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [unreadCount, setUnreadCount]         = useState(0);
    const pollRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token  = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'FARMER') { navigate('/login'); return; }
        setUser(parsedUser);
        fetchMyListings(token);
        fetchMyOrders(token);
        fetchUnreadCount(token);

        pollRef.current = setInterval(() => {
            fetchUnreadCount(sessionStorage.getItem('token'));
        }, 10000);

        return () => clearInterval(pollRef.current);
    }, [navigate]);

    const fetchMyListings = async (token) => {
        setLoadingListings(true);
        try {
            const data = await getMyListings(token);
            if (data.success) setListings(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoadingListings(false); }
    };

    const fetchMyOrders = async (token) => {
        try {
            const data = await getMyOrders(token);
            if (data.success) setOrders(data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchUnreadCount = async (token) => {
        try {
            const data = await getUnreadCount(token);
            if (data.success) setUnreadCount(data.data || 0);
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setProduceName(''); setCategory('Vegetables'); setQuantity('');
        setUnit('kg'); setPrice(''); setFreshness('TODAY');
        setPickupLocation(''); setAdditionalNotes('');
        setPhotoFile(null); setPhotoPreview(null); setSubmitMsg('');
    };

    const handleOpenModal  = () => { resetForm(); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); resetForm(); };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMsg('');
        if (!produceName || !quantity || !price || !pickupLocation) {
            setSubmitMsg('Please fill in all required fields.');
            return;
        }
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            const listingData = {
                produceName, category,
                quantity: parseFloat(quantity),
                unit, price: parseFloat(price),
                freshness, pickupLocation, additionalNotes,
            };
            const data = await createListing(token, listingData, photoFile);
            if (data.success) {
                setSubmitMsg('success');
                fetchMyListings(token);
                setTimeout(() => handleCloseModal(), 1500);
            } else {
                setSubmitMsg(data.message || 'Something went wrong.');
            }
        } catch (err) {
            setSubmitMsg('Failed to create listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    const activeListings   = listings.filter(l => l.status === 'AVAILABLE' && !l.deletedAt).length;
    const pendingOrders    = orders.filter(o => o.status === 'PENDING').length;
    const completedOrders  = orders.filter(o => o.status === 'COMPLETED').length;
    const totalEarnings    = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
        .toFixed(2);

    return (
        <div className="fd-container">

            {/* NAV */}
            <nav className="fd-nav">
                <div className="fd-nav-brand">
                    <span className="fd-nav-grain">🌾</span>
                    <span className="fd-nav-title">AgriBridge</span>
                    <span className="fd-nav-badge">Farmer</span>
                </div>

                <div className="fd-nav-right">
                    <span className="fd-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="fd-nav-btn fd-nav-btn-sales" onClick={() => navigate('/my-orders')}>
                            <IoReceiptOutline style={{ fontSize: '0.95rem' }} />
                            My Sales
                        </button>
                        {pendingOrders > 0 && <span className="fd-notif-badge">{pendingOrders}</span>}
                        {unreadCount   > 0 && <span className="fd-msg-badge">{unreadCount}</span>}
                    </div>

                    <button className="fd-nav-btn fd-nav-btn-profile" onClick={() => navigate('/profile')}>
                        <FaUser style={{ fontSize: '0.8rem' }} />
                        Profile
                    </button>

                    <button className="fd-nav-btn fd-nav-btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* BODY */}
            <div className="fd-body">

                {/* WELCOME */}
                <div className="fd-welcome">
                    <h1>Welcome back, <span>{user.fullName}</span>!</h1>
                    <p>Here's an overview of your farm activity.</p>
                </div>

                {/* STATS */}
                <div className="fd-stats">
                    <StatCard
                        iconBg="#dbeafe"
                        icon={<MdListAlt style={{ color: '#2563eb', fontSize: '1.3rem' }} />}
                        value={activeListings}
                        label="Active Listings"
                    />
                    <StatCard
                        iconBg="#fef3c7"
                        icon={<FaClock style={{ color: '#d97706', fontSize: '1.2rem' }} />}
                        value={pendingOrders}
                        label="Pending Orders"
                    />
                    <StatCard
                        iconBg="#dcfce7"
                        icon={<MdCheckCircle style={{ color: '#16a34a', fontSize: '1.3rem' }} />}
                        value={completedOrders}
                        label="Completed Orders"
                    />
                    <StatCard
                        iconBg="#fef9c3"
                        icon={<FaCoins style={{ color: '#ca8a04', fontSize: '1.1rem' }} />}
                        value={`₱${totalEarnings}`}
                        label="Total Earnings"
                    />
                </div>

                {/* RECENT LISTINGS */}
                <div className="fd-section">
                    <div className="fd-section-header">
                        <h2>My Recent Listings</h2>
                        <button className="fd-view-all-link" onClick={() => navigate('/my-listings')}>
                            View All →
                        </button>
                    </div>

                    {loadingListings ? (
                        <div className="fd-empty">
                            <span className="fd-empty-icon">⏳</span>
                            <p>Loading your listings…</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="fd-empty">
                            <FaSeedling style={{ fontSize: '2.5rem', color: '#10b981', display: 'block', margin: '0 auto 0.8rem' }} />
                            <p>You have no listings yet. Add your first produce!</p>
                        </div>
                    ) : (
                        <div className="fd-listings-grid">
                            {listings.slice(0, 8).map((listing) => (
                                <ProduceCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="fd-actions">
                    <button className="fd-btn-primary" onClick={handleOpenModal}>
                        + Add New Listing
                    </button>
                    <button className="fd-btn-secondary" onClick={() => navigate('/my-listings')}>
                        View All Listings
                    </button>
                </div>
            </div>

            {/* ADD LISTING MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <MdStorefront style={{ color: '#059669', fontSize: '1.3rem' }} />
                                Add New Listing
                            </h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {/* photo */}
                            <div className="modal-photo-area">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="modal-photo-preview" />
                                ) : (
                                    <div className="modal-photo-placeholder">
                                        <FaCamera style={{ fontSize: '2rem' }} />
                                        <p>Upload a photo</p>
                                    </div>
                                )}
                                <input type="file" accept=".jpg,.png" onChange={handlePhotoChange}
                                    id="photo-upload" style={{ display: 'none' }} />
                                <label htmlFor="photo-upload" className="modal-photo-btn">
                                    {photoPreview ? 'Change Photo' : 'Choose Photo'}
                                </label>
                            </div>

                            <div className="modal-grid">
                                <div className="modal-field full">
                                    <label>Produce Name *</label>
                                    <input type="text" placeholder="e.g. Fresh Tomatoes"
                                        value={produceName} onChange={(e) => setProduceName(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label>Category *</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label>Freshness *</label>
                                    <select value={freshness} onChange={(e) => setFreshness(e.target.value)}>
                                        {FRESHNESS_OPTIONS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label>Quantity *</label>
                                    <input type="number" placeholder="e.g. 10" value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)} min="0" />
                                </div>
                                <div className="modal-field">
                                    <label>Unit *</label>
                                    <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="modal-field full">
                                    <label>Price (₱ per {unit}) *</label>
                                    <input type="number" placeholder="e.g. 40" value={price}
                                        onChange={(e) => setPrice(e.target.value)} min="0" />
                                </div>
                                <div className="modal-field full">
                                    <label>Pickup Location *</label>
                                    <input type="text" placeholder="e.g. Talisay Public Market, Cebu"
                                        value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
                                </div>
                                <div className="modal-field full">
                                    <label>Additional Notes</label>
                                    <textarea placeholder="Any special instructions or details…"
                                        value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3} />
                                </div>
                            </div>

                            {submitMsg && (
                                <div className={`modal-msg ${submitMsg === 'success' ? 'msg-success' : 'msg-error'}`}>
                                    {submitMsg === 'success' ? '✅ Listing created successfully!' : submitMsg}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="fd-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="fd-btn-primary" disabled={submitting}>
                                    {submitting ? 'Publishing…' : 'Publish Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FarmerDashboard;