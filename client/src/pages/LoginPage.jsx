import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const fillAdmin = () => {
    setEmail('admin@society.com');
    setPassword('admin123');
    setError('');
  };

  const fillResident = () => {
    setEmail('resident1@society.com');
    setPassword('resident123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        addToast(`Welcome back, ${res.data.name}!`, 'success');
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/complaints');
        }
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
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
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access your dashboard.</p>
          </div>
          
          {error && <div className="error-alert" style={{ color: 'var(--overdue-text)', background: 'var(--overdue-bg)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="login-form-group">
              <label className="login-label" htmlFor="email">Email Address</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="login-label" htmlFor="password">Password</label>
              </div>
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Demo Credentials Panel for Evaluators */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Evaluator Demo Quick Access
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={fillAdmin}
                style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}
              >
                <ShieldCheck size={14} color="var(--primary-blue)" /> Fill Admin
              </button>
              <button
                type="button"
                onClick={fillResident}
                style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}
              >
                <User size={14} color="#059669" /> Fill Resident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
