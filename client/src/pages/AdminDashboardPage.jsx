import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ComplaintCard from '../components/Complaints/ComplaintCard';
import ComplaintGridCard from '../components/Complaints/ComplaintGridCard';
import ComplaintDetailModal from '../components/Complaints/ComplaintDetailModal';
import UpdateStatusModal from '../components/Complaints/UpdateStatusModal';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import EmptyState from '../components/Common/EmptyState';
import Modal from '../components/Common/Modal';
import OperationsIntelligence from '../components/Dashboard/OperationsIntelligence';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Download, Plus, Settings, TrendingUp, LayoutGrid, List } from 'lucide-react';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { addToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected complaint for status update modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // New View Mode & Details Modal state
  const [viewMode, setViewMode] = useState('list');
  const [selectedComplaintDetails, setSelectedComplaintDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Settings modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [thresholdDaysInput, setThresholdDaysInput] = useState(3);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setDashboardData(res.data);
        setThresholdDaysInput(res.data.summary.overdueThresholdDays);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getComplaints({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search: searchQuery,
      });

      if (res.success) {
        let filteredData = res.data;
        if (showOverdueOnly) {
          filteredData = filteredData.filter(c => c.isOverdue);
        }
        setComplaints(filteredData);
      } else {
        setError(res.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, showOverdueOnly]);

  useEffect(() => {
    fetchDashboardStats();
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdateStatusClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsUpdateModalOpen(true);
  };

  const handleViewDetailsClick = (complaint) => {
    setSelectedComplaintDetails(complaint);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = async (id, status, note) => {
    const res = await api.updateComplaintStatus(id, status, note);
    if (res.success) {
      addToast(`Status updated to ${status}! Notification email sent to resident.`, 'success');
      fetchDashboardStats();
      fetchComplaints();
    } else {
      throw new Error(res.message || 'Update failed');
    }
  };

  const handlePriorityUpdate = async (id, priority) => {
    try {
      const res = await api.updateComplaintPriority(id, priority);
      if (res.success) {
        addToast(res.message, 'success');
        fetchDashboardStats();
        fetchComplaints();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteComplaint = async (id) => {
    try {
      const res = await api.deleteComplaint(id);
      if (res.success) {
        addToast('Complaint permanently deleted.', 'success');
        fetchDashboardStats();
        fetchComplaints();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const exportToCSV = () => {
    if (complaints.length === 0) {
      addToast('No complaints to export', 'error');
      return;
    }
    
    const headers = ['Complaint Number', 'Title', 'Category', 'Priority', 'Status', 'Health Score', 'Days Open', 'Resident', 'Flat Number', 'Created At'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const c of complaints) {
      const residentName = c.resident ? c.resident.name : 'N/A';
      const flat = c.resident ? c.resident.flatNumber : 'N/A';
      
      const row = [
        c.complaintNumber,
        `"${c.title.replace(/"/g, '""')}"`,
        c.category,
        c.priority,
        c.status,
        c.healthScore || 'N/A',
        c.daysOpen,
        `"${residentName}"`,
        flat,
        new Date(c.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `operations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Report exported successfully!', 'success');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const res = await api.updateSettings(Number(thresholdDaysInput));
      if (res.success) {
        addToast(`Overdue threshold set to ${thresholdDaysInput} days!`, 'success');
        setIsSettingsModalOpen(false);
        fetchDashboardStats();
        fetchComplaints();
      } else {
        addToast(res.message || 'Failed to update settings', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Server error', 'error');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('WARNING: This will inject 40 demo complaints and 2 notices. Do you want to proceed?')) return;
    try {
      addToast('Seeding database... please wait.', 'success');
      const res = await api.seedDatabase();
      if (res.success) {
        addToast(res.message, 'success');
        fetchDashboardStats();
        fetchComplaints();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <DashboardLayout title="Admin Portal">
      <div className="admin-dashboard-container">
        
        {/* Header & Actions */}
        <div className="admin-header">
          <div className="admin-title-group">
            <div className="admin-title-badge">
              <div className="admin-title-icon">
                <span className="material-symbols-outlined">grading</span>
              </div>
              <span className="admin-title-label">Admin Operations</span>
            </div>
            <h1 className="admin-title">Complaints</h1>
          </div>
          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => setIsSettingsModalOpen(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
              SETTINGS
            </button>
            <button className="btn-secondary" onClick={exportToCSV}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              EXPORT REPORT
            </button>
            <button className="btn-primary" onClick={handleSeedDatabase}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>database</span>
              SEED DATA
            </button>
          </div>
        </div>

        {/* KPIs */}
        {dashboardData && (
          <div className="kpi-grid">
            <div className="kpi-card group">
              <div className="kpi-header">
                <div className="kpi-info">
                  <span className="kpi-label">Active Issues</span>
                  <div className="kpi-value-group">
                    <span className="kpi-value">{dashboardData.summary.totalOpen}</span>
                  </div>
                </div>
                <div className="kpi-icon-wrapper">
                  <span className="material-symbols-outlined">dynamic_feed</span>
                </div>
              </div>
              <div className="kpi-chart">
                <svg className="w-full h-full" style={{ stroke: 'var(--primary-blue)', fill: 'none' }} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0,25 C10,25 15,10 25,15 C35,20 40,5 50,10 C60,15 65,25 75,20 C85,15 90,5 100,10" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                  <path style={{ fill: 'rgba(31, 16, 142, 0.1)', stroke: 'none' }} d="M0,25 C10,25 15,10 25,15 C35,20 40,5 50,10 C60,15 65,25 75,20 C85,15 90,5 100,10 L100,30 L0,30 Z"></path>
                </svg>
              </div>
              <div className="kpi-blob"></div>
            </div>

            <div className="kpi-card overdue-kpi">
              <div className="overdue-bg-gradient"></div>
              <div className="kpi-header" style={{ marginBottom: 0, alignItems: 'center', height: '100%' }}>
                <div className="kpi-info">
                  <span className="kpi-label">Overdue SLA</span>
                  <div className="kpi-value-group">
                    <span className="kpi-value">{dashboardData.summary.overdueCount}</span>
                  </div>
                </div>
                <div className="progress-ring-container">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path style={{ stroke: 'rgba(186,26,26,0.2)', fill: 'none' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeWidth="3"></path>
                    <path style={{ stroke: 'var(--overdue-text)', fill: 'none' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray={`${Math.min((dashboardData.summary.overdueCount / Math.max(dashboardData.summary.totalOpen, 1)) * 100, 100)}, 100`} strokeWidth="3"></path>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--overdue-text)' }}>warning</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <div className="kpi-info">
                  <span className="kpi-label">Avg Resolution</span>
                  <div className="kpi-value-group">
                    <span className="kpi-value">{dashboardData.summary.averageResolutionDays}</span>
                    <span className="kpi-subtext">days</span>
                  </div>
                </div>
                <div className="kpi-icon-wrapper secondary">
                  <span className="material-symbols-outlined">timer</span>
                </div>
              </div>
              <div className="h-bar-container">
                <div className="h-bar-labels">
                  <span>Target SLA: &lt; {dashboardData.summary.overdueThresholdDays}d</span>
                </div>
                <div className="h-bar-track">
                  <div className="h-bar-segment-1" style={{ width: `${Math.min((dashboardData.summary.averageResolutionDays / dashboardData.summary.overdueThresholdDays) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operations Intelligence */}
        <OperationsIntelligence dashboardData={dashboardData} />

        {/* Main Workspace Area */}
        <div className="workspace-area">
          <div className="filter-bar-container" style={{ padding: '0 0 var(--spacing-lg) 0' }}>
            <div className="filter-bar">
              <div className="filter-search-wrapper" style={{ maxWidth: '30rem' }}>
                <span className="material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  className="filter-search-input" 
                  placeholder="Search ID, Title, or Resident..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-actions" style={{ flexWrap: 'wrap' }}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="btn-outline"
                  style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
                >
                  <option value="All">Status: All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="btn-outline"
                  style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
                >
                  <option value="All">Category: All</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Security">Security</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="btn-outline"
                  style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
                >
                  <option value="All">Priority: All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button 
                  className={`btn-danger-outline ${showOverdueOnly ? 'active' : ''}`}
                  onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                  style={{ backgroundColor: showOverdueOnly ? 'rgba(186, 26, 26, 0.2)' : '' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>alarm</span>
                  Overdue Only
                </button>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setViewMode('list')}
                    style={{ padding: '0.4rem 0.6rem', background: viewMode === 'list' ? 'var(--primary-blue-hover)' : 'var(--bg-card)', color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    style={{ padding: '0.4rem 0.6rem', background: viewMode === 'grid' ? 'var(--primary-blue-hover)' : 'var(--bg-card)', color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer' }}
                    title="Grid View"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '300px' }}>Complaint ID &amp; Title</th>
                    <th>Resident</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Timeline</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <LoadingSkeleton count={3} type="list" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7">
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
                          {error}
                        </div>
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <EmptyState 
                          title="No Records Found" 
                          message="There are no complaints matching your criteria." 
                        />
                      </td>
                    </tr>
                  ) : (
                    complaints.map(complaint => (
                      <ComplaintCard 
                        key={complaint._id} 
                        complaint={complaint} 
                        isAdmin={true}
                        onUpdateStatus={handleUpdateStatusClick}
                        onViewDetails={handleViewDetailsClick}
                        onDelete={handleDeleteComplaint}
                        onUpdatePriority={handlePriorityUpdate}
                      />
                    ))
                  )}
                </tbody>
              </table>
              <div className="table-pagination">
                <span className="pagination-text">Showing {complaints.length} records</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {loading ? (
                <LoadingSkeleton count={3} type="grid" />
              ) : error ? (
                <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
                  {error}
                </div>
              ) : complaints.length === 0 ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState title="No Records Found" message="No complaints match your criteria." />
                </div>
              ) : (
                complaints.map(complaint => (
                  <ComplaintGridCard 
                    key={complaint._id} 
                    complaint={complaint} 
                    isAdmin={true}
                    onUpdateStatus={handleUpdateStatusClick}
                    onViewDetails={handleViewDetailsClick}
                    onDelete={handleDeleteComplaint}
                    onUpdatePriority={handlePriorityUpdate}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {isUpdateModalOpen && selectedComplaint && (
        <UpdateStatusModal
          complaint={selectedComplaint}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {/* SLA Settings Modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="System Settings">
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          <div style={{ background: 'var(--primary-glow)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              <Settings size={16} /> Service Level Agreement (SLA)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Configure the threshold for when complaints are marked as "Overdue". When a complaint exceeds this age, it will trigger critical health scores, highlight in red, and alert admins to take immediate action.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="threshold">SLA Threshold (Days)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                id="threshold"
                type="number"
                min="1"
                max="30"
                className="form-input"
                value={thresholdDaysInput}
                onChange={(e) => setThresholdDaysInput(e.target.value)}
                required
                style={{ width: '120px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Days before overdue</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isUpdatingSettings}
              style={{ padding: '0.5rem 1rem' }}
            >
              {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Modal>

      <ComplaintDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        complaint={selectedComplaintDetails}
        isAdmin={true}
      />
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
