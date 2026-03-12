import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword || !phone || !location) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(fullName, email, password, confirmPassword, phone, location, role);
      if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <h1 className="brand-name">AgriBridge</h1>
          <p className="brand-tagline">Connecting farmers to a smarter future</p>
        </div>
        <div className="auth-decoration">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
          <div className="deco-circle deco-3"></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join AgriBridge today</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="role-selector">
              <button type="button" className={`role-btn ${role === 'FARMER' ? 'active' : ''}`} onClick={() => setRole('FARMER')}>
                🌾 I'm a Farmer
              </button>
              <button type="button" className={`role-btn ${role === 'BUYER' ? 'active' : ''}`} onClick={() => setRole('BUYER')}>
                🛒 I'm a Buyer
              </button>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="text" placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Your city / province" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            {error && <div className="error-message">⚠ {error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;