import React from 'react';
import { Clock, User, ShieldCheck } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const StatusHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No status history recorded.</p>;
  }

  // Reverse so newest history entries appear at the top
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="timeline">
      {sortedHistory.map((item, index) => {
        let nodeClass = 'node-open';
        let statusColor = '#60a5fa';
        if (item.status === 'In Progress') {
          nodeClass = 'node-progress';
          statusColor = '#fbbf24';
        } else if (item.status === 'Resolved') {
          nodeClass = 'node-resolved';
          statusColor = '#34d399';
        }

        return (
          <div key={index} className="timeline-item">
            <div className={`timeline-node ${nodeClass}`} />
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status" style={{ color: statusColor }}>
                  ● {item.status.toUpperCase()}
                </span>
                <span className="timeline-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={12} />
                  {formatDate(item.timestamp)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: item.changedByRole === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                  color: item.changedByRole === 'admin' ? '#60a5fa' : '#cbd5e1',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {item.changedByRole === 'admin' ? <ShieldCheck size={10} /> : <User size={10} />}
                  {item.changedByRole === 'admin' ? 'Admin' : 'Resident'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.changedByName}
                </span>
              </div>

              {item.note && (
                <div className="timeline-note">
                  "{item.note}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusHistoryTimeline;
