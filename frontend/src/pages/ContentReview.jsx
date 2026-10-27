import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Sparkles,
  Save,
  Upload,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Check,
  FileCode,
  Image as ImageIcon,
  X,
  FileQuestion,
  RefreshCw,
  Globe,
  Share2,
  Megaphone,
  Mail,
  Package,
  ChevronDown,
} from 'lucide-react';
import { api, getAssetUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

const CONTENT_TYPE_CONFIG = {
  'Website copy': {
    label: 'Website copy',
    icon: Globe,
    desc: 'Landing pages, hero banners, and web product copy',
    badge: 'Digital',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  'Social media post': {
    label: 'Social media post',
    icon: Share2,
    desc: 'LinkedIn, Twitter/X updates, and public threads',
    badge: 'Social',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  'Advertisement': {
    label: 'Advertisement',
    icon: Megaphone,
    desc: 'Paid display banners, search ads, and slogans',
    badge: 'Paid Ads',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  'Email campaign': {
    label: 'Email campaign',
    icon: Mail,
    desc: 'Product newsletters and direct customer emails',
    badge: 'Outbound',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  'Product description': {
    label: 'Product description',
    icon: Package,
    desc: 'Feature specifications, store blurbs, and docs',
    badge: 'Catalog',
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  'General marketing text': {
    label: 'General marketing text',
    icon: FileText,
    desc: 'Press announcements, blog posts, and articles',
    badge: 'Editorial',
    color: '#64748B',
    bg: '#F8FAFC',
  },
};

const CONTENT_TYPES = Object.keys(CONTENT_TYPE_CONFIG);

const VIOLATION_SAMPLE = `Introducing the new ACE platform for high-scale enterprise workloads!

Our cloud architecture is 100% guaranteed to be hack-proof, with zero-risk migration for any legacy cluster. If your engineers experience any difficulties, they can simply contact our helpdesk.

To explore all architecture diagrams and benchmarks, click here. Over 1,200 enterprise organizations use Apex Cloud solutions worldwide.`;

const COMPLIANT_SAMPLE = `Apex Cloud Enterprise delivers resilient distributed architecture for mission-critical workloads.

Our systems are engineered for 99.99% high availability and multi-region failover. If your engineering leads have any questions, our dedicated Client Success Team is available 24/7.

Explore our architectural whitepaper and benchmark studies. Apex Cloud is a registered trademark of Apex Solutions, Inc.`;

export default function ContentReview() {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Website copy');
  const [contentTypeOpen, setContentTypeOpen] = useState(false);
  const contentTypeRef = useRef(null);
  const [content, setContent] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [activeRules, setActiveRules] = useState([]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (contentTypeRef.current && !contentTypeRef.current.contains(e.target)) {
        setContentTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Multi-format upload & visual metadata states
  const [extracting, setExtracting] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAltText, setImageAltText] = useState('');

  const { workspace } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRules() {
      try {
        const rulesRes = await api.brandRules.list({ isActive: true });
        if (rulesRes.success) setActiveRules(rulesRes.data);
      } catch (err) {
        // silent load
      }
    }
    loadRules();
  }, [workspace]);

  // Handle multi-format upload via backend extraction endpoint (TXT, MD, PDF, DOCX, Images)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    try {
      setExtracting(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.drafts.extractText(formData);

      if (res.isImage) {
        setImageUrl(res.data.fileUrl);
        setUploadedFileInfo({
          fileName: res.data.fileName,
          format: 'Image Asset (' + (file.name.split('.').pop() || 'IMG').toUpperCase() + ')',
          fileSize: res.data.fileSize,
        });
        if (!title) {
          setTitle(res.data.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        toast.success('Uploaded image asset. Enter alt text below for accessibility validation.');
      } else {
        setContent(res.data.text || '');
        setUploadedFileInfo({
          fileName: res.data.fileName,
          format: res.data.format,
          wordCount: res.data.wordCount,
          fileSize: res.data.fileSize,
        });
        if (!title) {
          setTitle(res.data.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        toast.success(res.message || `Extracted text from ${res.data.fileName}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to extract text from document.');
    } finally {
      setExtracting(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || (!content.trim() && !imageUrl)) {
      toast.error('Please provide a title and either content text or an attached visual asset.');
      return;
    }
    try {
      setSavingDraft(true);
      const res = await api.drafts.create({
        title: title.trim(),
        contentType,
        content: content.trim() || 'Visual asset draft with metadata.',
        imageUrl,
        imageAltText,
        originalFileName: uploadedFileInfo?.fileName || '',
        originalFileFormat: uploadedFileInfo?.format || '',
      });
      if (res.success) {
        toast.success('Draft saved successfully.');
        navigate(`/review/${res.data._id}`);
      }
    } catch (err) {
      toast.error('Failed to save draft: ' + err.message);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRunAudit = async () => {
    if (!title.trim() || (!content.trim() && !imageUrl)) {
      toast.error('Please enter content or attach an image before running the brand audit.');
      return;
    }

    try {
      setAuditing(true);
      const draftRes = await api.drafts.create({
        title: title.trim(),
        contentType,
        content: content.trim() || 'Visual asset draft with metadata.',
        imageUrl,
        imageAltText,
        originalFileName: uploadedFileInfo?.fileName || '',
        originalFileFormat: uploadedFileInfo?.format || '',
      });

      if (!draftRes.success) throw new Error(draftRes.message);
      const draftId = draftRes.data._id;

      const auditRes = await api.drafts.review(draftId);
      if (auditRes.success) {
        toast.success(`Audit Complete! Compliance Score: ${auditRes.data.scoreResult.score}%`);
        navigate(`/review/${draftId}`);
      }
    } catch (err) {
      toast.error('Brand Audit failed: ' + err.message);
    } finally {
      setAuditing(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const activeConfig = CONTENT_TYPE_CONFIG[contentType] || CONTENT_TYPE_CONFIG['Website copy'];
  const ActiveIcon = activeConfig.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '100%' }}>
      {/* Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.brandDocPreview}
              alt="Content Review Studio"
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
                  background: '#FFF1F2',
                  color: '#E11D48',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  border: '1px solid #FFE4E6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <FileCheck2 size={12} color="#E11D48" />
                Pre-Publication Gatekeeper
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Explainable Review Studio
              </span>
            </div>

            <h1 className="text-gradient-primary" style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0 }}>
              Submit Content for Review
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Submit marketing copy, social posts, PDFs, or DOCX documents to audit tone, terminology, claims, and accessibility before public distribution.
            </p>
          </div>
        </div>

        {/* Modern Quick-Fill Preset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setTitle('New ACE Platform Launch (Contains Brand Violations)');
              setContentType('Website copy');
              setContent(VIOLATION_SAMPLE);
              setImageUrl('');
              setUploadedFileInfo(null);
            }}
            className="preset-pill-btn"
            style={{
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFBEB 100%)',
              border: '1px solid #FECDD3',
              color: '#9F1239',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.08)',
            }}
            title="Loads unvetted copy with prohibited claims and terms"
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFE4E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={12} color="#E11D48" />
            </span>
            <span>Load Sample with Violations</span>
            <span
              style={{
                fontSize: '0.6875rem',
                background: '#FDA4AF',
                color: '#881337',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              Test AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTitle('High-Scale Cloud Overview (Compliant Sample)');
              setContentType('Website copy');
              setContent(COMPLIANT_SAMPLE);
              setImageUrl('');
              setUploadedFileInfo(null);
            }}
            className="preset-pill-btn"
            style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
            }}
            title="Loads compliant enterprise copy"
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={12} color="#059669" />
            </span>
            <span>Compliant Enterprise Sample</span>
            <span
              style={{
                fontSize: '0.6875rem',
                background: '#6EE7B7',
                color: '#064E3B',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              Pass
            </span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' }}>
        {/* Left Main Pane: Editor */}
        <div className="card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          {/* Form Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 1.2fr)', gap: '20px', marginBottom: '22px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0F172A', marginBottom: '6px' }}>
                Content Title *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q4 Cloud Product Launch Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  padding: '0 16px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                }}
              />
            </div>

            {/* Custom Modern Content Type Option Dropdown */}
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={contentTypeRef}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0F172A', marginBottom: '6px' }}>
                Content Type *
              </label>
              <button
                type="button"
                onClick={() => setContentTypeOpen(!contentTypeOpen)}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: contentTypeOpen ? '1.5px solid #2563EB' : '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: contentTypeOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s ease',
                }}
                aria-haspopup="listbox"
                aria-expanded={contentTypeOpen}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: activeConfig.bg,
                      color: activeConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ActiveIcon size={16} strokeWidth={2.4} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 650, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contentType}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  color="#64748B"
                  style={{
                    transform: contentTypeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Floating Custom Dropdown List */}
              {contentTypeOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 20px 40px -6px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0,0,0,0.02)',
                    padding: '6px',
                    zIndex: 120,
                    maxHeight: '360px',
                    overflowY: 'auto',
                  }}
                  role="listbox"
                >
                  {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => {
                    const isSelected = contentType === key;
                    const ItemIcon = config.icon;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setContentType(key);
                          setContentTypeOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: isSelected ? '#EFF6FF' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          marginBottom: '2px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: config.bg,
                              color: config.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ItemIcon size={16} strokeWidth={2.3} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: isSelected ? 750 : 600, color: isSelected ? '#2563EB' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {config.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {config.desc}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check size={16} color="#2563EB" strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: '8px' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Uploaded File Extraction Banner */}
          {uploadedFileInfo && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#16A34A" />
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#166534' }}>
                    {uploadedFileInfo.fileName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#15803D', marginLeft: '8px' }}>
                    ({uploadedFileInfo.format} • {uploadedFileInfo.wordCount ? `${uploadedFileInfo.wordCount} words` : `${Math.round(uploadedFileInfo.fileSize / 1024)} KB`})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFileInfo(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Attached Visual Asset Card (if image uploaded) */}
          {imageUrl && (
            <div
              style={{
                marginBottom: '16px',
                padding: '14px',
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="#7C3AED" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#581C87' }}>
                    Attached Visual Asset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImageAltText('');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED' }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px', alignItems: 'center' }}>
                <div
                  style={{
                    height: '80px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img src={getAssetUrl(imageUrl)} alt="Thumbnail preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                    Image Alternative Text (Accessibility WCAG Check) *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    placeholder="e.g. Apex Cloud high availability architecture diagram"
                    style={{ fontSize: '0.8125rem', height: '36px' }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: '#6B21A8', marginTop: '2px', display: 'block' }}>
                    Descriptive alt text is audited against screen reader accessibility guidelines.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Text Input Area */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Content Text / Copy *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {wordCount} words • {charCount} chars
                </span>
                <label
                  style={{
                    fontSize: '0.75rem',
                    color: extracting ? 'var(--text-tertiary)' : 'var(--color-primary)',
                    cursor: extracting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  {extracting ? (
                    <>
                      <RefreshCw size={13} className="spin-icon" /> Extracting Document...
                    </>
                  ) : (
                    <>
                      <Upload size={13} /> Upload File (.txt, .md, .pdf, .docx, Image)
                    </>
                  )}
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={extracting}
                  />
                </label>
              </div>
            </div>

            <textarea
              className="form-textarea"
              rows={14}
              placeholder="Paste or write your marketing text, announcement, ad copy, or social update here, or upload a PDF/DOCX above..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                padding: 'var(--space-4)',
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Deterministic checks will evaluate across {activeRules.length} active workspace brand rules.
            </span>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={savingDraft || auditing || extracting}
                onClick={handleSaveDraft}
                style={{ padding: '10px 20px', borderRadius: '12px' }}
              >
                <Save size={16} /> Save as Draft
              </button>

              <button
                type="button"
                className="btn btn-gradient-primary btn-lg"
                disabled={auditing || savingDraft || extracting}
                onClick={handleRunAudit}
                style={{ minWidth: '190px', padding: '10px 24px', borderRadius: '12px' }}
              >
                {auditing ? (
                  <>
                    <Sparkles size={16} className="spinner" /> Analyzing Brand Standards...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={18} /> Run Brand Audit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Policy Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Policy Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Shield size={18} color="#2563EB" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Active Governance Rules
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Content is checked against {activeRules.length} active rules tailored for <strong>{workspace?.name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {activeRules.map((rule) => (
                <div
                  key={rule._id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                      {rule.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background:
                          rule.severity === 'High' ? '#FEE2E2' : rule.severity === 'Medium' ? '#FEF3C7' : '#EFF6FF',
                        color:
                          rule.severity === 'High' ? '#DC2626' : rule.severity === 'Medium' ? '#D97706' : '#2563EB',
                      }}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.3 }}>
                    {rule.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Formats Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileCode size={18} color="#7C3AED" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Supported Document Formats
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#10B981" />
                <span><strong>PDF Documents:</strong> Server-side text extraction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#10B981" />
                <span><strong>Word (.docx):</strong> Structured XML text extraction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#10B981" />
                <span><strong>Markdown & Plain Text:</strong> UTF-8 parsing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#10B981" />
                <span><strong>Visual Assets (PNG/JPG/SVG):</strong> Visual brand check</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
