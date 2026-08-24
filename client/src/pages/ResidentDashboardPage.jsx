import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ComplaintCard from '../components/Complaints/ComplaintCard';
import ComplaintGridCard from '../components/Complaints/ComplaintGridCard';
import ComplaintDetailModal from '../components/Complaints/ComplaintDetailModal';
import ComplaintFormModal from '../components/Complaints/ComplaintFormModal';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import EmptyState from '../components/Common/EmptyState';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Filter, ArrowDownUp, LayoutGrid, List } from 'lucide-react';
import './ResidentDashboardPage.css';

const ResidentDashboardPage = () => {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // View Mode & Details Modal state
  const [viewMode, setViewMode] = useState('list');
  const [selectedComplaintDetails, setSelectedComplaintDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetailsClick = (complaint) => {
    setSelectedComplaintDetails(complaint);
    setIsDetailsModalOpen(true);
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getComplaints({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success) {
        setComplaints(res.data);
      } else {
        setError(res.message || 'Failed to fetch complaints.');
      }
    } catch (err) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleCreateComplaint = async (complaintData) => {
    try {
      const res = await api.createComplaint(complaintData);
      if (res.success) {
        addToast('Complaint submitted successfully', 'success');
        setIsModalOpen(false);
        fetchComplaints();
      } else {
        addToast(res.message || 'Failed to submit complaint', 'error');
      }
    } catch (err) {
      addToast('An error occurred', 'error');
    }
  };

  return (
    <DashboardLayout title="Resident Portal">
      <div className="dashboard-header">
        <div className="dashboard-title-wrapper">
          <h1 className="dashboard-title">My Complaints</h1>
          <p className="dashboard-subtitle">Track and manage your maintenance and administrative requests.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          NEW COMPLAINT
        </button>
      </div>

      <div className="filter-bar-container">
        <div className="filter-bar">
          <div className="filter-search-wrapper">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              className="filter-search-input" 
              placeholder="Search complaints by ID or Title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="btn-outline"
              style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button className="btn-outline">
              <ArrowDownUp size={16} />
              SORT
            </button>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginLeft: '0.5rem' }}>
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

      <div className="table-container">
        {viewMode === 'list' ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
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
                        title="No Complaints Found" 
                        message="You haven't submitted any complaints yet or none match your search." 
                        actionText="Raise a Complaint"
                        onAction={() => setIsModalOpen(true)}
                      />
                    </td>
                  </tr>
                ) : (
                  complaints.map(complaint => (
                    <ComplaintCard 
                      key={complaint._id} 
                      complaint={complaint} 
                      isAdmin={false}
                      onViewDetails={handleViewDetailsClick}
                    />
                  ))
                )}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-text">Showing {complaints.length} complaints</span>
              <div className="pagination-controls">
                <button className="page-btn" disabled><span className="material-symbols-outlined">chevron_left</span></button>
                <button className="page-btn active">1</button>
                <button className="page-btn"><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
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
                <EmptyState 
                  title="No Complaints Found" 
                  message="You haven't submitted any complaints yet or none match your search." 
                  actionText="Raise a Complaint"
                  onAction={() => setIsModalOpen(true)}
                />
              </div>
            ) : (
              complaints.map(complaint => (
                <ComplaintGridCard 
                  key={complaint._id} 
                  complaint={complaint} 
                  isAdmin={false}
                  onViewDetails={handleViewDetailsClick}
                />
              ))
            )}
          </div>
        )}
      </div>

      <ComplaintFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateComplaint}
      />
      
      <ComplaintDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        complaint={selectedComplaintDetails}
        isAdmin={false}
      />
    </DashboardLayout>
  );
};

export default ResidentDashboardPage;
