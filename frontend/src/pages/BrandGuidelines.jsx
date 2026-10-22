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
        {/* Left: 3D Brand Document Preview with Moving Motion Effect */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Brand Guidelines Manual
          </span>
          <div
            className="motion-float"
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 16px 36px -8px rgba(37, 99, 235, 0.28)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              maxHeight: '190px',
            }}
          >
            <img
              src={ASSET_IMAGES.brandDocPreview}
              alt="Brand Guidelines 3D Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px' }}>
            <span className="motion-pulse-check" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Verified Standards v2.4
          </div>
        </div>

        {/* Center: Guidelines Overview & Color Strip */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              Governance Engine
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {rules.filter(r => r.isActive).length} Active Rules Enforced
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Brand Guidelines & Identity Hub
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Centralized source of truth for tone of voice, terminology, color palettes, and accessibility standards across all corporate marketing assets.
          </p>

          {/* Reference Color Palette Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Palette:</span>
            {['#FFFFFF', '#64748B', '#312E81', '#0284C7', '#2563EB', '#0F172A', '#DB2777', '#EA580C'].map((hex, idx) => (
              <span
                key={idx}
                className="color-dot"
                style={{
                  backgroundColor: hex,
                  border: hex === '#FFFFFF' ? '1.5px solid #CBD5E1' : 'none',
                }}
                title={hex}
              />
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0F172A', fontWeight: 700, marginLeft: '4px' }}>
              #0017
            </span>
          </div>
        </div>

        {/* Right: Typography Checker & Guideline Pills */}
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
            Typography Checker
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Lato Bold</span>
            <div className="motion-pulse-check" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Header Bar with Tab Switches */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--bg-surface-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveTab('rules')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'rules' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'rules' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'rules' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            <BookOpen size={15} /> Brand Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'profile' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            <Palette size={15} /> Brand Identity & Specs
          </button>
        </div>

        {activeTab === 'rules' && isReviewer && (
          <button onClick={handleOpenAddRule} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Brand Rule
          </button>
        )}
      </div>

      {/* TAB 1: BRAND RULES LIBRARY */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search rules by title, prohibited terms, or preferred phrasing..."
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
                {RULE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ width: '140px' }}
              >
                <option value="">All Severities</option>
                <option value="High">High</option>
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
              {rules.map((rule) => (
                <div
                  key={rule._id}
                  className="card"
                  style={{
                    padding: 'var(--space-5)',
                    opacity: rule.isActive ? 1 : 0.65,
                    borderLeft: `4px solid ${
                      rule.severity === 'High' ? 'var(--severity-high)' : rule.severity === 'Medium' ? 'var(--severity-medium)' : 'var(--color-primary)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rule.title}
                        </h4>
                        <SeverityBadge severity={rule.severity} />
                        <span className="badge badge-neutral">{rule.category}</span>
                        {!rule.isActive && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                            [Inactive]
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                        {rule.description}
                      </p>

                      {/* Rule Phrasing Details */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: '0.8125rem' }}>
                        {rule.preferredWording && (
                          <div style={{ background: '#ECFDF5', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #A7F3D0' }}>
                            <strong style={{ color: '#065F46' }}>Preferred:</strong> <span style={{ color: '#047857' }}>{rule.preferredWording}</span>
                          </div>
                        )}
                        {rule.prohibitedPhrases && rule.prohibitedPhrases.length > 0 && (
                          <div style={{ background: '#FEF2F2', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #FCA5A5' }}>
                            <strong style={{ color: '#991B1B' }}>Prohibited:</strong>{' '}
                            <span style={{ color: '#B91C1C' }}>{rule.prohibitedPhrases.join(', ')}</span>
                          </div>
                        )}
                        {rule.sourceReference && (
                          <div style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Info size={13} /> Source: {rule.sourceReference}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rule Actions */}
                    {isReviewer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => handleToggleRule(rule._id)}
                          style={{
                            color: rule.isActive ? 'var(--status-success)' : 'var(--text-muted)',
                            padding: '4px',
                            display: 'flex',
                          }}
                          title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                        >
                          {rule.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                        <button
                          onClick={() => handleOpenEditRule(rule)}
                          style={{ color: 'var(--text-secondary)', padding: '6px' }}
                          title="Edit rule"
                        >
                          <Edit2 size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteRuleConfirm(rule)}
                            style={{ color: 'var(--severity-high)', padding: '6px' }}
                            title="Delete rule"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {editingRule ? 'Edit Brand Rule' : 'Create New Brand Rule'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Configure deterministic compliance checks for terminology, tone, and legal disclaimers.
            </p>

            <form onSubmit={handleSaveRule}>
              <div className="form-group">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
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

                <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">Preferred Wording / Suggested Replacement</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Cloud Enterprise"
                  value={ruleFormData.preferredWording}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, preferredWording: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prohibited Phrases (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ACE platform, Apex Ent, 100% hack-proof"
                  value={ruleFormData.prohibitedPhrases}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, prohibitedPhrases: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Phrases (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. registered trademark, SLA terms"
                  value={ruleFormData.requiredPhrases}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, requiredPhrases: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Source Reference / Policy Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Legal Compliance Manual §4.2"
                  value={ruleFormData.sourceReference}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, sourceReference: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRuleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingRule}>
                  {savingRule ? 'Saving Rule...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rule Confirmation Modal */}
      {deleteRuleConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: 'var(--space-6)', maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--severity-high)', marginBottom: 'var(--space-3)' }}>
              <ShieldAlert size={28} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Delete Brand Rule?</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
              Are you sure you want to permanently delete rule <strong>"{deleteRuleConfirm.title}"</strong>? Future content reviews will no longer evaluate against this rule.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteRuleConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteRule}>
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
