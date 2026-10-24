import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Copy,
  Palette,
  Type,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';
import { Check } from 'lucide-react';

const RULE_CATEGORIES = [
  'Tone of voice',
  'Terminology',
  'Messaging',
  'Product naming',
  'Promotional claims',
  'Approved facts',
  'Visual identity',
  'Accessibility',
  'Required disclaimers',
];

export default function BrandGuidelines() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'profile'
  const [rules, setRules] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleFormData, setRuleFormData] = useState({
    title: '',
    description: '',
    category: 'Tone of voice',
    severity: 'Medium',
    preferredWording: '',
    prohibitedPhrases: '',
    requiredPhrases: '',
    correctExamples: '',
    incorrectExamples: '',
    sourceReference: '',
    isActive: true,
  });
  const [savingRule, setSavingRule] = useState(false);
  const [deleteRuleConfirm, setDeleteRuleConfirm] = useState(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const { workspace, isAdmin, isReviewer } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, profileRes] = await Promise.all([
        api.brandRules.list({
          search: search || undefined,
          category: selectedCategory || undefined,
          severity: selectedSeverity || undefined,
        }),
        api.brandProfile.get(),
      ]);

      if (rulesRes.success) setRules(rulesRes.data);
      if (profileRes.success) {
        setProfile(profileRes.data);
        setProfileForm(profileRes.data);
      }
    } catch (err) {
      toast.error('Failed to load brand guidelines: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspace, search, selectedCategory, selectedSeverity]);

  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleFormData({
      title: '',
      description: '',
      category: 'Terminology',
      severity: 'Medium',
      preferredWording: '',
      prohibitedPhrases: '',
      requiredPhrases: '',
      correctExamples: '',
      incorrectExamples: '',
      sourceReference: '',
      isActive: true,
    });
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setRuleFormData({
      title: rule.title,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      preferredWording: rule.preferredWording || '',
      prohibitedPhrases: (rule.prohibitedPhrases || []).join(', '),
      requiredPhrases: (rule.requiredPhrases || []).join(', '),
      correctExamples: (rule.correctExamples || []).join('\n'),
      incorrectExamples: (rule.incorrectExamples || []).join('\n'),
      sourceReference: rule.sourceReference || '',
      isActive: rule.isActive,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      setSavingRule(true);
      const payload = {
        title: ruleFormData.title.trim(),
        description: ruleFormData.description.trim(),
        category: ruleFormData.category,
        severity: ruleFormData.severity,
        preferredWording: ruleFormData.preferredWording.trim(),
        prohibitedPhrases: ruleFormData.prohibitedPhrases
          ? ruleFormData.prohibitedPhrases.split(',').map((p) => p.trim()).filter(Boolean)
          : [],
        requiredPhrases: ruleFormData.requiredPhrases
          ? ruleFormData.requiredPhrases.split(',').map((p) => p.trim()).filter(Boolean)
          : [],
        correctExamples: ruleFormData.correctExamples
          ? ruleFormData.correctExamples.split('\n').map((e) => e.trim()).filter(Boolean)
          : [],
        incorrectExamples: ruleFormData.incorrectExamples
          ? ruleFormData.incorrectExamples.split('\n').map((e) => e.trim()).filter(Boolean)
          : [],
        sourceReference: ruleFormData.sourceReference.trim(),
        isActive: ruleFormData.isActive,
      };

      if (editingRule) {
        await api.brandRules.update(editingRule._id, payload);
        toast.success('Rule updated successfully.');
      } else {
        const res = await api.brandRules.create(payload);
        toast.success('Brand rule created.');
        if (res.conflictWarning) {
          toast.info(res.conflictWarning);
        }
      }

      setShowRuleModal(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save rule: ' + err.message);
    } finally {
      setSavingRule(false);
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      const res = await api.brandRules.toggle(ruleId);
      if (res.success) {
        toast.info(res.message);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to toggle rule: ' + err.message);
    }
  };

  const handleDeleteRule = async () => {
    if (!deleteRuleConfirm) return;
    try {
      await api.brandRules.delete(deleteRuleConfirm._id);
      toast.success('Rule removed from guidelines.');
      setDeleteRuleConfirm(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete rule: ' + err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.brandProfile.update(profileForm);
      toast.success('Brand identity profile updated.');
      loadData();
    } catch (err) {
      toast.error('Failed to update brand profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}: ${text}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Clean Modern Page Header Banner */}
      <div className="page-header-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            className="ui-integrated-graphic motion-mascot"
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <img
              src={ASSET_IMAGES.brandDocPreview}
              alt="Brand Guidelines"
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
                <BookOpen size={12} color="#7C3AED" />
                Governance Standards
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {rules.filter((r) => r.isActive).length} Active Rules Enforced
              </span>
            </div>

            <h1 className="text-gradient-primary" style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0 }}>
              Brand Guidelines & Identity Hub
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
              Centralized corporate rules for tone of voice, terminology, color palettes, and accessibility.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <button
              onClick={() => setActiveTab('rules')}
              className={`segmented-option ${activeTab === 'rules' ? 'active' : ''}`}
            >
              <BookOpen size={15} />
              <span>Brand Rules ({rules.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`segmented-option ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Palette size={15} />
              <span>Identity Specs</span>
            </button>
          </div>

          {activeTab === 'rules' && isReviewer && (
            <button onClick={handleOpenAddRule} className="btn btn-gradient-primary btn-sm">
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Brand Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: BRAND RULES LIBRARY */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Unified Search & Filters Toolbar */}
          <div className="facts-toolbar">
            <div className="facts-toolbar-search">
              <Search size={16} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search rules by title, prohibited terms, or preferred phrasing..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">All Categories</option>
                {RULE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">All Severities</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Rules Grid / List */}
          {rules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <BookOpen size={44} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-3) auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>No Brand Rules Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                {search || selectedCategory || selectedSeverity
                  ? 'No rules match your active search filters. Try clearing criteria.'
                  : 'Start by creating your first corporate brand guideline rule.'}
              </p>
              {isReviewer && (
                <button onClick={handleOpenAddRule} className="btn btn-primary">
                  <Plus size={16} /> Create Brand Rule
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {rules.map((rule) => {
                const sevKey = (rule.severity || 'medium').toLowerCase();
                return (
                  <div
                    key={rule._id}
                    className="rule-card"
                    style={{ opacity: rule.isActive ? 1 : 0.65 }}
                  >
                    <div className={`rule-accent-stripe ${sevKey}`} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '1.025rem', fontWeight: 750, color: 'var(--text-primary)', margin: 0 }}>
                            {rule.title}
                          </h4>
                          <SeverityBadge severity={rule.severity} />
                          <span className="badge badge-neutral">{rule.category}</span>
                          {!rule.isActive && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                              Inactive
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.55 }}>
                          {rule.description}
                        </p>

                        {/* Rule Phrasing Details */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '0.8125rem' }}>
                          {rule.preferredWording && (
                            <div className="pill-badge-preferred">
                              <Check size={13} strokeWidth={2.5} />
                              <strong>Preferred:</strong>
                              <span>{rule.preferredWording}</span>
                            </div>
                          )}
                          {rule.prohibitedPhrases && rule.prohibitedPhrases.length > 0 && (
                            <div className="pill-badge-prohibited">
                              <X size={13} strokeWidth={2.5} />
                              <strong>Prohibited:</strong>
                              <span>{rule.prohibitedPhrases.join(', ')}</span>
                            </div>
                          )}
                          {rule.sourceReference && (
                            <div style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', marginLeft: '4px' }}>
                              <Info size={13} /> Source: {rule.sourceReference}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unified Action Button Group */}
                      {isReviewer && (
                        <div className="action-btn-group">
                          <button
                            onClick={() => handleToggleRule(rule._id)}
                            className={`action-icon-btn ${rule.isActive ? 'active-toggle' : ''}`}
                            title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                          >
                            {rule.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleOpenEditRule(rule)}
                            className="action-icon-btn"
                            title="Edit rule"
                          >
                            <Edit2 size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteRuleConfirm(rule)}
                              className="action-icon-btn danger"
                              title="Delete rule"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRAND IDENTITY PROFILE */}
      {activeTab === 'profile' && profileForm && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Brand Core Overview */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Brand Core Positioning</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  disabled={!isReviewer}
                  value={profileForm.brandName || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isReviewer}
                  value={profileForm.tagline || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Brand Voice & Preferred Tone</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={!isReviewer}
                value={profileForm.preferredTone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, preferredTone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience & Buyer Persona</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={!isReviewer}
                value={profileForm.targetAudience || ''}
                onChange={(e) => setProfileForm({ ...profileForm, targetAudience: e.target.value })}
              />
            </div>
          </div>

          {/* Brand Colors Palette with Reference 2x5 Color Dot Matrix */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div>
                <h3 className="card-title">Brand Color Palette</h3>
                <p className="card-subtitle">
                  Official brand colors verified for primary, secondary, and neutral components.
                </p>
              </div>
              {/* Reference 2x5 Dot Matrix Indicator */}
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Quick Dot Matrix:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {[
                    { hex: '#0E7490', checked: false },
                    { hex: '#2563EB', checked: true },
                    { hex: '#7C3AED', checked: false },
                    { hex: '#DC2626', checked: false },
                    { hex: '#D97706', checked: false },
                    { hex: '#06B6D4', checked: false },
                    { hex: '#6366F1', checked: true },
                    { hex: '#9333EA', checked: false },
                    { hex: '#F43F5E', checked: false },
                    { hex: '#EAB308', checked: false },
                  ].map((dot, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: dot.hex,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title={dot.hex}
                    >
                      {dot.checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {(profileForm.brandColors || []).map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <div style={{ height: '70px', background: color.hex, width: '100%' }} />
                  <div style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{color.name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>{color.role}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {color.hex}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(color.hex, color.name)}
                        style={{ color: 'var(--color-primary)', padding: '2px' }}
                        title="Copy Hex"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography System */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Typography Specifications</h3>
            <p className="card-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
              Typefaces, hierarchy, and usage standards across digital surfaces.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              {(profileForm.typography || []).map((type, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{type.role} Font</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>{type.family}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    Weights: {type.weight}
                  </div>
                  <div
                    style={{
                      fontFamily: type.family,
                      fontSize: type.role === 'Heading' ? '1.25rem' : '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '8px',
                    }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isReviewer && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving Changes...' : 'Save Brand Identity Specs'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* Add / Edit Rule Modal */}
      {showRuleModal && (
        <div className="modal-overlay" onClick={() => setShowRuleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      border: '1px solid #DBEAFE',
                    }}
                  >
                    <BookOpen size={11} color="#2563EB" />
                    Governance Policy
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    Deterministic Engine
                  </span>
                </div>

                <h3 className="modal-title text-gradient-primary">
                  {editingRule ? 'Edit Brand Rule' : 'Create New Brand Rule'}
                </h3>
                <p className="modal-subtitle">
                  Configure deterministic compliance checks for terminology, tone, and legal disclaimers.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowRuleModal(false)}
                title="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRule} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rule Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Standardize Enterprise Product Naming"
                    value={ruleFormData.title}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={ruleFormData.category}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, category: e.target.value })}
                    >
                      {RULE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Severity Level *</label>
                    <select
                      className="form-select"
                      value={ruleFormData.severity}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    >
                      <option value="High">High (Legal/Brand Risk)</option>
                      <option value="Medium">Medium (Terminology/Tone)</option>
                      <option value="Low">Low (Accessibility/Style)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rule Explanation / Instruction *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    required
                    placeholder="Why does this rule exist? What standard should creators adhere to?"
                    value={ruleFormData.description}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Preferred Wording / Suggested Replacement</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apex Cloud Enterprise"
                    value={ruleFormData.preferredWording}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, preferredWording: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={13} color="#DC2626" />
                    <span>Prohibited Phrases (Comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ACE platform, Apex Ent, 100% hack-proof"
                    value={ruleFormData.prohibitedPhrases}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, prohibitedPhrases: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Required Phrases (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. registered trademark, SLA terms"
                    value={ruleFormData.requiredPhrases}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, requiredPhrases: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Source Reference / Policy Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Legal Compliance Manual §4.2"
                    value={ruleFormData.sourceReference}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, sourceReference: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRuleModal(false)}
                  style={{ borderRadius: '10px', padding: '8px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gradient-primary btn-sm"
                  disabled={savingRule}
                  style={{ borderRadius: '10px', padding: '8px 20px' }}
                >
                  {savingRule ? 'Saving Rule...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rule Confirmation Modal */}
      {deleteRuleConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteRuleConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
                <ShieldAlert size={22} />
                <h3 className="modal-title" style={{ fontSize: '1.125rem' }}>Delete Brand Rule?</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeleteRuleConfirm(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete rule <strong>"{deleteRuleConfirm.title}"</strong>? Future content reviews will no longer evaluate against this rule.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteRuleConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteRule}>
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
