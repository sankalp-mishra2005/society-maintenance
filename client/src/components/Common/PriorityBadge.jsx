import React from 'react';

const PriorityBadge = ({ priority }) => {
  const p = priority || 'Medium';
  const className = `priority-badge priority-${p.toLowerCase()}`;
  return <span className={className}>{p} Priority</span>;
};

export default PriorityBadge;
