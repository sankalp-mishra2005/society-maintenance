import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{
            height: type === 'card' ? '120px' : '48px',
            width: '100%'
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
