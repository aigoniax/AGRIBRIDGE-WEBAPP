import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getPendingFarmers, approveFarmer, rejectFarmer,
    getAdminStatistics, getAdminListings, removeAdminListing
} from '../api/auth';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();

    // Farmers state
    const [farmers, setFarmers] = useState([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    // Statistics state
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Listings state
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [listingMsg, setListingMsg] = useState('');

    // Active tab
    const [activeTab, setActiveTab] = useState('approvals');

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || user.role !== 'ADMIN') {
        navigate('/login');
        return;
        }
        fetchPendingFarmers();
        fetchStatistics();
        fetchListings();
    }, [navigate]);

    const fetchPendingFarmers = async () => {
        setLoadingFarmers(true);
        try {
        const data = await getPendingFarmers();
        setFarmers(data);
        } catch (err) {
        console.error('Failed to fetch pending farmers', err);
        } finally {
        setLoadingFarmers(false);
        }
    };

    const fetchStatistics = async () => {
        setLoadingStats(true);
        try {
        const data = await getAdminStatistics();
        setStats(data);
        } catch (err) {
        console.error('Failed to fetch statistics', err);
        } finally {
        setLoadingStats(false);
        }
    };

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            const data = await getAdminListings();
            if (data.success) {
            setListings(data.data || []);
            } else {
            setListings([]);
            }
        } catch (err) {
            console.error('Failed to fetch listings', err);
            setListings([]);
        } finally {
            setLoadingListings(false);
        }
    };

    const handleApprove = async (id, name) => {
        if (processingId) return;
        setProcessingId(`approve-${id}`);
        setActionMsg('');
        try {
        await approveFarmer(id);
        setActionMsg(`✅ ${name} has been approved! A confirmation email has been sent.`);
        fetchPendingFarmers();
        fetchStatistics();
        } catch (err) {
        setActionMsg('❌ Failed to approve. Please try again.');
        } finally {
        setProcessingId(null);
        }
        setTimeout(() => setActionMsg(''), 4000);
    };

    const handleReject = async (id, name) => {
        if (processingId) return;
        setProcessingId(`reject-${id}`);
        setActionMsg('');
        try {
        await rejectFarmer(id);
        setActionMsg(`❌ ${name} has been rejected.`);
        fetchPendingFarmers();
        fetchStatistics();
        } catch (err) {
        setActionMsg('❌ Failed to reject. Please try again.');
        } finally {
        setProcessingId(null);
        }
        setTimeout(() => setActionMsg(''), 4000);
    };

    const handleRemoveListing = async (id, name) => {
        if (!window.confirm(`Remove listing "${name}"? This cannot be undone.`)) return;
        setRemovingId(id);
        setListingMsg('');
        try {
        await removeAdminListing(id);
        setListingMsg(`✅ Listing "${name}" has been removed.`);
        fetchListings();
        fetchStatistics();
        } catch (err) {
        setListingMsg('❌ Failed to remove listing. Please try again.');
        } finally {
        setRemovingId(null);
        }
        setTimeout(() => setListingMsg(''), 4000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const getFreshnessLabel = (f) => {
        if (f === 'TODAY') return '🟢 Today';
        if (f === '1-2_DAYS') return '🟡 1-2 Days';
        return '🔴 3+ Days';
    };

    return (
        <div className="admin-container">
        {/* NAV */}
        <nav className="admin-nav">
            <div className="admin-nav-brand">
            <span className="admin-nav-title">🌾 AgriBridge</span>
            <span className="admin-nav-badge">Admin Panel</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </nav>

        <div className="admin-body">

            {/* STATS CARDS */}
            <div className="admin-stats">
            <div className="admin-stat-card">
                <div className="admin-stat-icon">🧑‍🌾</div>
                <div className="admin-stat-info">
                <h3>{loadingStats ? '...' : stats?.totalFarmers ?? 0}</h3>
                <p>Approved Farmers</p>
                </div>
            </div>
            <div className="admin-stat-card">
                <div className="admin-stat-icon">⏳</div>
                <div className="admin-stat-info">
                <h3>{loadingStats ? '...' : stats?.pendingFarmers ?? 0}</h3>
                <p>Pending Farmers</p>
                </div>
            </div>
            <div className="admin-stat-card">
                <div className="admin-stat-icon">🛒</div>
                <div className="admin-stat-info">
                <h3>{loadingStats ? '...' : stats?.totalBuyers ?? 0}</h3>
                <p>Total Buyers</p>
                </div>
            </div>
            <div className="admin-stat-card">
                <div className="admin-stat-icon">📋</div>
                <div className="admin-stat-info">
                <h3>{loadingStats ? '...' : stats?.totalListings ?? 0}</h3>
                <p>Active Listings</p>
                </div>
            </div>
            <div className="admin-stat-card">
                <div className="admin-stat-icon">📦</div>
                <div className="admin-stat-info">
                <h3>{loadingStats ? '...' : stats?.totalOrders ?? 0}</h3>
                <p>Total Orders</p>
                </div>
            </div>
            </div>

            {/* TABS */}
            <div className="admin-tabs">
            <button
                className={`admin-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
                onClick={() => setActiveTab('approvals')}
            >
                👨‍🌾 Farmer Approvals
                {farmers.length > 0 && (
                <span className="admin-tab-badge">{farmers.length}</span>
                )}
            </button>
            <button
                className={`admin-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => setActiveTab('listings')}
            >
                📋 Listing Moderation
            </button>
            </div>

            {/* TAB CONTENT — FARMER APPROVALS */}
            {activeTab === 'approvals' && (
            <div className="admin-tab-content">
                <div className="admin-header">
                <h1>Pending Farmer Approvals</h1>
                <p>Review and approve or reject farmer registration requests below.</p>
                </div>

                {actionMsg && <div className="admin-action-msg">{actionMsg}</div>}

                {loadingFarmers ? (
                <div className="admin-loading">Loading pending farmers...</div>
                ) : farmers.length === 0 ? (
                <div className="admin-empty">
                    <span>🎉</span>
                    <p>No pending farmer registrations at the moment.</p>
                </div>
                ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                    <thead>
                        <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmers.map((farmer) => (
                        <tr key={farmer.id}>
                            <td>{farmer.fullName}</td>
                            <td>{farmer.email}</td>
                            <td>{farmer.phone || '—'}</td>
                            <td>{farmer.location || '—'}</td>
                            <td className="admin-actions">
                            <button
                                className="approve-btn"
                                onClick={() => handleApprove(farmer.id, farmer.fullName)}
                                disabled={processingId !== null}
                            >
                                {processingId === `approve-${farmer.id}` ? '⏳ Approving...' : '✅ Approve'}
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleReject(farmer.id, farmer.fullName)}
                                disabled={processingId !== null}
                            >
                                {processingId === `reject-${farmer.id}` ? '⏳ Rejecting...' : '❌ Reject'}
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}

                {processingId && (
                <div className="admin-processing-bar">
                    ⏳ Processing action, please wait... (sending email may take a few seconds)
                </div>
                )}
            </div>
            )}

            {/* TAB CONTENT — LISTING MODERATION */}
            {activeTab === 'listings' && (
            <div className="admin-tab-content">
                <div className="admin-header">
                <h1>Listing Moderation</h1>
                <p>Review and remove inappropriate or fraudulent listings.</p>
                </div>

                {listingMsg && <div className="admin-action-msg">{listingMsg}</div>}

                {loadingListings ? (
                <div className="admin-loading">Loading listings...</div>
                ) : listings.length === 0 ? (
                <div className="admin-empty">
                    <span>📋</span>
                    <p>No active listings at the moment.</p>
                </div>
                ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                    <thead>
                        <tr>
                        <th>Produce</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Freshness</th>
                        <th>Pickup Location</th>
                        <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map((listing) => (
                        <tr key={listing.id}>
                            <td>
                            <div className="admin-listing-name">
                                {listing.photoBase64 && (
                                <img
                                    src={listing.photoBase64}
                                    alt={listing.produceName}
                                    className="admin-listing-thumb"
                                />
                                )}
                                <span>{listing.produceName}</span>
                            </div>
                            </td>
                            <td>{listing.category}</td>
                            <td>₱{listing.price}/{listing.unit}</td>
                            <td>{listing.quantity} {listing.unit}</td>
                            <td>{getFreshnessLabel(listing.freshness)}</td>
                            <td>{listing.pickupLocation}</td>
                            <td>
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveListing(listing.id, listing.produceName)}
                                disabled={removingId === listing.id}
                            >
                                {removingId === listing.id ? '⏳' : '🗑 Remove'}
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    );
}

export default AdminDashboard;