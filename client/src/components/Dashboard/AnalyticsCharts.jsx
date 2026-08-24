import React from 'react';

const AnalyticsCharts = ({ statusBreakdown = [], categoryBreakdown = [] }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Status Breakdown Panel */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Complaint Status Distribution
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {statusBreakdown.map((item, index) => {
            let barColor = '#60a5fa';
            if (item.status === 'In Progress') barColor = '#fbbf24';
            if (item.status === 'Resolved') barColor = '#34d399';

            return (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.status}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.count} ({item.percentage}%)</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      background: barColor,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Panel */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Complaints by Category
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {categoryBreakdown.map((item, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.category}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.count}</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${item.percentage}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
