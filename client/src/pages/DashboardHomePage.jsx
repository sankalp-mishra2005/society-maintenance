import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Home, Users, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import OperationsIntelligence from '../components/Dashboard/OperationsIntelligence';
import './DashboardHomePage.css';

const DashboardHomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Home Dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-wrapper">
          <h1 className="dashboard-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="dashboard-subtitle">
            {user?.role === 'admin' 
              ? "Here's what's happening in your society today." 
              : "Here's an overview of your community activities and maintenance requests."}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <LoadingSkeleton count={4} type="grid" />
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)', background: 'rgba(186,26,26,0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      ) : stats ? (
        <>
          {/* Main Stat Cards */}
          <div className="stats-grid">
            
            <Link to={user?.role === 'admin' ? '/admin' : '/complaints'} className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(214, 224, 243, 1)', color: 'var(--primary-blue)' }}>
                <AlertCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-label">Active Complaints</span>
                <span className="stat-value">{stats.complaints.open + stats.complaints.inProgress}</span>
                <span className="stat-trend trend-neutral">
                  <Clock size={12} /> Pending resolution
                </span>
              </div>
            </Link>

            <Link to={user?.role === 'admin' ? '/admin' : '/complaints'} className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <AlertCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-label">Overdue Issues</span>
                <span className="stat-value">{stats.complaints.overdue}</span>
                <span className="stat-trend" style={{ color: '#ef4444' }}>
                  <Clock size={12} /> Action required
                </span>
              </div>
            </Link>

            <Link to={user?.role === 'admin' ? '/admin' : '/complaints'} className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-label">Resolved Complaints</span>
                <span className="stat-value">{stats.complaints.resolved}</span>
                <span className="stat-trend trend-positive">
                  <TrendingUp size={12} /> Successfully closed
                </span>
              </div>
            </Link>

            <Link to="/notices" className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <AlertCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-label">Important Notices</span>
                <span className="stat-value">{stats.notices.important}</span>
                <span className="stat-trend trend-neutral">
                  <Clock size={12} /> Check notice board
                </span>
              </div>
            </Link>
            
          </div>

          {/* Admin Intelligence Section */}
          {user?.role === 'admin' && (
            <div style={{ marginTop: '2.5rem' }}>
              <OperationsIntelligence />
            </div>
          )}
        </>
      ) : null}

    </DashboardLayout>
  );
};

export default DashboardHomePage;
