import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, editProfile, editPassword, uploadPhoto } from '../api/auth';
import './Profile.css';

import { RiUserFill } from 'react-icons/ri';
import { FaSignOutAlt, FaEdit, FaCamera, FaLock, FaSave } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser]   = useState(null);
    const [token, setToken] = useState(null);

    const [editMode, setEditMode]       = useState(false);
    const [fullName, setFullName]       = useState('');
    const [phone, setPhone]             = useState('');
    const [location, setLocation]       = useState('');
    const [profileMsg, setProfileMsg]   = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword]   = useState('');
    const [newPassword, setNewPassword]           = useState('');
    const [passwordMsg, setPasswordMsg]           = useState('');

    const [photoFile, setPhotoFile]       = useState(null);
    const [photoMsg, setPhotoMsg]         = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        const stored      = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');
        if (!stored || !storedToken) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setToken(storedToken);

        getProfile(storedToken).then(data => {
            setFullName(data.fullName || '');
            setPhone(data.phone || '');
            setLocation(data.location || '');
            if (data.photo) setPhotoPreview(data.photo);
            setUser(prev => ({ ...prev, ...data }));
        }).catch(() => {});
    }, [navigate]);

    const goToDashboard = () => {
        const stored = sessionStorage.getItem('user');
        if (!stored) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role === 'FARMER')      navigate('/farmer-dashboard');
        else if (parsedUser.role === 'BUYER')  navigate('/buyer-dashboard');
        else if (parsedUser.role === 'ADMIN')  navigate('/admin');
        else navigate('/login');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const handleEditProfile = async () => {
        try {
            await editProfile(token, fullName, phone, location);
            setProfileMsg('success');
            setEditMode(false);
            setUser(prev => ({ ...prev, fullName, phone, location }));
            sessionStorage.setItem('user', JSON.stringify({ ...user, fullName, phone, location }));
        } catch {
            setProfileMsg('error');
        }
    };

    const handleEditPassword = async () => {
        try {
            await editPassword(token, currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setShowPasswordForm(false);
            setPasswordMsg('success');
        } catch {
            setPasswordMsg('error');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
    };

    const handleUploadPhoto = async () => {
        if (!photoFile) return;
        try {
            await uploadPhoto(token, photoFile);
            setPhotoMsg('success');
        } catch {
            setPhotoMsg('error');
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">

            {/* NAV */}
            <nav className="profile-nav">
                <div className="profile-nav-brand" onClick={goToDashboard}>
                    <span className="profile-nav-grain">🌾</span>
                    <span className="profile-nav-title">AgriBridge</span>
                </div>
                <div className="profile-nav-right">
                    <span className="profile-nav-name">
                        <RiUserFill style={{ color: '#10b981', fontSize: '0.9rem' }} />
                        {user.fullName}
                    </span>
                    <button className="profile-nav-btn profile-nav-btn-dashboard" onClick={goToDashboard}>
                        <MdDashboard style={{ fontSize: '0.95rem' }} />
                        Dashboard
                    </button>
                    <button className="profile-nav-btn profile-nav-btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* BODY */}
            <div className="profile-body">

                <div className="profile-welcome">
                    <h1>My Profile</h1>
                    <p>Manage your account details and preferences.</p>
                </div>

                <div className="profile-card">

                    {/* PHOTO */}
                    <div className="profile-photo-section">
                        <div className="profile-photo-wrap">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="profile-photo" />
                            ) : (
                                <div className="profile-photo-placeholder">👤</div>
                            )}
                        </div>
                        <div className="profile-photo-info">
                            <h3>{fullName || 'Your Name'}</h3>
                            <p>{user.email}</p>
                            <div className="profile-photo-controls">
                                <input
                                    type="file"
                                    accept=".jpg,.png"
                                    onChange={handlePhotoChange}
                                    id="profile-photo-input"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="profile-photo-input" className="profile-file-label">
                                    <FaCamera style={{ fontSize: '0.75rem' }} />
                                    {photoFile ? 'Change Photo' : 'Choose Photo'}
                                </label>
                                {photoFile && (
                                    <button className="profile-upload-btn" onClick={handleUploadPhoto}>
                                        Upload
                                    </button>
                                )}
                            </div>
                            {photoMsg && (
                                <p className={`profile-photo-msg ${photoMsg === 'success' ? 'photo-msg-success' : 'photo-msg-error'}`}>
                                    {photoMsg === 'success' ? '✅ Photo uploaded successfully!' : '❌ Failed to upload photo.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* INFO / EDIT */}
                    <div className="profile-info-section">
                        <p className="profile-section-title">Account Information</p>

                        {editMode ? (
                            <div className="profile-edit-form">
                                <div className="profile-form-grid">
                                    <div className="profile-form-field full">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="profile-form-field">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="e.g. 09xx-xxx-xxxx"
                                        />
                                    </div>
                                    <div className="profile-form-field">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            placeholder="e.g. Talisay, Cebu"
                                        />
                                    </div>
                                </div>
                                <div className="profile-form-actions">
                                    <button className="profile-save-btn" onClick={handleEditProfile}>
                                        <FaSave style={{ fontSize: '0.8rem' }} />
                                        Save Changes
                                    </button>
                                    <button className="profile-cancel-btn" onClick={() => { setEditMode(false); setProfileMsg(''); }}>
                                        Cancel
                                    </button>
                                </div>
                                {profileMsg && (
                                    <div className={`profile-form-msg ${profileMsg === 'success' ? 'form-msg-success' : 'form-msg-error'}`}>
                                        {profileMsg === 'success' ? '✅ Profile updated successfully!' : '❌ Failed to update profile.'}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="profile-info-rows">
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">Name</span>
                                        <span className={`profile-info-value ${!fullName ? 'empty' : ''}`}>
                                            {fullName || '—'}
                                        </span>
                                    </div>
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">Email</span>
                                        <span className="profile-info-value">{user.email}</span>
                                    </div>
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">Phone</span>
                                        <span className={`profile-info-value ${!phone ? 'empty' : ''}`}>
                                            {phone || '—'}
                                        </span>
                                    </div>
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">Location</span>
                                        <span className={`profile-info-value ${!location ? 'empty' : ''}`}>
                                            {location || '—'}
                                        </span>
                                    </div>
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">Role</span>
                                        <span className="profile-role-badge">{user.role}</span>
                                    </div>
                                </div>
                                <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                                    <FaEdit style={{ fontSize: '0.8rem' }} />
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div className="profile-password-section">
                        <p className="profile-section-title">Security</p>
                        <button
                            className="profile-password-toggle"
                            onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordMsg(''); }}
                        >
                            <FaLock style={{ fontSize: '0.75rem' }} />
                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </button>

                        {passwordMsg && (
                            <div className={`profile-password-msg ${passwordMsg === 'success' ? 'form-msg-success' : 'form-msg-error'}`}>
                                {passwordMsg === 'success'
                                    ? '✅ Password updated! Please log in again with your new password.'
                                    : '❌ Failed. Please check your current password.'}
                            </div>
                        )}

                        {showPasswordForm && (
                            <div className="profile-password-form">
                                <div className="profile-form-field">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="profile-form-field input"
                                        style={{
                                            padding: '0.65rem 0.9rem',
                                            border: '1.5px solid var(--gray-200)',
                                            borderRadius: '10px',
                                            fontFamily: 'Sora, sans-serif',
                                            fontSize: '0.88rem',
                                            color: 'var(--gray-900)',
                                            background: 'var(--white)',
                                            outline: 'none',
                                            transition: 'border-color 0.15s',
                                        }}
                                    />
                                </div>
                                <div className="profile-form-field">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        style={{
                                            padding: '0.65rem 0.9rem',
                                            border: '1.5px solid var(--gray-200)',
                                            borderRadius: '10px',
                                            fontFamily: 'Sora, sans-serif',
                                            fontSize: '0.88rem',
                                            color: 'var(--gray-900)',
                                            background: 'var(--white)',
                                            outline: 'none',
                                            transition: 'border-color 0.15s',
                                        }}
                                    />
                                </div>
                                <div>
                                    <button className="profile-save-btn" onClick={handleEditPassword}>
                                        <FaLock style={{ fontSize: '0.75rem' }} />
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;