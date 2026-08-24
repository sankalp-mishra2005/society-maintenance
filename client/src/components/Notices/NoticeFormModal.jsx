import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { Pin, Send, Loader2 } from 'lucide-react';

const NoticeFormModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSubmitSuccess({
        title: title.trim(),
        content: content.trim(),
        category,
        isImportant
      });
      setTitle('');
      setContent('');
      setCategory('General');
      setIsImportant(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post New Society Notice">
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Notice Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Water Supply Suspension Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Event">Event</option>
            <option value="Security">Security</option>
            <option value="Financial">Financial</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Notice Content *</label>
          <textarea
            className="form-textarea"
            rows="5"
            placeholder="Write the notice details here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#f87171' }}>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Pin size={16} /> Mark as Important (Pin to Top & Broadcast Email)
            </span>
          </label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginLeft: '1.8rem' }}>
            If checked, this notice will be pinned at the top of the notice board and an email notification will be broadcast to all society residents via Resend.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Broadcasting...
              </>
            ) : (
              <>
                <Send size={16} /> Post Notice
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeFormModal;
