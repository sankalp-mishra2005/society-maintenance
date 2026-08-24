import React from 'react';
import StatusBadge from '../Common/StatusBadge';
import PriorityBadge from '../Common/PriorityBadge';
import { Eye, Edit, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const ComplaintGridCard = ({ complaint, onUpdateStatus, onViewDetails, isAdmin = false }) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const isCritical = complaint.healthScore === 'Critical';

  return (
    <div 
      className={`card ${isCritical ? 'card-critical' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem', cursor: 'pointer', position: 'relative' }}
      onClick={() => onViewDetails(complaint)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {complaint.complaintNumber}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {formattedDate}
          </span>
        </div>
        <StatusBadge status={complaint.status} isOverdue={complaint.isOverdue} daysOverdue={complaint.daysOverdue} />
      </div>

      {/* Photo Thumbnail */}
      {complaint.photoUrl && (
        <div style={{ marginBottom: '1rem', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
          <img src={complaint.photoUrl} alt="Complaint Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '0.7rem' }}>
            <ImageIcon size={12} /> Photo
          </div>
        </div>
      )}

      {/* Title & Category */}
      <div style={{ flex: 1, marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          {complaint.title}
          {complaint.isOverdue && (
            <AlertTriangle size={16} color="var(--overdue-text)" title={`Overdue by ${complaint.daysOverdue} days`} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
          {complaint.category}
        </span>
      </div>

      {/* Admin Specific: Resident Info */}
      {isAdmin && complaint.resident && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--primary-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
            {complaint.resident.name ? complaint.resident.name.substring(0, 2).toUpperCase() : 'UR'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{complaint.resident.name || 'Unknown Resident'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flat {complaint.resident.flatNumber || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <PriorityBadge priority={complaint.priority} />
        
        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          {isAdmin && (
            <button className="icon-button" title="Update Status" onClick={() => onUpdateStatus(complaint)}>
              <Edit size={16} />
            </button>
          )}
          <button className="icon-button" title="View Details" onClick={() => onViewDetails(complaint)}>
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintGridCard;
