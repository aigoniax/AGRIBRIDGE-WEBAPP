import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/auth';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    if (!stored || !storedToken) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);

      getProfile(storedToken).then(data => {
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

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="nav-title">AgriBridge</span>
        </div>
        <div className="nav-user">
          <span className="nav-username">{user.fullName}</span>
          <div
            className="nav-profile-icon"
            onClick={() => navigate('/profile')}
            title="View Profile"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="nav-profile-img" />
            ) : (
              <div className="nav-profile-placeholder">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h1>Welcome back, <span>{user.fullName}</span>!</h1>
          <p>Here's your AgriBridge dashboard overview.</p>
        </div>

        <div className="dashboard-cards">
          <div className="dash-card"><h3>My Crops</h3><p>Manage and track your crop listings</p></div>
          <div className="dash-card"><h3>Orders</h3><p>View and manage your orders</p></div>
          <div className="dash-card"><h3>Analytics</h3><p>Track your farm's performance</p></div>
          <div className="dash-card"><h3>Messages</h3><p>Connect with buyers and sellers</p></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;