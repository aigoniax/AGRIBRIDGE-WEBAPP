import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import './Auth.css';

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('FARMER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const allRulesPassed = passwordRules.every((r) => r.test(password));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone || !location) {
      setError('Please fill in all fields.');
      return;
    }

    if (!allRulesPassed) {
      setError('Password does not meet the requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(firstName, lastName, email, password, confirmPassword, phone, location, role);
      if (data.success) {
        if (role === 'FARMER') {
          setSuccessMsg('Registration successful! Your account is pending admin approval. Please wait for an email confirmation before logging in.');
          setTimeout(() => navigate('/login'), 4000);
        } else {
          setSuccessMsg('Registration successful! You can now log in.');
          setTimeout(() => navigate('/login'), 2000);
        }
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
      </div>

      <div className="auth-right">
        <div className="auth-card auth-card-register">
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

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password — hints always rendered but hidden until typing */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={`password-hints ${password.length > 0 ? 'hints-visible' : 'hints-hidden'}`}>
                {passwordRules.map((rule) => (
                  <div key={rule.label} className={`hint-item ${rule.test(password) ? 'hint-pass' : 'hint-fail'}`}>
                    {rule.test(password) ? '✅' : '❌'} {rule.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password — match indicator always rendered but hidden until typing */}
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className={`hint-item ${confirmPassword.length > 0 ? (password === confirmPassword ? 'hint-pass' : 'hint-fail') : 'hints-hidden'}`}>
                {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Your city / province"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="error-message">⚠ {error}</div>}
            {successMsg && <div className="success-message">✅ {successMsg}</div>}

            <button type="submit" className="auth-btn" disabled={loading || !!successMsg}>
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