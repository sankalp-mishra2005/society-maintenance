import React from 'react';
import StatusBadge from '../Common/StatusBadge';
import PriorityBadge from '../Common/PriorityBadge';
import { Eye, Edit, AlertTriangle } from 'lucide-react';

const ComplaintCard = ({ complaint, onUpdateStatus, onDelete, onUpdatePriority, isAdmin = false }) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  
  const formattedUpdateDate = new Date(complaint.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const isCritical = complaint.healthScore === 'Critical';

  // For Admin view, we combine ID & Title into one cell, and add a Resident cell.
  if (isAdmin) {
    const residentName = complaint.resident?.name || 'Unknown Resident';
    const flatNumber = complaint.resident?.flatNumber || 'N/A';
    const residentInitials = residentName.substring(0, 2).toUpperCase();
    
    return (
      <tr className={`hover:bg-surface-container-low transition-colors group relative ${isCritical ? 'bg-error/5 hover:bg-error/10' : ''}`}>
        <td className="py-sm px-md relative">
          {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ backgroundColor: 'var(--overdue-text)', width: '4px' }}></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{complaint.complaintNumber}</span>
            <span style={{ maxWidth: '300px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>{complaint.title}</span>
          </div>
        </td>

        <td className="py-sm px-md">
          <div className="resident-info">
            <div className="resident-avatar">
              {residentInitials}
            </div>
            <div className="resident-details">
              <span className="resident-name">{residentName}</span>
              <span className="resident-flat">Flat {flatNumber}</span>
            </div>
          </div>
        </td>

        <td className="py-sm px-md">
          <div className="flex items-center gap-xs text-on-surface-variant">
            {complaint.category}
          </div>
        </td>

        <td className="py-sm px-md">
          <PriorityBadge priority={complaint.priority} />
        </td>

        <td className="py-sm px-md">
          <StatusBadge status={complaint.status} isOverdue={complaint.isOverdue} daysOverdue={complaint.daysOverdue} />
        </td>

        <td className="py-sm px-md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{formattedDate}</span>
            {complaint.daysOpen > 0 ? (
              <span style={{ fontSize: '0.75rem', fontWeight: complaint.isOverdue ? 700 : 400, color: complaint.isOverdue ? 'var(--error, #ba1a1a)' : 'var(--text-secondary)' }}>
                {complaint.daysOpen} {complaint.daysOpen === 1 ? 'day' : 'days'} open
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today</span>
            )}
          </div>
        </td>

        <td className="py-sm px-md text-right">
          <div className="flex items-center justify-end gap-xs">
            <button className="icon-button" title="Update Status" onClick={() => onUpdateStatus(complaint)}>
              <Edit size={18} />
            </button>
            <button className="icon-button" title="View Details">
              <Eye size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Resident view
  return (
    <tr className={isCritical ? "critical-row" : ""}>
      <td style={{ fontWeight: 500 }}>
        {complaint.complaintNumber}
      </td>
      <td className="cell-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {complaint.title}
          {complaint.isOverdue && (
            <AlertTriangle size={14} color="var(--overdue-text)" title={`Overdue by ${complaint.daysOverdue} days`} />
          )}
        </div>
      </td>
      <td style={{ color: 'var(--text-secondary)' }}>
        {complaint.category}
      </td>
      <td>
        <PriorityBadge priority={complaint.priority} />
      </td>
      <td>
        <StatusBadge status={complaint.status} />
      </td>
      <td>
        <div>{formattedDate}</div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Updated: {formattedUpdateDate}
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="icon-button" title="View Details">
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

export default ComplaintCard;
