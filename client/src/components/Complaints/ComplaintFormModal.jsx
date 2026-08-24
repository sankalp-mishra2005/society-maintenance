import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { Upload, AlertCircle, FileText, Bookmark, List, Zap } from 'lucide-react';

const ComplaintFormModal = ({ isOpen, onClose, onSubmitSuccess, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Plumbing');
      setPriority(initialData.priority || 'Medium');
      setDescription(initialData.description || '');
      setPhotoPreview(initialData.photoUrl || null);
    } else {
      setTitle('');
      setCategory('Plumbing');
      setPriority('Medium');
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, [initialData, isOpen]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files (JPG, PNG, WEBP) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Photo file size must be less than 5MB.');
        return;
      }
      setErrorMessage('');
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('description', description.trim());
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await onSubmitSuccess(formData);
      
      // Reset form
      setTitle('');
      setCategory('Plumbing');
      setPriority('Medium');
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview(null);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Request" : "Log New Request"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errorMessage && (
          <div style={{ background: 'rgba(186, 26, 26, 0.1)', color: 'var(--overdue-text)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Bookmark size={14} /> Title / Short Summary *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="E.g. Leaking pipe under kitchen sink"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <List size={14} /> Category *
            </label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={14} /> Priority Level *
            </label>
            <select
              className="form-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low - Normal Maintenance</option>
              <option value="Medium">Medium - Affects daily routine</option>
              <option value="High">High - Urgent / Safety issue</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={14} /> Detailed Description *
          </label>
          <textarea
            className="form-input"
            placeholder="Please provide any relevant details that will help our maintenance team..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Attach Photo (Optional)</label>
          {photoPreview ? (
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={removePhoto}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-card-hover)', cursor: 'pointer' }} onClick={() => document.getElementById('photo-upload').click()}>
              <Upload size={24} color="var(--text-secondary)" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Click to upload an image</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>JPG, PNG, WEBP up to 5MB</p>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn-outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : (initialData ? 'Update Request' : 'Submit Request')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintFormModal;
