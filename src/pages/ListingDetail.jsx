import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListingById, placeOrder } from '../api/auth';
import './ListingDetail.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdShoppingBag, MdArrowBack } from 'react-icons/md';

const getFreshnessInfo = (freshness, postedAt) => {
    let resolved = freshness;
    if (postedAt) {
        const diffDays = Math.floor((new Date() - new Date(postedAt)) / (1000 * 60 * 60 * 24));
        if (diffDays >= 3) resolved = '3+_DAYS';
        else if (diffDays >= 1) resolved = '1-2_DAYS';
        else resolved = freshness;
    }
    if (resolved === 'TODAY')    return { text: '🟢 Harvested Today', cls: 'fresh-today' };
    if (resolved === '1-2_DAYS') return { text: '🟡 1–2 Days Old',   cls: 'fresh-1-2days' };
    return                              { text: '🔴 3+ Days Old',    cls: 'fresh-3plus' };
};

function ListingDetail() {
    const navigate = useNavigate();
    const { id }   = useParams();

    const [user, setUser]       = useState(null);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity]       = useState(1);
    const [buyerNotes, setBuyerNotes]   = useState('');
    const [ordering, setOrdering]       = useState(false);
    const [orderMsg, setOrderMsg]       = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token  = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        setUser(JSON.parse(stored));
        fetchListing();
    }, [navigate, id]);

    const fetchListing = async () => {
        setLoading(true);
        try {
            const data = await getListingById(id);
            if (data.success) setListing(data.data);
            else navigate('/buyer-dashboard');
        } catch { navigate('/buyer-dashboard'); }
        finally { setLoading(false); }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setOrderMsg('');
        if (quantity <= 0) { setOrderMsg('Please enter a valid quantity.'); return; }
        if (quantity > listing.quantity) {
            setOrderMsg(`Quantity exceeds available stock (${listing.quantity} ${listing.unit}).`);
            return;
        }
        setOrdering(true);
        try {
            const token = sessionStorage.getItem('token');
            const data  = await placeOrder(token, {
                listingId: listing.id,
                quantity: parseFloat(quantity),
                buyerNotes,
            });
            if (data.success) { setOrderSuccess(true); setOrderMsg('success'); }
            else setOrderMsg(data.message || 'Something went wrong.');
        } catch { setOrderMsg('Failed to place order. Please try again.'); }
        finally { setOrdering(false); }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return (
        <div className="ld-loading-screen">
            <p>Loading listing details…</p>
        </div>
    );

    if (!listing) return null;

    const freshnessInfo = getFreshnessInfo(listing.freshness, listing.postedAt);
    const totalPrice    = (quantity * listing.price).toFixed(2);

    return (
        <div className="ld-container">

            {/* ── NAV ─────────────────────────────────────── */}
            <nav className="ld-nav">
                <div className="ld-nav-brand">
                    <span className="ld-nav-grain">🌾</span>
                    <span className="ld-nav-title">AgriBridge</span>
                    <span className="ld-nav-badge">Buyer</span>
                </div>
                <div className="ld-nav-right">
                    {user && (
                        <span className="ld-nav-name">
                            <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                            {user.fullName}
                        </span>
                    )}
                    <button className="ld-nav-btn ld-nav-btn-back" onClick={() => navigate('/buyer-dashboard')}>
                        <MdArrowBack style={{ fontSize: '0.95rem' }} />
                        Back
                    </button>
                    <button className="ld-nav-btn ld-nav-btn-orders" onClick={() => navigate('/my-orders')}>
                        <MdShoppingBag style={{ fontSize: '0.95rem' }} />
                        My Orders
                    </button>
                    <button className="ld-nav-btn ld-nav-btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── BODY ────────────────────────────────────── */}
            <div className="ld-body">
                <div className="ld-content">

                    {/* LEFT — Photo & Farmer */}
                    <div className="ld-left">
                        <div className="ld-photo-box">
                            {listing.photoBase64 ? (
                                <img src={listing.photoBase64} alt={listing.produceName} />
                            ) : (
                                <div className="ld-photo-placeholder">🥬</div>
                            )}
                        </div>

                        <div className="ld-farmer-card">
                            <p className="ld-farmer-card-title">🧑‍🌾 Farmer Info</p>
                            <div className="ld-farmer-row">
                                <span>Name</span>
                                <strong>{listing.farmerName || '—'}</strong>
                            </div>
                            <div className="ld-farmer-row">
                                <span>Phone</span>
                                <strong>{listing.farmerPhone || '—'}</strong>
                            </div>
                            <div className="ld-farmer-row">
                                <span>Location</span>
                                <strong>{listing.farmerLocation || '—'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Details & Order */}
                    <div className="ld-right">

                        <div className="ld-detail-card">
                            <div className="ld-detail-header">
                                <div>
                                    <h1>{listing.produceName}</h1>
                                    <span className="ld-category-tag">{listing.category}</span>
                                </div>
                                <span className={`ld-freshness-badge ${freshnessInfo.cls}`}>
                                    {freshnessInfo.text}
                                </span>
                            </div>

                            <div className="ld-info-grid">
                                <div className="ld-info-item">
                                    <span>Price</span>
                                    <strong className="price-value">₱{listing.price}/{listing.unit}</strong>
                                </div>
                                <div className="ld-info-item">
                                    <span>Available</span>
                                    <strong>{listing.quantity} {listing.unit}</strong>
                                </div>
                                <div className="ld-info-item full">
                                    <span>Pickup Location</span>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <FaMapMarkerAlt style={{ color: '#10b981', fontSize: '0.75rem', flexShrink: 0 }} />
                                        {listing.pickupLocation}
                                    </strong>
                                </div>
                                {listing.additionalNotes && (
                                    <div className="ld-info-item full">
                                        <span>Notes from Farmer</span>
                                        <strong>{listing.additionalNotes}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ORDER FORM */}
                        {user?.role === 'BUYER' && (
                            <div className="ld-order-card">
                                <p className="ld-order-card-title">🛒 Place Rescue Order</p>
                                <p className="ld-order-note">
                                    💡 Payment is <strong>cash on pickup</strong>. Coordinate with the farmer via messages after ordering.
                                </p>

                                {orderSuccess ? (
                                    <div className="ld-order-success">
                                        <span className="ld-success-icon">🎉</span>
                                        <h3>Order Placed Successfully!</h3>
                                        <p>Your rescue order has been sent to the farmer.</p>
                                        <div className="ld-success-actions">
                                            <button className="ld-btn-primary" onClick={() => navigate('/my-orders')}>
                                                <MdShoppingBag style={{ fontSize: '0.95rem' }} />
                                                View My Orders
                                            </button>
                                            <button className="ld-btn-secondary" onClick={() => navigate('/buyer-dashboard')}>
                                                Continue Browsing
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePlaceOrder} className="ld-order-form">
                                        <div className="ld-order-field">
                                            <label>Quantity ({listing.unit})</label>
                                            <div className="ld-quantity-row">
                                                <button
                                                    type="button"
                                                    className="ld-qty-btn"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                >−</button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                                                    min="1"
                                                    max={listing.quantity}
                                                />
                                                <button
                                                    type="button"
                                                    className="ld-qty-btn"
                                                    onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                                                >+</button>
                                                <span className="ld-qty-hint">Max: {listing.quantity} {listing.unit}</span>
                                            </div>
                                        </div>

                                        <div className="ld-order-field">
                                            <label>Notes for Farmer (optional)</label>
                                            <textarea
                                                placeholder="e.g. I'll pick up at 3PM, please set aside…"
                                                value={buyerNotes}
                                                onChange={(e) => setBuyerNotes(e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="ld-price-summary">
                                            <div className="ld-price-row">
                                                <span>Price per {listing.unit}</span>
                                                <span>₱{listing.price}</span>
                                            </div>
                                            <div className="ld-price-row">
                                                <span>Quantity</span>
                                                <span>{quantity} {listing.unit}</span>
                                            </div>
                                            <div className="ld-price-row total">
                                                <span>Total</span>
                                                <span>₱{totalPrice}</span>
                                            </div>
                                            <p className="ld-cash-note">💵 Cash on pickup</p>
                                        </div>

                                        {orderMsg && orderMsg !== 'success' && (
                                            <div className="ld-order-msg msg-error">{orderMsg}</div>
                                        )}

                                        <button
                                            type="submit"
                                            className="ld-btn-primary full-width"
                                            disabled={ordering}
                                        >
                                            {ordering ? 'Placing Order…' : '🛒 Confirm Rescue Order'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListingDetail;