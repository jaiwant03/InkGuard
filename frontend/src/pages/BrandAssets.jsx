import React, { useState, useEffect } from 'react';
import {
  Palette,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
  FileImage,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

const ASSET_CATEGORIES = [
  'All',
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Logos');
  const [description, setDescription] = useState('');
  const [usageNotes, setUsageNotes] = useState('Use exclusively on white or dark surfaces with standard minimum clearance padding.');
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [selectedFile, setSelectedFile] = useState(null);

  const { workspace, isReviewer } = useAuth();
  const toast = useToast();

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await api.brandAssets.list(params);
      if (res.success) {
        setAssets(res.data);
      }
    } catch (err) {
      toast.error('Failed to load brand assets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [workspace, selectedCategory, search]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image file to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('usageNotes', usageNotes.trim());
      formData.append('approvalStatus', approvalStatus);

      const res = await api.brandAssets.upload(formData);
      if (res.success) {
        toast.success(`Uploaded brand asset "${res.data.name}"!`);
        setShowUploadModal(false);
        setName('');
        setDescription('');
        setSelectedFile(null);
        loadAssets();
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, assetName) => {
    if (!window.confirm(`Are you sure you want to delete brand asset "${assetName}"?`)) return;
    try {
      const res = await api.brandAssets.delete(id);
      if (res.success) {
        toast.success('Asset deleted.');
        loadAssets();
      }
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    toast.success('Asset URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.brandDocPreview}
              alt="Brand Assets Repository"
              className="ui-seamless-image"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: '#F5F3FF',
                  color: '#7C3AED',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  border: '1px solid #DDD6FE',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Palette size={12} color="#7C3AED" />
                Brand Assets Repository
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {assets.length} Visual Assets Enforced
              </span>
            </div>

            <h1 className="text-gradient-primary" style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0 }}>
              Approved Brand Assets
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Maintain high-resolution vector logos, approved banners, and marketing photography with strict clearance guidelines and usage restrictions.
            </p>
          </div>
        </div>

        {/* Action Controls & Top Right Upload Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-reload-action"
            onClick={loadAssets}
            disabled={loading}
            title="Reload brand assets"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          </button>

          {isReviewer && (
            <button
              type="button"
              className="btn-upload-brand-asset"
              onClick={() => setShowUploadModal(true)}
            >
              <span className="upload-icon-badge">
                <Plus size={14} strokeWidth={2.8} />
              </span>
              <span>Upload Brand Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Filter and Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
          {ASSET_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 550,
                  cursor: 'pointer',
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid #E2E8F0',
                  background: isActive ? 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            style={{
              paddingLeft: '36px',
              paddingRight: search ? '32px' : '12px',
              height: '38px',
              fontSize: '0.8125rem',
              borderRadius: '12px',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <RefreshCw size={36} color="#7C3AED" className="spin-icon" style={{ margin: '0 auto 12px auto' }} />
          <div style={{ fontWeight: 600, color: '#0F172A' }}>Loading approved assets...</div>
        </div>
      ) : assets.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {assets.map((asset) => (
            <div
              key={asset._id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Asset Preview Frame */}
              <div
                style={{
                  height: '180px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: '16px',
                }}
              >
                <img
                  src={getAssetUrl(asset.fileUrl)}
                  alt={asset.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.8125rem' }}>
                  <FileImage size={24} /> <span>Preview not available</span>
                </div>

                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background:
                        asset.approvalStatus === 'Approved' ? '#ECFDF5' : asset.approvalStatus === 'Pending Review' ? '#FFFBEB' : '#F1F5F9',
                      color:
                        asset.approvalStatus === 'Approved' ? '#059669' : asset.approvalStatus === 'Pending Review' ? '#D97706' : '#64748B',
                      border: `1px solid ${
                        asset.approvalStatus === 'Approved' ? '#A7F3D0' : asset.approvalStatus === 'Pending Review' ? '#FDE68A' : '#CBD5E1'
                      }`,
                    }}
                  >
                    {asset.approvalStatus}
                  </span>
                </div>
              </div>

              {/* Asset Details */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {asset.name}
                    </h3>
                    <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                      {formatFileSize(asset.fileSize)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    {asset.category} • {asset.fileType}
                  </div>
                </div>

                {asset.description && (
                  <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {asset.description}
                  </p>
                )}

                {/* Usage Notes Notice */}
                {asset.usageNotes && (
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      color: '#92400E',
                      lineHeight: 1.35,
                    }}
                  >
                    <strong>Clearance:</strong> {asset.usageNotes}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(getAssetUrl(asset.fileUrl), asset._id)}
                    className="top-nav-btn"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', padding: '4px 8px' }}
                  >
                    {copiedId === asset._id ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copiedId === asset._id ? 'Copied Link' : 'Copy URL'}</span>
                  </button>

                  {isReviewer && (
                    <button
                      type="button"
                      onClick={() => handleDelete(asset._id, asset.name)}
                      className="top-nav-btn"
                      style={{ color: '#EF4444', padding: '4px 8px' }}
                      title="Delete asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="brand-empty-canvas">
          <div
            className="brand-empty-canvas-emblem"
            style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              borderColor: '#DDD6FE',
              boxShadow: '0 12px 28px -6px rgba(124, 58, 237, 0.22)',
            }}
          >
            <Palette size={34} color="#7C3AED" strokeWidth={2.3} />
          </div>

          <h3 className="brand-empty-title">
            {search || selectedCategory !== 'All'
              ? 'No Brand Assets Match Your Filter'
              : 'Your Brand Asset Library is Empty'}
          </h3>

          <p className="brand-empty-subtitle">
            {search || selectedCategory !== 'All'
              ? 'No brand media found under the active filter. Try resetting search criteria or selecting "All".'
              : 'Store and govern official brand logos, typography sheets, UI banners, and certified vector illustrations. Content reviewers verify that published designs strictly use these authentic assets.'}
          </p>

          <div className="brand-empty-actions">
            {search || selectedCategory !== 'All' ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="btn btn-primary"
                style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 700 }}
              >
                <span>Reset Asset Filters</span>
              </button>
            ) : (
              isReviewer && (
                <button
                  type="button"
                  className="btn btn-gradient-primary"
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    padding: '12px 26px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.38)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={16} />
                  <span>Upload First Brand Asset</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-tile icon-tile-purple">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Upload Approved Brand Asset</h3>
                  <p className="modal-desc">Add a verified visual asset to the workspace library</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Asset Image File (Max 5MB) *</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      if (!name) setName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                    }
                  }}
                  required
                  className="form-input"
                  style={{ padding: '8px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Asset Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Primary Color Logo (Horizontal)"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {ASSET_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Approval Status</label>
                  <select className="form-select" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}>
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Clearance & Usage Notes</label>
                <input
                  type="text"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  placeholder="e.g. Use on white background with 24px padding."
                  className="form-input"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '8px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gradient-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save to Asset Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
