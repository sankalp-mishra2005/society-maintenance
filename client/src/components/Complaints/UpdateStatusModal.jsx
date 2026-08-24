import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { Lock, Loader2 } from 'lucide-react';

const UpdateStatusModal = ({ isOpen, onClose, complaint, onStatusUpdate, onPriorityUpdate }) => {
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Medium');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const complaintId = complaint?._id;
  const complaintStatus = complaint?.status;
  const complaintPriority = complaint?.priority;

  useEffect(() => {
    if (complaintId) {
      setStatus(complaintStatus === 'Open' ? 'In Progress' : complaintStatus);
      setPriority(complaintPriority || 'Medium');
      setNote('');
      setErrorMessage('');
    }
  }, [complaintId, complaintStatus, complaintPriority]);

  if (!complaint) return null;

  const isResolved = complaint.status === 'Resolved';

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (isResolved) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onStatusUpdate(complaint._id, status, note);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrioritySubmit = async () => {
    if (isResolved) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onPriorityUpdate(complaint._id, priority);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update priority.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Complaint: ${complaint.complaintNumber}`}>
      <div>
        {isResolved ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock size={20} />
            <div>
              <strong>Complaint Permanently Closed</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                This complaint was marked as Resolved on {new Date(complaint.resolvedAt || complaint.updatedAt).toLocaleDateString()}. No further changes can be made.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStatusSubmit}>
            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {errorMessage}
              </div>
            )}

            <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Title:</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{complaint.title}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved (Close Complaint)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Update Priority</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="form-select" style={{ flex: 1 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button type="button" onClick={handlePrioritySubmit} className="btn btn-secondary" disabled={isSubmitting}>
                  Set Priority
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Update Note *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Technician assigned and parts ordered. Work expected to complete by 4 PM."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Note will be recorded in the complaint audit trail and emailed to the resident.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  'Update Status & Send Email'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default UpdateStatusModal;
