import React from 'react';
import Modal from '../Common/Modal';
import StatusBadge from '../Common/StatusBadge';
import PriorityBadge from '../Common/PriorityBadge';
import StatusHistoryTimeline from './StatusHistoryTimeline';
import { Calendar, User, AlignLeft, Tag, Activity, FileImage } from 'lucide-react';

const ComplaintDetailModal = ({ isOpen, onClose, complaint, isAdmin }) => {
  if (!complaint) return null;

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedUpdateDate = new Date(complaint.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint ${complaint.complaintNumber}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header Section */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {complaint.title}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={complaint.status} isOverdue={complaint.isOverdue} daysOverdue={complaint.daysOverdue} />
            <PriorityBadge priority={complaint.priority} />
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)',
              background: 'var(--bg-input)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}>
              <Tag size={14} /> {complaint.category}
            </span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} /> Created
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formattedDate}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={14} /> Last Updated
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formattedUpdateDate}</span>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> Resident
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {complaint.resident?.name} (Flat {complaint.resident?.flatNumber})
              </span>
            </div>
          )}

        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlignLeft size={14} /> Description
          </span>
          <div style={{ 
            padding: '1rem', 
            background: 'var(--bg-input)', 
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {complaint.description}
          </div>
        </div>

        {/* Photo Attachment (if exists) */}
        {complaint.photoUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileImage size={14} /> Attached Photo
            </span>
            <div style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              maxWidth: '100%',
              maxHeight: '300px',
              display: 'flex',
              justifyContent: 'center',
              background: '#000'
            }}>
              <img 
                src={complaint.photoUrl} 
                alt="Complaint attachment" 
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {/* Status History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            Activity Timeline
          </span>
          <StatusHistoryTimeline history={complaint.statusHistory} />
        </div>

      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
