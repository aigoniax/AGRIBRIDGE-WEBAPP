import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, editProfile, editPassword, uploadPhoto } from '../api/auth';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [profileMsg, setProfileMsg] = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');

    const [photoFile, setPhotoFile] = useState(null);
    const [photoMsg, setPhotoMsg] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');
        if (!stored || !storedToken) {
        navigate('/login');
        } else {
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
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const handleEditProfile = async () => {
        try {
        await editProfile(token, fullName, phone, location);
        setProfileMsg('Profile updated successfully!');
        setEditMode(false);
        setUser(prev => ({ ...prev, fullName, phone, location }));
        sessionStorage.setItem('user', JSON.stringify({ ...user, fullName, phone, location }));
        } catch (e) {
        setProfileMsg('Failed to update profile.');
        }
    };

    const handleEditPassword = async () => {
        try {
        await editPassword(token, currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setShowPasswordForm(false);
        setPasswordMsg('Password updated successfully! Please login again with your new password.');
        } catch (e) {
        setPasswordMsg('Failed. Check your current password.');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        if (!photoFile) return;
        try {
        await uploadPhoto(token, photoFile);
        setPhotoMsg('Photo uploaded successfully!');
        } catch (e) {
        setPhotoMsg('Failed to upload photo.');
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">
        <nav className="profile-nav">
            <div className="nav-brand">
            <span className="nav-title" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                AgriBridge
            </span>
            </div>
            <div className="nav-user">
            <span className="nav-username">{user.fullName}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </nav>

        <div className="profile-body">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
            </button>

            <div className="profile-card">
            <h2>My Profile</h2>

            {/* Photo Upload */}
            <div className="photo-area">
                <img
                src={photoPreview || 'https://via.placeholder.com/100'}
                alt="Profile"
                className="profile-photo"
                />
                <div className="photo-upload-controls">
                <input type="file" accept=".jpg,.png" onChange={handlePhotoChange} />
                <button className="btn-green" onClick={handleUploadPhoto}>Upload Photo</button>
                {photoMsg && (
                    <p style={{
                    color: photoMsg.includes('successfully') ? 'green' : 'red',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                    }}>
                    {photoMsg}
                    </p>
                )}
                </div>
            </div>

            {/* Profile Info */}
            {editMode ? (
                <div className="edit-form">
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
                <div className="form-buttons">
                    <button className="btn-green" onClick={handleEditProfile}>Save Changes</button>
                    <button className="btn-outline" onClick={() => {
                    setEditMode(false);
                    setProfileMsg('');
                    }}>Cancel</button>
                </div>
                {profileMsg && (
                    <p style={{
                    color: profileMsg.includes('successfully') ? 'green' : 'red',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                    }}>
                    {profileMsg}
                    </p>
                )}
                </div>
            ) : (
                <div className="profile-info">
                <div className="info-row"><span className="info-label">Name</span><span>{fullName}</span></div>
                <div className="info-row"><span className="info-label">Email</span><span>{user.email}</span></div>
                <div className="info-row"><span className="info-label">Phone</span><span>{phone}</span></div>
                <div className="info-row"><span className="info-label">Location</span><span>{location}</span></div>
                <div className="info-row"><span className="info-label">Role</span><span>{user.role}</span></div>
                <button className="btn-green" onClick={() => setEditMode(true)}>Edit Profile</button>
                </div>
            )}

            {/* Password Section */}
            <div className="password-area">
                <button className="btn-outline" onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordMsg('');
                }}>
                {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
                {passwordMsg && (
                <p style={{
                    color: passwordMsg.includes('successfully') ? 'green' : 'red',
                    fontWeight: '600',
                    marginTop: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    {passwordMsg}
                </p>
                )}
                {showPasswordForm && (
                <div className="edit-form">
                    <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    />
                    <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    />
                    <button className="btn-green" onClick={handleEditPassword}>
                    Update Password
                    </button>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
    }

export default Profile;