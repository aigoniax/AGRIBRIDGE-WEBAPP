import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListingById, placeOrder } from '../api/auth';
import './ListingDetail.css';

function ListingDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    // Order form
    const [quantity, setQuantity] = useState(1);
    const [buyerNotes, setBuyerNotes] = useState('');
    const [ordering, setOrdering] = useState(false);
    const [orderMsg, setOrderMsg] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchListing();
    }, [navigate, id]);

    const fetchListing = async () => {
        setLoading(true);
        try {
        const data = await getListingById(id);
        if (data.success) {
            setListing(data.data);
        } else {
            navigate('/buyer-dashboard');
        }
        } catch (err) {
        console.error('Failed to fetch listing', err);
        navigate('/buyer-dashboard');
        } finally {
        setLoading(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setOrderMsg('');

        if (quantity <= 0) {
        setOrderMsg('⚠ Please enter a valid quantity.');
        return;
        }
        if (quantity > listing.quantity) {
        setOrderMsg(`⚠ Quantity exceeds available stock (${listing.quantity} ${listing.unit}).`);
        return;
        }

        setOrdering(true);
        try {
        const token = sessionStorage.getItem('token');
        const data = await placeOrder(token, {
            listingId: listing.id,
            quantity: parseFloat(quantity),
            buyerNotes,
        });
        if (data.success) {
            setOrderSuccess(true);
            setOrderMsg('✅ Rescue order placed successfully!');
        } else {
            setOrderMsg(`⚠ ${data.message}`);
        }
        } catch (err) {
        setOrderMsg('⚠ Failed to place order. Please try again.');
        } finally {
        setOrdering(false);
        }
    };

    const getFreshnessLabel = (f) => {
        if (f === 'TODAY') return '🟢 Harvested Today';
        if (f === '1-2_DAYS') return '🟡 1-2 Days Old';
        return '🔴 3+ Days Old';
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return (
        <div className="ld-loading-screen">
        <p>Loading listing details...</p>
        </div>
    );

    if (!listing) return null;

    const totalPrice = (quantity * listing.price).toFixed(2);

    return (
        <div className="ld-container">
        {/* NAV */}
        <nav className="ld-nav">
            <div className="ld-nav-brand">
            <span className="ld-nav-title">AgriBridge</span>
            <span className="ld-nav-badge">Buyer</span>
            </div>
            <div className="ld-nav-right">
            {user && <span className="ld-nav-name">👤 {user.fullName}</span>}
            <button className="ld-back-btn" onClick={() => navigate('/buyer-dashboard')}>
                ← Back
            </button>
            <button className="ld-orders-btn" onClick={() => navigate('/my-orders')}>
                📦 My Orders
            </button>
            <button className="ld-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        <div className="ld-body">
            <div className="ld-content">

            {/* LEFT — Photo & Farmer Info */}
            <div className="ld-left">
                <div className="ld-photo-box">
                {listing.photoBase64 ? (
                    <img src={listing.photoBase64} alt={listing.produceName} />
                ) : (
                    <div className="ld-photo-placeholder">🥬</div>
                )}
                </div>

                <div className="ld-farmer-card">
                <h3>🧑‍🌾 Farmer Info</h3>
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

            {/* RIGHT — Listing Details & Order Form */}
            <div className="ld-right">
                <div className="ld-detail-card">
                {/* Header */}
                <div className="ld-detail-header">
                    <div>
                    <h1>{listing.produceName}</h1>
                    <span className="ld-category-tag">{listing.category}</span>
                    </div>
                    <span className="ld-freshness-badge">
                    {getFreshnessLabel(listing.freshness)}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="ld-info-grid">
                    <div className="ld-info-item">
                    <span>Price</span>
                    <strong>₱{listing.price}/{listing.unit}</strong>
                    </div>
                    <div className="ld-info-item">
                    <span>Available</span>
                    <strong>{listing.quantity} {listing.unit}</strong>
                    </div>
                    <div className="ld-info-item full">
                    <span>📍 Pickup Location</span>
                    <strong>{listing.pickupLocation}</strong>
                    </div>
                    {listing.additionalNotes && (
                    <div className="ld-info-item full">
                        <span>📝 Notes from Farmer</span>
                        <strong>{listing.additionalNotes}</strong>
                    </div>
                    )}
                </div>
                </div>

                {/* ORDER FORM */}
                {user?.role === 'BUYER' && (
                <div className="ld-order-card">
                    <h2>🛒 Place Rescue Order</h2>
                    <p className="ld-order-note">
                    💡 Payment is <strong>cash on pickup</strong>. Coordinate with the farmer via messages after ordering.
                    </p>

                    {orderSuccess ? (
                    <div className="ld-order-success">
                        <div className="ld-success-icon">🎉</div>
                        <h3>Order Placed Successfully!</h3>
                        <p>Your rescue order has been sent to the farmer.</p>
                        <div className="ld-success-actions">
                        <button
                            className="ld-btn-primary"
                            onClick={() => navigate('/my-orders')}
                        >
                            📦 View My Orders
                        </button>
                        <button
                            className="ld-btn-secondary"
                            onClick={() => navigate('/buyer-dashboard')}
                        >
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
                        </div>
                        <p className="ld-qty-hint">
                            Max: {listing.quantity} {listing.unit}
                        </p>
                        </div>

                        <div className="ld-order-field">
                        <label>Notes for Farmer (optional)</label>
                        <textarea
                            placeholder="e.g. I'll pick up at 3PM, please set aside..."
                            value={buyerNotes}
                            onChange={(e) => setBuyerNotes(e.target.value)}
                            rows={3}
                        />
                        </div>

                        {/* Price Summary */}
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
                            <span>Total Price</span>
                            <span>₱{totalPrice}</span>
                        </div>
                        <p className="ld-cash-note">💵 Cash on pickup</p>
                        </div>

                        {orderMsg && (
                        <div className={`ld-order-msg ${orderMsg.includes('✅') ? 'msg-success' : 'msg-error'}`}>
                            {orderMsg}
                        </div>
                        )}

                        <button
                        type="submit"
                        className="ld-btn-primary full-width"
                        disabled={ordering}
                        >
                        {ordering ? '⏳ Placing Order...' : '🛒 Confirm Rescue Order'}
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