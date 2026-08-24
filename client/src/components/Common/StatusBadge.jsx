import React from 'react';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status, isOverdue, daysOverdue }) => {
  if (isOverdue && status !== 'Resolved') {
    return (
      <span className="badge badge-overdue">
        <AlertTriangle size={12} />
        Overdue ({daysOverdue}d)
      </span>
    );
  }

  switch (status) {
    case 'Open':
      return (
        <span className="badge badge-open">
          <AlertCircle size={12} />
          Open
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-progress">
          <Clock size={12} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-resolved">
          <CheckCircle size={12} />
          Resolved
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};

export default StatusBadge;
