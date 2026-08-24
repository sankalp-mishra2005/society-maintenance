import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import './LoginPage.css'; // Reuse the login page CSS for identical layout

const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        flatNumber: flatNumber.trim(),
        phoneNumber: phoneNumber.trim()
      });

      if (res.success) {
        addToast('Resident account created successfully!', 'success');
        navigate('/complaints');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        {/* SVG Grid Background */}
        <div className="login-grid-bg">
          <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 100 100">
            <pattern height="10" id="gridPattern" patternUnits="userSpaceOnUse" width="10">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2"></path>
            </pattern>
            <rect fill="url(#gridPattern)" height="100" width="100"></rect>
          </svg>
        </div>

        {/* Header */}
        <div className="login-header">
          <img alt="Society OS Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA05kiaQCCCn1bOChfkPsr1aS8ENBRad2msO7Vccf6uhGog35Kfm2C6M7V45dse8Eb2lUV1a_8USxZ7cgJgWKadjlhqbfcen-aGz0u7K9mLxJK8Z6TUqcER1D2TODrZ43jkRzrC5Z0IfLVKpkH5ttnXPr8DzYxIo-HJCbox2lzDZOvLwjEvDoMpRf34BPh6Gzy0TQ2sek7o_cFfO16Bg2oM0zMYs3ScG66u-C6uydpl5nEy6mbJKpluJQ" />
          <h1>Society OS</h1>
        </div>

        {/* Quote */}
        <div className="login-quote">
          <p>
            Streamlining community living through transparent maintenance and efficient operations.
          </p>
        </div>

        {/* SVG illustration bottom right */}
        <div className="login-illustration">
          <svg style={{ width: '100%', height: '100%' }} fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect fill="currentColor" height="150" rx="4" width="40" x="20" y="50"></rect>
            <rect fill="currentColor" height="180" rx="4" width="50" x="80" y="20"></rect>
            <rect fill="currentColor" height="120" rx="4" width="30" x="150" y="80"></rect>
            <circle cx="40" cy="70" fill="var(--bg-main)" r="4"></circle>
            <circle cx="40" cy="100" fill="var(--bg-main)" r="4"></circle>
            <circle cx="40" cy="130" fill="var(--bg-main)" r="4"></circle>
            <circle cx="105" cy="50" fill="var(--bg-main)" r="6"></circle>
            <circle cx="105" cy="90" fill="var(--bg-main)" r="6"></circle>
            <circle cx="105" cy="130" fill="var(--bg-main)" r="6"></circle>
            <circle cx="165" cy="100" fill="var(--bg-main)" r="3"></circle>
            <circle cx="165" cy="140" fill="var(--bg-main)" r="3"></circle>
          </svg>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Resident Registration</h2>
            <p>Register your resident profile to raise and track maintenance requests</p>
          </div>

          <div style={{
            background: 'var(--primary-glow)',
            border: '1px solid var(--primary-blue)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--primary-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={16} />
            <span>Public signup creates Resident accounts only.</span>
          </div>
          
          {error && <div className="error-alert" style={{ color: 'var(--overdue-text)', background: 'var(--overdue-bg)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="login-form-group">
              <label className="login-label" htmlFor="name">Full Name *</label>
              <input 
                id="name" 
                type="text" 
                className="login-input" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="login-form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="login-label" htmlFor="flatNumber">Flat / Unit *</label>
                <input 
                  id="flatNumber" 
                  type="text" 
                  className="login-input" 
                  placeholder="Block A - Flat 101" 
                  required 
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="login-label" htmlFor="phone">Phone (Optional)</label>
                <input 
                  id="phone" 
                  type="text" 
                  className="login-input" 
                  placeholder="+1 555-0100" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label" htmlFor="email">Email Address *</label>
              <input 
                id="email" 
                type="email" 
                className="login-input" 
                placeholder="name@society.os" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-form-group">
              <label className="login-label" htmlFor="password">Password *</label>
              <div className="login-input-wrapper">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  className="login-input" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Registering...' : 'Register Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
