import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingFarmers, approveFarmer, rejectFarmer } from '../api/auth';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || user.role !== 'ADMIN') {
        navigate('/login');
        return;
        }
        fetchPendingFarmers();
    }, [navigate]);

    const fetchPendingFarmers = async () => {
        setLoading(true);
        try {
        const data = await getPendingFarmers();
        setFarmers(data);
        } catch (err) {
        console.error('Failed to fetch pending farmers', err);
        } finally {
        setLoading(false);
        }
    };

    const handleApprove = async (id, name) => {
        try {
        await approveFarmer(id);
        setActionMsg(`✅ ${name} has been approved!`);
        fetchPendingFarmers();
        } catch (err) {
        setActionMsg('❌ Failed to approve. Please try again.');
        }
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleReject = async (id, name) => {
        try {
        await rejectFarmer(id);
        setActionMsg(`❌ ${name} has been rejected.`);
        fetchPendingFarmers();
        } catch (err) {
        setActionMsg('❌ Failed to reject. Please try again.');
        }
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="admin-container">
        <nav className="admin-nav">
            <div className="admin-nav-brand">
            <span className="admin-nav-title">🌾 AgriBridge</span>
            <span className="admin-nav-badge">Admin Panel</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </nav>

        <div className="admin-body">
            <div className="admin-header">
            <h1>Pending Farmer Approvals</h1>
            <p>Review and approve or reject farmer registration requests below.</p>
            </div>

            {actionMsg && (
            <div className="admin-action-msg">{actionMsg}</div>
            )}

            {loading ? (
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
                        >
                            ✅ Approve
                        </button>
                        <button
                            className="reject-btn"
                            onClick={() => handleReject(farmer.id, farmer.fullName)}
                        >
                            ❌ Reject
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
}

export default AdminDashboard;