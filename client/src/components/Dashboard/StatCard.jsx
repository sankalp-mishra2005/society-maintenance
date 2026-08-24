import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#3b82f6', isOverdue = false }) => {
  return (
    <div className={`stat-card ${isOverdue && value > 0 ? 'stat-card-overdue' : ''}`} style={{
      borderLeft: `4px solid ${color}`,
      background: isOverdue && value > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)'
    }}>
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-val" style={{ color: isOverdue && value > 0 ? '#f87171' : 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
