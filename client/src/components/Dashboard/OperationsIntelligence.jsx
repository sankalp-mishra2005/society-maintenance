import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BrainCircuit, Activity, AlertOctagon } from 'lucide-react';
import LoadingSkeleton from '../Common/LoadingSkeleton';

const OperationsIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getIntelligenceStats();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton count={1} type="card" />;
  if (error) return <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>Error loading intelligence: {error}</div>;
  if (!data) return null;

  const { sla, hotspots, recurringIssues } = data;

  return (
    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Recurring Issues Layer */}
      <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'var(--bg-card)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d' }}>
          <BrainCircuit size={22} /> Operations Intelligence - Recurring Issues
        </h2>
        
        {recurringIssues.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No significant recurring issues detected.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {recurringIssues.map((issue, idx) => (
              <div key={idx} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>{issue.category} — {issue.block}</span>
                  {issue.priority === 'High' && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>🔥 HIGH</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {issue.count} complaints <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>{issue.percentIncrease}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Recommendation:</strong> {issue.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* 2. SLA Analytics */}
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
            <Activity size={18} /> Society Service Performance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Resolution Time</span>
              <span style={{ fontWeight: 700 }}>{sla.avgResolutionDays} days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overdue Rate</span>
              <span style={{ fontWeight: 700, color: sla.overdueRate > 15 ? '#ef4444' : '#34d399' }}>{sla.overdueRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolution Rate</span>
              <span style={{ fontWeight: 700 }}>{sla.resolutionRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>High Priority SLA</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{sla.highPrioritySlaRate}%</span>
            </div>
          </div>
          
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Avg Resolution by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sla.categorySlaBreakdown.map(cat => (
              <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>{cat.category}</span>
                <span style={{ fontWeight: 600 }}>{cat.avgResolutionDays}d</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Issue Hotspot */}
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
            <AlertOctagon size={18} /> Issue Hotspots
          </h2>
          {hotspots.blocks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active issues to map.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)' }}>Category</th>
                    {hotspots.blocks.map(block => (
                      <th key={block} style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)' }}>{block}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hotspots.categories.map(cat => {
                    const hasIssues = hotspots.blocks.some(block => (hotspots.data[block]?.[cat] || 0) > 0);
                    if (!hasIssues) return null;
                    
                    return (
                      <tr key={cat} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{cat}</td>
                        {hotspots.blocks.map(block => {
                          const count = hotspots.data[block]?.[cat] || 0;
                          let indicator = '🟢';
                          if (count >= 3) indicator = '🔴';
                          else if (count >= 1) indicator = '🟡';
                          
                          return (
                            <td key={block} style={{ textAlign: 'center', padding: '0.5rem' }}>
                              <span title={`${count} active issues`}>{indicator}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsIntelligence;
