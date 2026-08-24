import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import NoticeFormModal from '../components/Notices/NoticeFormModal';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import EmptyState from '../components/Common/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Megaphone, CheckCircle, CalendarPlus, FileText } from 'lucide-react';
import './NoticeBoardPage.css';

const NoticeBoardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getNotices();
      if (res.success) {
        setNotices(res.data);
      } else {
        setError(res.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async (noticeData) => {
    try {
      const res = await api.createNotice(noticeData);
      if (res.success) {
        addToast(
          noticeData.isImportant
            ? 'Important notice posted & broadcast emails dispatched to residents!'
            : 'Notice posted successfully!',
          'success'
        );
        setIsModalOpen(false);
        fetchNotices();
      } else {
        throw new Error(res.message || 'Failed to post notice');
      }
    } catch (err) {
      addToast(err.message || 'Error deleting notice', 'error');
    }
  };

  const isAdmin = user?.role === 'admin';

  // Separate notices
  const pinnedNotices = notices.filter(n => n.isImportant);
  const regularNotices = notices.filter(n => !n.isImportant);

  // Dynamic Stats Calculation
  const stats = {
    Maintenance: 0,
    Event: 0,
    Security: 0,
    Other: 0
  };

  notices.forEach(n => {
    if (n.category === 'Maintenance') stats.Maintenance++;
    else if (n.category === 'Event') stats.Event++;
    else if (n.category === 'Security') stats.Security++;
    else stats.Other++;
  });

  const totalNoticesForStats = notices.length || 1;
  const maintHeight = `${Math.max((stats.Maintenance / totalNoticesForStats) * 100, 5)}%`;
  const eventHeight = `${Math.max((stats.Event / totalNoticesForStats) * 100, 5)}%`;
  const securityHeight = `${Math.max((stats.Security / totalNoticesForStats) * 100, 5)}%`;
  const otherHeight = `${Math.max((stats.Other / totalNoticesForStats) * 100, 5)}%`;

  const renderNoticeCard = (notice, index) => {
    const formattedTime = new Date(notice.createdAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Pick colors based on category mock mapping (just cycling for visual appeal or matching category string)
    let categoryClass = 'bg-primary-blue text-white';
    let lightClass = 'bg-primary-glow';
    
    if (notice.category === 'Maintenance' || index % 3 === 0) {
      categoryClass = 'bg-maintenance';
      lightClass = 'bg-maintenance-light text-maintenance';
    } else if (notice.category === 'Event' || index % 3 === 1) {
      categoryClass = 'bg-event';
      lightClass = 'bg-event-light text-event';
    } else {
      categoryClass = 'bg-policy';
      lightClass = 'bg-policy-light text-policy';
    }

    return (
      <div key={notice._id} className="notice-card group">
        <div className={`notice-card-accent ${categoryClass}`}></div>
        <div className="notice-card-content">
          <div className="notice-card-header">
            <span className={`notice-category-tag ${lightClass}`}>{notice.category || 'Update'}</span>
            <span className="notice-time">{formattedTime}</span>
          </div>
          <div>
            <h4 className="notice-title group-hover:text-primary-blue">{notice.title}</h4>
            <p className="notice-desc">{notice.content}</p>
          </div>
          <div className="notice-card-actions">
            <div className="notice-action-link">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {notice.category === 'Event' ? 'calendar_add_on' : 'article'}
              </span>
              {notice.category === 'Event' ? 'Add to Calendar' : 'Read Full Policy'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Notice Board">
      <div style={{ padding: 'var(--spacing-lg) var(--spacing-3xl)' }}>
        
        <div className="notice-board-header">
          <h1 className="notice-board-title">Notice Board</h1>
          <div className="notice-board-actions">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter Updates</span>
            
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-primary"
                style={{ marginLeft: '1rem' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                POST NOTICE
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--overdue-bg)', color: 'var(--overdue-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : notices.length === 0 ? (
          <EmptyState 
            title="No Notices" 
            message="There are no announcements to display at this time." 
          />
        ) : (
          <div className="notice-grid-layout">
            <div className="notice-main-column">
              
              {pinnedNotices.map(notice => (
                <div key={notice._id} className="pinned-notice">
                  <div className="pinned-notice-bg"></div>
                  <div className="pinned-notice-content">
                    <div className="pinned-notice-text">
                      <div className="pinned-notice-meta">
                        <span className="material-symbols-outlined pinned-icon">campaign</span>
                        <span className="pinned-tag">Pinned Important</span>
                        <span className="pinned-time">
                          {new Date(notice.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h2 className="pinned-title">{notice.title}</h2>
                      <p className="pinned-desc">{notice.content}</p>
                    </div>
                    <div className="pinned-action">
                      <button className="btn-acknowledge">
                        Acknowledge
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="recent-updates-header">
                <div className="recent-updates-dot"></div>
                <h3 className="recent-updates-title">Recent Updates</h3>
              </div>

              {regularNotices.map((notice, index) => renderNoticeCard(notice, index))}

            </div>

            <div className="notice-side-column">
              {/* Stats Card */}
              <div className="stats-card">
                <h3 className="stats-title">Notices by Category (All Time)</h3>
                <div className="stats-chart" style={{ marginTop: '1rem' }}>
                  <div className="stat-bar-group group">
                    <div className="stat-bar-wrapper" style={{ height: maintHeight, backgroundColor: 'rgba(186, 26, 26, 0.2)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stats.Maintenance}</span>
                    </div>
                    <span className="stat-bar-label">Maint.</span>
                  </div>
                  <div className="stat-bar-group group">
                    <div className="stat-bar-wrapper" style={{ height: eventHeight, backgroundColor: 'rgba(117, 44, 0, 0.2)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stats.Event}</span>
                    </div>
                    <span className="stat-bar-label">Events</span>
                  </div>
                  <div className="stat-bar-group group">
                    <div className="stat-bar-wrapper" style={{ height: securityHeight, backgroundColor: 'var(--primary-blue-hover)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stats.Security}</span>
                    </div>
                    <span className="stat-bar-label">Security</span>
                  </div>
                  <div className="stat-bar-group group">
                    <div className="stat-bar-wrapper" style={{ height: otherHeight, backgroundColor: 'var(--border-glow)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stats.Other}</span>
                    </div>
                    <span className="stat-bar-label">Other</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <NoticeFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateNotice} 
      />
    </DashboardLayout>
  );
};

export default NoticeBoardPage;
