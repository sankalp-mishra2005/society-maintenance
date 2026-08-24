import React from 'react';
import { Search, AlertTriangle } from 'lucide-react';

const AdminFilterBar = ({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  overdueCount = 0,
  onReset
}) => {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="filter-tabs">
          {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setStatusFilter('Overdue')}
            className={`filter-tab filter-tab-overdue ${statusFilter === 'Overdue' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <AlertTriangle size={14} color="#f87171" />
            Overdue ({overdueCount})
          </button>
        </div>

        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
        >
          Reset Filters
        </button>
      </div>

      {/* Advanced Filter Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', width: '100%' }}
            placeholder="Search CMP-ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category */}
        <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Elevator">Elevator</option>
          <option value="Security">Security</option>
          <option value="Cleaning">Cleaning</option>
          <option value="General Maintenance">General Maintenance</option>
          <option value="Other">Other</option>
        </select>

        {/* Priority */}
        <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Date From */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From:</span>
          <input
            type="date"
            className="form-input"
            style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To:</span>
          <input
            type="date"
            className="form-input"
            style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminFilterBar;
