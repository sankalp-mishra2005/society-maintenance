import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';
import EmptyState from '../components/Common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Phone, Mail, Home as FlatIcon, Search, UserPlus } from 'lucide-react';
import './DirectoryPage.css';

const DirectoryPage = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers();
        if (res.success) {
          // Filter to show only residents, or keep admins too if desired
          setResidents(res.data.filter(u => u.role === 'resident'));
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to load directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.flatNumber && r.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout title="Resident Directory">
      <div className="dashboard-header">
        <div className="dashboard-title-wrapper">
          <h1 className="dashboard-title">Resident Directory</h1>
          <p className="dashboard-subtitle">Find and connect with your neighbors.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary">
            <UserPlus size={18} />
            ADD RESIDENT
          </button>
        )}
      </div>

      <div className="filter-bar-container">
        <div className="filter-bar">
          <div className="filter-search-wrapper" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              className="filter-search-input" 
              placeholder="Search by name or flat number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <LoadingSkeleton count={4} type="grid" />
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
          {error}
        </div>
      ) : filteredResidents.length === 0 ? (
        <EmptyState 
          title="No Residents Found" 
          message="No residents match your search criteria." 
        />
      ) : (
        <div className="directory-grid">
          {filteredResidents.map(resident => (
            <div key={resident._id} className="directory-card group">
              <div className="directory-card-header">
                <div className="avatar">
                  {resident.name ? resident.name.substring(0, 2).toUpperCase() : 'UR'}
                </div>
                <div className="directory-info">
                  <h3 className="directory-name">{resident.name}</h3>
                  <span className="directory-role">Resident</span>
                </div>
              </div>
              
              <div className="directory-card-body">
                <div className="directory-detail">
                  <FlatIcon size={14} /> 
                  <span>Flat {resident.flatNumber || 'N/A'}</span>
                </div>
                {/* Privacy: only show email/phone if admin */}
                {user?.role === 'admin' && (
                  <>
                    <div className="directory-detail">
                      <Mail size={14} />
                      <span>{resident.email}</span>
                    </div>
                    {resident.phoneNumber && (
                      <div className="directory-detail">
                        <Phone size={14} />
                        <span>{resident.phoneNumber}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DirectoryPage;
