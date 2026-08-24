import React from 'react';
import { Pin, Calendar, User, Trash2 } from 'lucide-react';

const NoticeCard = ({ notice, onDelete, isAdmin = false }) => {
  const formattedDate = new Date(notice.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className="card"
      style={{
        borderLeft: notice.isImportant ? '4px solid #ef4444' : '1px solid var(--border-color)',
        background: notice.isImportant ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)',
        marginBottom: '1rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {notice.isImportant && (
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Pin size={12} /> IMPORTANT PINNED
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#0f172a', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
            {notice.category}
          </span>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete && onDelete(notice._id)}
            className="btn-close"
            style={{ color: '#f87171' }}
            title="Delete Notice"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {notice.title}
      </h3>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {notice.content}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} /> {formattedDate}
        </span>
        {notice.createdBy && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <User size={13} /> Posted by {notice.createdBy.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default NoticeCard;
