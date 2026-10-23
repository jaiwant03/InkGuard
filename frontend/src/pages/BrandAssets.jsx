import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Upload,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Shield,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check } from 'lucide-react';

const ASSET_CATEGORIES = [
  'Logos',
  'Brand images',
  'Approved banners',
  'Product images',
  'Icons & Badges',
  'Other visual assets',
];

export default function BrandAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Logos');
  const [description, setDescription] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { workspace, isReviewer, isAdmin } = useAuth();
  const toast = useToast();

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await api.brandAssets.list({
        search: search || undefined,
        category: selectedCategory || undefined,
        approvalStatus: selectedStatus || undefined,
      });
      if (res.success) {
        setAssets(res.data);
      }
    } catch (err) {
      toast.error('Failed to load assets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [workspace, search, selectedCategory, selectedStatus]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB maximum limit.');
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.split('.')[0].replace(/[-_]/g, ' '));
      }
      // Create local object URL for preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a file to upload.');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('usageNotes', usageNotes.trim());

      const res = await api.brandAssets.upload(formData);
      if (res.success) {
        toast.success('Asset uploaded to library.');
        setShowUploadModal(false);
        setFile(null);
        setPreviewUrl('');
        setName('');
        setDescription('');
        setUsageNotes('');
        loadAssets();
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStatus = async (asset) => {
    const newStatus = asset.approvalStatus === 'Approved' ? 'Pending Review' : 'Approved';
    try {
      const res = await api.brandAssets.updateStatus(asset._id, newStatus);
      if (res.success) {
        toast.success(res.message);
        loadAssets();
      }
    } catch (err) {
      toast.error('Failed to update asset status: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.brandAssets.delete(deleteConfirm._id);
      toast.success('Asset deleted.');
      setDeleteConfirm(null);
      loadAssets();
    } catch (err) {
      toast.error('Failed to delete asset: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const approvedCount = assets.filter(a => a.approvalStatus === 'Approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Reference UI Hero Showcase Card with 3D Motion */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)',
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr) 280px',
          gap: 'var(--space-6)',
          alignItems: 'center',
        }}
      >
        {/* Left: 3D Corporate Brochure Preview with Moving Motion Effect */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Brand Asset Showcase
          </span>
          <div
            className="ui-seamless-mockup-frame motion-float"
            style={{
              width: '180px',
              height: '140px',
              margin: '0 auto',
            }}
          >
            <img
              src={ASSET_IMAGES.brochureMockup}
              alt="Corporate Brochure 3D"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px' }}>
            <span className="motion-pulse-check" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Corporate Assets v3.2
          </div>
        </div>

        {/* Center: Assets Overview & Reference Asset Previews Strip */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              Media Governance
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {approvedCount} Verified Brand Elements
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Corporate Brand Asset Library
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Curated, legally cleared media files, vector logos, and campaign photography. Unapproved assets trigger automated review flags.
          </p>

          {/* Reference Asset Previews Strip (from Reference Image) */}
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-xl)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Asset Previews</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Usage 1 Jota</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                <Shield size={20} />
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <ImageIcon size={18} />
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={ASSET_IMAGES.brandDocPreview} alt="Doc preview" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={ASSET_IMAGES.governanceShield} alt="Shield mascot" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <FileCheck size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extracted Guidelines & Compliance Badges */}
        <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Extracted Guidelines
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>Logo Usage</span>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>Dolorow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8125rem', color: '#475569' }}>Messaging Tone</span>
            <span style={{ fontSize: '0.6875rem', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>Setew</span>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '10px 0 6px 0' }}>
            Asset Spec Checker
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>300 DPI Vector</span>
            <div className="motion-pulse-check" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            All Brand Assets ({assets.length})
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            High-resolution visual assets available to content creators across your organization.
          </p>
        </div>

        {isReviewer && (
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary btn-sm">
            <Upload size={16} /> Upload Brand Asset
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search assets by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      {assets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <ImageIcon size={44} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3) auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>No Brand Assets Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Upload corporate vector logos, banners, and approved visual graphics.
          </p>
          {isReviewer && (
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
              <Upload size={16} /> Upload Asset
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Asset Preview Frame */}
              <div
                style={{
                  height: '160px',
                  background: 'radial-gradient(circle, #F8FAFC 0%, #E2E8F0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-4)',
                  position: 'relative',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <img
                  src={asset.fileUrl}
                  alt={asset.name}
                  style={{
                    maxWidth: '92%',
                    maxHeight: '92%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 6px 14px rgba(15, 23, 42, 0.08))',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    background: asset.approvalStatus === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                    color: asset.approvalStatus === 'Approved' ? '#047857' : '#B45309',
                    border: `1px solid ${asset.approvalStatus === 'Approved' ? '#A7F3D0' : '#FDE68A'}`,
                  }}
                >
                  {asset.approvalStatus}
                </span>
              </div>

              {/* Asset Info */}
              <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.6875rem', marginBottom: '6px' }}>
                    {asset.category}
                  </span>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {asset.name}
                  </h4>
                  {asset.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {asset.description}
                    </p>
                  )}
                  {asset.usageNotes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'var(--bg-surface-secondary)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                      <strong>Usage:</strong> {asset.usageNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  <span>{formatFileSize(asset.fileSize)}</span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>
                      <ExternalLink size={12} /> View
                    </a>
                    {isReviewer && (
                      <button
                        onClick={() => handleToggleStatus(asset)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.6875rem' }}
                      >
                        {asset.approvalStatus === 'Approved' ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirm(asset)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.6875rem' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Upload Brand Asset
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Accepted formats: SVG, PNG, JPEG, WebP, GIF. Maximum file size: 5MB.
            </p>

            <form onSubmit={handleUpload}>
              {/* File Drop Area */}
              <div
                style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  textAlign: 'center',
                  background: 'var(--bg-surface-secondary)',
                  cursor: 'pointer',
                  marginBottom: 'var(--space-4)',
                }}
                onClick={() => document.getElementById('assetFileInput').click()}
              >
                <input
                  id="assetFileInput"
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{file?.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Click to select a different file</span>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click or drag image file to upload</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PNG, SVG, JPG up to 5MB</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Asset Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Primary Horizontal Shield Wordmark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description of when this asset is applied"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Usage Notes & Restrictions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Do not stretch; minimum clearance 20px"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save to Asset Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--severity-high)', marginBottom: 'var(--space-2)' }}>
              Delete Brand Asset?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
