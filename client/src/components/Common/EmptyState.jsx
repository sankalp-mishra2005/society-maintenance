import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" />
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
