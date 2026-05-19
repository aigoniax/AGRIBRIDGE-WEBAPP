import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyListings, updateListing, deleteListing } from '../api/auth';
import './MyListings.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaEdit, FaTrashAlt, FaCamera, FaSeedling, FaMapMarkerAlt } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Others'];
const FRESHNESS_OPTIONS = [
    { value: 'TODAY',    label: '🟢 Harvested Today' },
    { value: '1-2_DAYS', label: '🟡 1–2 Days Old' },
    { value: '3+_DAYS',  label: '🔴 3+ Days Old' },
];
const UNITS = ['kg', 'pieces', 'bundle', 'sack', 'liter'];

const getFreshnessTag = (f) => {
    if (f === 'TODAY')    return { text: 'Harvested Today', cls: 'tag-today' };
    if (f === '1-2_DAYS') return { text: '1–2 Days Old',   cls: 'tag-1-2days' };
    return                       { text: '3+ Days Old',    cls: 'tag-3plus' };
};

function MyListings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    const [produceName, setProduceName] = useState('');
    const [category, setCategory] = useState('Vegetables');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [price, setPrice] = useState('');
    const [freshness, setFreshness] = useState('TODAY');
    const [pickupLocation, setPickupLocation] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingListing, setDeletingListing] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'FARMER') { navigate('/login'); return; }
        setUser(parsedUser);
        fetchListings(token);
    }, [navigate]);

    const fetchListings = async (token) => {
        setLoading(true);
        try {
            const data = await getMyListings(token);
            if (data.success) setListings(data.data || []);
        } catch (err) { console.error('Failed to fetch listings', err); }
        finally { setLoading(false); }
    };

    const handleOpenEdit = (listing) => {
        setEditingListing(listing);
        setProduceName(listing.produceName);
        setCategory(listing.category);
        setQuantity(listing.quantity.toString());
        setUnit(listing.unit);
        setPrice(listing.price.toString());
        setFreshness(listing.freshness);
        setPickupLocation(listing.pickupLocation);
        setAdditionalNotes(listing.additionalNotes || '');
        setPhotoPreview(listing.photoBase64 || null);
        setPhotoFile(null);
        setSubmitMsg('');
        setShowEditModal(true);
    };

    const handleCloseEdit = () => {
        setShowEditModal(false);
        setEditingListing(null);
        setSubmitMsg('');
        setPhotoPreview(null);
        setPhotoFile(null);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitMsg('');
        if (!produceName || !quantity || !price || !pickupLocation) {
            setSubmitMsg('error:Please fill in all required fields.');
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
            const data = await updateListing(token, editingListing.id, listingData, photoFile);
            if (data.success) {
                setSubmitMsg('success');
                fetchListings(token);
                setTimeout(() => handleCloseEdit(), 1500);
            } else {
                setSubmitMsg(`error:${data.message}`);
            }
        } catch (err) {
            setSubmitMsg('error:Failed to update listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDelete = (listing) => { setDeletingListing(listing); setShowDeleteModal(true); };
    const handleCloseDelete = () => { setShowDeleteModal(false); setDeletingListing(null); };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            const token = sessionStorage.getItem('token');
            await deleteListing(token, deletingListing.id);
            fetchListings(token);
            handleCloseDelete();
        } catch (err) { console.error('Failed to delete listing', err); }
        finally { setDeleting(false); }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="ml-container">

            {/* NAV */}
            <nav className="ml-nav">
                <div className="ml-nav-brand">
                    <span className="ml-nav-grain">🌾</span>
                    <span className="ml-nav-title">AgriBridge</span>
                    <span className="ml-nav-badge">Farmer</span>
                </div>
                <div className="ml-nav-right">
                    <span className="ml-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>
                    <button className="ml-nav-btn ml-nav-btn-dashboard" onClick={() => navigate('/farmer-dashboard')}>
                        <MdDashboard style={{ fontSize: '0.95rem' }} />
                        Dashboard
                    </button>
                    <button className="ml-nav-btn ml-nav-btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* BODY */}
            <div className="ml-body">

                <div className="ml-welcome">
                    <h1>
                        <FaClipboardList style={{ color: '#2563eb', fontSize: '1.6rem' }} />
                        My Listings
                    </h1>
                    <p>Manage all your produce listings here.</p>
                </div>

                {loading ? (
                    <div className="ml-empty">
                        <span style={{ fontSize: '2.5rem' }}>⏳</span>
                        <p>Loading your listings…</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="ml-empty">
                        <FaSeedling style={{ fontSize: '2.5rem', color: '#10b981' }} />
                        <p>You have no listings yet.</p>
                        <button className="ml-btn-primary" onClick={() => navigate('/farmer-dashboard')}>
                            + Add Your First Listing
                        </button>
                    </div>
                ) : (
                    <div className="ml-grid">
                        {listings.map((listing) => {
                            const freshnessTag = getFreshnessTag(listing.freshness);
                            const isAvailable  = listing.status === 'AVAILABLE';
                            return (
                                <div className="ml-card" key={listing.id}>
                                    <div className="ml-card-img-wrap">
                                        {listing.photoBase64 ? (
                                            <img src={listing.photoBase64} alt={listing.produceName} className="ml-card-img" />
                                        ) : (
                                            <div className="ml-card-img-placeholder">🌿</div>
                                        )}
                                        <span className={`ml-status-badge ${isAvailable ? 'tag-available' : 'tag-out'}`}>
                                            {isAvailable ? 'Available' : 'Out of Stock'}
                                        </span>
                                    </div>

                                    <div className="ml-card-body">
                                        <div className="ml-card-name">{listing.produceName}</div>
                                        <div className="ml-card-meta">
                                            <span>{listing.quantity} {listing.unit}</span>
                                            <span className="ml-meta-dot">●</span>
                                            <span className="ml-card-price">₱{listing.price}/{listing.unit}</span>
                                        </div>
                                        <div className="ml-card-tags">
                                            <span className={`ml-tag ${freshnessTag.cls}`}>{freshnessTag.text}</span>
                                            <span className="ml-tag tag-category">{listing.category}</span>
                                        </div>
                                        <div className="ml-card-location">
                                            <FaMapMarkerAlt style={{ fontSize: '0.65rem', flexShrink: 0 }} />
                                            <span>{listing.pickupLocation}</span>
                                        </div>
                                    </div>

                                    <div className="ml-card-actions">
                                        <button className="ml-edit-btn" onClick={() => handleOpenEdit(listing)}>
                                            <FaEdit style={{ fontSize: '0.8rem' }} /> Edit
                                        </button>
                                        <button className="ml-delete-btn" onClick={() => handleOpenDelete(listing)}>
                                            <FaTrashAlt style={{ fontSize: '0.8rem' }} /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showEditModal && (
                <div className="modal-overlay" onClick={handleCloseEdit}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaEdit style={{ color: '#059669', fontSize: '1.1rem' }} />
                                Edit Listing
                            </h2>
                            <button className="modal-close" onClick={handleCloseEdit}>✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="modal-form">
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
                                    id="edit-photo-upload" style={{ display: 'none' }} />
                                <label htmlFor="edit-photo-upload" className="modal-photo-btn">
                                    {photoPreview ? 'Change Photo' : 'Choose Photo'}
                                </label>
                            </div>

                            <div className="modal-grid">
                                <div className="modal-field full">
                                    <label>Produce Name *</label>
                                    <input type="text" value={produceName} onChange={(e) => setProduceName(e.target.value)} />
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
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" />
                                </div>
                                <div className="modal-field">
                                    <label>Unit *</label>
                                    <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="modal-field full">
                                    <label>Price (₱ per {unit}) *</label>
                                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
                                </div>
                                <div className="modal-field full">
                                    <label>Pickup Location *</label>
                                    <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
                                </div>
                                <div className="modal-field full">
                                    <label>Additional Notes</label>
                                    <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3} />
                                </div>
                            </div>

                            {submitMsg && (
                                <div className={`modal-msg ${submitMsg === 'success' ? 'msg-success' : 'msg-error'}`}>
                                    {submitMsg === 'success' ? '✅ Listing updated successfully!' : submitMsg.replace('error:', '')}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="ml-btn-secondary" onClick={handleCloseEdit}>Cancel</button>
                                <button type="submit" className="ml-btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && deletingListing && (
                <div className="modal-overlay" onClick={handleCloseDelete}>
                    <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-icon">
                            <FaTrashAlt style={{ fontSize: '2.5rem', color: '#dc2626' }} />
                        </div>
                        <h2>Delete Listing?</h2>
                        <p>Are you sure you want to delete <strong>{deletingListing.produceName}</strong>?</p>
                        <p className="delete-modal-warning">This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="ml-btn-secondary" onClick={handleCloseDelete}>Cancel</button>
                            <button className="ml-btn-delete" onClick={handleConfirmDelete} disabled={deleting}>
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyListings;