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
  Shield,
  ShieldCheck,
  FileCheck,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { SeverityBadge } from '../components/Badges';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ASSET_IMAGES } from '../assets/images';

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

const STANDARD_RULES_TEMPLATE = [
  {
    title: 'Prohibit Absolute & Hack-Proof Security Claims',
    category: 'Promotional claims',
    severity: 'High',
    description: 'Avoid definitive absolute guarantees that cannot be legally or technically defended.',
    preferredWording: 'Engineered for high availability, enterprise-grade resilience, and defense-in-depth protection.',
    prohibitedPhrases: ['100% hack-proof', 'zero-risk', 'foolproof', 'guaranteed ROI', '100% secure', 'unhackable'],
    correctExamples: ['Our platform delivers 99.99% high availability and multi-region failover protection.'],
    incorrectExamples: ['Our cloud platform is 100% hack-proof and completely zero-risk.'],
    sourceReference: 'Corporate Legal & Marketing Governance Policy §4.2',
    isActive: true,
  },
  {
    title: 'Authoritative, Clear, and Empathetic Tone',
    category: 'Tone of voice',
    severity: 'Medium',
    description: 'Maintain an expert yet approachable tone. Guide users with clarity without condescension.',
    preferredWording: 'Our dedicated Client Success Team is available to assist you.',
    prohibitedPhrases: ['obviously', 'simply contact', 'as any beginner knows', 'just click'],
    correctExamples: ['Follow our step-by-step setup guide or reach out to client support.'],
    incorrectExamples: ['Obviously, anyone can simply configure the cluster.'],
    sourceReference: 'Brand Voice & Tone Guide 2026',
    isActive: true,
  },
  {
    title: 'Official Product Nomenclature & Trademarks',
    category: 'Product naming',
    severity: 'High',
    description: 'Ensure official brand and product names are spelled and capitalized accurately.',
    preferredWording: 'INKGUARD Brand Governance Platform',
    prohibitedPhrases: ['Inkguard', 'ink guard', 'Ink Guard platform', 'ink-guard app'],
    correctExamples: ['INKGUARD provides explainable brand compliance checks.'],
    incorrectExamples: ['Use ink guard to verify your documents.'],
    sourceReference: 'Trademark Usage Guidelines §2',
    isActive: true,
  },
  {
    title: 'WCAG AA Accessibility & Alt Text Requirements',
    category: 'Accessibility',
    severity: 'High',
    description: 'All visual graphics and banners must include meaningful descriptive alt text for screen readers.',
    preferredWording: 'Detailed diagram illustrating multi-region failover architecture.',
    prohibitedPhrases: ['image', 'photo', 'graphic', 'banner', 'click here for image'],
    correctExamples: ['Architectural diagram showing primary and secondary data failover routes.'],
    incorrectExamples: ['image of cloud'],
    sourceReference: 'Web Content Accessibility Guidelines (WCAG 2.1 AA)',
    isActive: true,
  },
  {
    title: 'Corporate Terminology & Jargon Elimination',
    category: 'Terminology',
    severity: 'Medium',
    description: 'Eliminate clichéd buzzwords and replace them with precise enterprise terminology.',
    preferredWording: 'Next-generation distributed architecture',
    prohibitedPhrases: ['synergy', 'game-changing paradigm', 'disruptive secret sauce', 'growth hack'],
    correctExamples: ['Accelerate digital transformation with automated brand auditing.'],
    incorrectExamples: ['Our disruptive secret sauce delivers unmatched corporate synergy.'],
    sourceReference: 'Editorial Standards Manual §6',
    isActive: true,
  },
  {
    title: 'Approved Data Citations & Benchmark Claims',
    category: 'Approved facts',
    severity: 'High',
    description: 'Statistical performance or adoption metrics must cite officially approved benchmarks.',
    preferredWording: 'Over 1,200 enterprise organizations rely on our governance platform.',
    prohibitedPhrases: ['millions of users', 'every company uses us', 'number one in the world without proof'],
    correctExamples: ['Verified benchmark data shows a 45% reduction in compliance review cycles.'],
    incorrectExamples: ['We are overwhelmingly the number one platform in the universe.'],
    sourceReference: 'Product Benchmark Report Q4 2025',
    isActive: true,
  },
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
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const { workspace, isAdmin, isReviewer } = useAuth();
  const toast = useToast();

  const handleLoadStarterTemplate = async () => {
    try {
      setLoadingTemplate(true);
      toast.info('Seeding standard corporate brand governance rules...');
      let added = 0;
      for (const rule of STANDARD_RULES_TEMPLATE) {
        try {
          await api.brandRules.create(rule);
          added++;
        } catch (e) {
          // If conflict warning or existing, keep going
        }
      }
      toast.success(`Loaded ${added} standard corporate brand rules!`);
      await loadData();
    } catch (err) {
      toast.error('Could not load template rules: ' + (err.message || 'Request failed'));
    } finally {
      setLoadingTemplate(false);
    }
  };

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
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
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

              {(search || selectedCategory || selectedSeverity) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('');
                    setSelectedSeverity('');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#64748B',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Rules Grid or Spacious Empty Canvas */}
          {loading ? (
            <div className="brand-empty-canvas" style={{ padding: '64px 24px' }}>
              <div className="brand-empty-canvas-emblem">
                <Sparkles size={34} color="#4F46E5" className="motion-spin-slow" />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Loading Governance Policies...
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                Synchronizing workspace guidelines and active compliance rules.
              </p>
            </div>
          ) : rules.length === 0 ? (
            <div className="brand-empty-canvas">
              <div className="brand-empty-canvas-emblem">
                <BookOpen size={34} color="#4F46E5" strokeWidth={2.3} />
              </div>

              <h3 className="brand-empty-title">
                {search || selectedCategory || selectedSeverity
                  ? 'No Matching Brand Rules Found'
                  : 'Your Brand Rules Library is Empty'}
              </h3>

              <p className="brand-empty-subtitle">
                {search || selectedCategory || selectedSeverity
                  ? 'No guidelines match your active search filters. Try clearing criteria to view all corporate policies.'
                  : 'Establish automated governance guardrails for your brand. Rules power InkGuard’s AI engine to catch unapproved claims, tone deviations, and accessibility gaps before publishing.'}
              </p>

              <div className="brand-empty-actions">
                {search || selectedCategory || selectedSeverity ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setSelectedSeverity('');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 700 }}
                  >
                    <RotateCcw size={16} />
                    <span>Clear Search & Filters</span>
                  </button>
                ) : (
                  <>
                    {isReviewer && (
                      <button
                        type="button"
                        onClick={handleLoadStarterTemplate}
                        disabled={loadingTemplate}
                        className="btn btn-gradient-primary"
                        style={{
                          padding: '12px 24px',
                          borderRadius: '14px',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.38)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Sparkles size={16} />
                        <span>
                          {loadingTemplate ? 'Loading Recommended Rules...' : 'Load Recommended Rules (1-Click)'}
                        </span>
                      </button>
                    )}

                    {isReviewer && (
                      <button
                        type="button"
                        onClick={handleOpenAddRule}
                        className="btn"
                        style={{
                          padding: '12px 22px',
                          borderRadius: '14px',
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          background: '#FFFFFF',
                          border: '1.5px solid #CBD5E1',
                          color: '#0F172A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} />
                        <span>Create Custom Rule</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* 3 Core Pillars Feature Highlights */}
              {!search && !selectedCategory && !selectedSeverity && (
                <div className="brand-empty-features-grid">
                  <div className="brand-empty-feature-card">
                    <div className="brand-empty-feature-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                      <ShieldCheck size={18} strokeWidth={2.4} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                        Tone & Voice Standards
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                        Maintain authoritative, empathetic communication and eliminate corporate clichés.
                      </div>
                    </div>
                  </div>

                  <div className="brand-empty-feature-card">
                    <div className="brand-empty-feature-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                      <XCircle size={18} strokeWidth={2.4} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                        Prohibited Phrases
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                        Block unverified guarantees, absolute security assertions, and liability traps.
                      </div>
                    </div>
                  </div>

                  <div className="brand-empty-feature-card">
                    <div className="brand-empty-feature-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                      <CheckCircle2 size={18} strokeWidth={2.4} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                        Product Nomenclature
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
                        Enforce official trademarks, capitalization, and preferred corporate terminology.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
                gap: '24px',
              }}
            >
              {rules.map((rule) => {
                const sevKey = (rule.severity || 'medium').toLowerCase();
                const dotColorClass = sevKey === 'high' ? 'red' : sevKey === 'medium' ? 'amber' : 'blue';

                return (
                  <div
                    key={rule._id}
                    className="rule-card-modern"
                    style={{ opacity: rule.isActive ? 1 : 0.65 }}
                  >
                    {/* Sleek Top Accent Line */}
                    <div className={`rule-top-accent ${sevKey}`} />

                    <div className="rule-card-inner">
                      <div>
                        {/* Header Row: Category & Severity Badges on Left, Modern Switch & Controls on Right */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            marginBottom: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="rule-category-pill">
                              {rule.category}
                            </span>
                            <span className={`severity-pill-modern ${sevKey}`}>
                              <span className={`status-dot ${dotColorClass}`} />
                              <span>{rule.severity} Risk</span>
                            </span>
                            {!rule.isActive && (
                              <span className="status-badge-paused">
                                Paused
                              </span>
                            )}
                          </div>

                          {/* Action Controls */}
                          {isReviewer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Modern iOS/Linear style toggle switch */}
                              <button
                                type="button"
                                onClick={() => handleToggleRule(rule._id)}
                                className={`modern-switch-btn ${rule.isActive ? 'active' : ''}`}
                                title={rule.isActive ? 'Deactivate rule enforcement' : 'Activate rule enforcement'}
                                aria-label="Toggle rule enforcement"
                              >
                                <span className="modern-switch-thumb" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditRule(rule)}
                                className="ghost-action-btn"
                                title="Edit rule"
                              >
                                <Edit2 size={13} />
                              </button>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteRuleConfirm(rule)}
                                  className="ghost-action-btn danger"
                                  title="Delete rule"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Rule Title */}
                        <h4
                          style={{
                            fontSize: '1.0625rem',
                            fontWeight: 750,
                            color: '#0F172A',
                            margin: '0 0 6px 0',
                            lineHeight: 1.4,
                            letterSpacing: '-0.015em',
                          }}
                        >
                          {rule.title}
                        </h4>

                        {/* Rule Description */}
                        <p
                          style={{
                            fontSize: '0.84375rem',
                            color: '#64748B',
                            margin: '0 0 14px 0',
                            lineHeight: 1.55,
                          }}
                        >
                          {rule.description}
                        </p>

                        {/* Modern Phrasing Guidance Studio */}
                        <div className="phrasing-studio">
                          {/* Recommended / Preferred Wording */}
                          {rule.preferredWording && (
                            <div className="guidance-panel do">
                              <div className="guidance-panel-header">
                                <span className="guidance-badge do">
                                  <CheckCircle2 size={13} strokeWidth={2.5} />
                                  Preferred Wording
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(rule.preferredWording, 'preferred wording')}
                                  className="copy-mini-btn"
                                  title="Copy approved phrasing"
                                >
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <p className="guidance-quote">
                                "{rule.preferredWording}"
                              </p>
                            </div>
                          )}

                          {/* Prohibited Phrases */}
                          {rule.prohibitedPhrases && rule.prohibitedPhrases.length > 0 && (
                            <div className="guidance-panel dont">
                              <div className="guidance-panel-header">
                                <span className="guidance-badge dont">
                                  <XCircle size={13} strokeWidth={2.5} />
                                  Prohibited Phrases
                                </span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#991B1B' }}>
                                  {rule.prohibitedPhrases.length} restricted
                                </span>
                              </div>
                              <div className="prohibited-chips-wrap">
                                {rule.prohibitedPhrases.map((phrase, pIdx) => (
                                  <span key={pIdx} className="prohibited-chip">
                                    <span className="prohibited-chip-x">✕</span>
                                    <span>{phrase}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mandatory / Required Phrases */}
                          {rule.requiredPhrases && rule.requiredPhrases.length > 0 && (
                            <div className="guidance-panel mandatory">
                              <div className="guidance-panel-header">
                                <span className="guidance-badge mandatory">
                                  <ShieldCheck size={13} strokeWidth={2.5} />
                                  Required Phrasing
                                </span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1D4ED8' }}>
                                  Mandatory
                                </span>
                              </div>
                              <div className="required-chips-wrap">
                                {rule.requiredPhrases.map((phrase, rIdx) => (
                                  <span key={rIdx} className="required-chip">
                                    <Check size={11} strokeWidth={3} />
                                    <span>{phrase}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="rule-footer-bar">
                        <div className="rule-footer-source">
                          <BookOpen size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Policy Ref: <strong>{rule.sourceReference || 'Standard Corporate Governance Policy'}</strong>
                          </span>
                        </div>

                        {rule.isActive ? (
                          <span className="status-badge-enforced">
                            <span className="status-dot green" />
                            Live Enforced
                          </span>
                        ) : (
                          <span className="status-badge-paused">
                            Paused
                          </span>
                        )}
                      </div>
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
          <div className="modal-content" style={{ maxWidth: '740px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #DBEAFE',
                    color: '#2563EB',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div className="modal-header-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '1px 8px',
                        borderRadius: '999px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: '1px solid #DBEAFE',
                      }}
                    >
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
                </div>
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
                {/* Rule Title */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rule Title <span style={{ color: '#EF4444' }}>*</span></span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>Clear standard name</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Standardize Enterprise Product Naming"
                    value={ruleFormData.title}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, title: e.target.value })}
                  />
                </div>

                {/* Category & Severity in 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
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
                    <label className="form-label">
                      Severity Level <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={ruleFormData.severity}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    >
                      <option value="High">🔴 High (Legal/Brand Risk)</option>
                      <option value="Medium">🟡 Medium (Terminology/Tone)</option>
                      <option value="Low">🔵 Low (Accessibility/Style)</option>
                    </select>
                  </div>
                </div>

                {/* Rule Explanation */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rule Explanation / Instruction <span style={{ color: '#EF4444' }}>*</span></span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>Instruction creators must follow</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    required
                    placeholder="Why does this rule exist? What standard should creators adhere to?"
                    value={ruleFormData.description}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  />
                </div>

                {/* Visual Distinction: Preferred vs Prohibited Side by Side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8125rem', fontWeight: 700, color: '#166534' }}>
                        <CheckCircle2 size={14} color="#16A34A" />
                        Preferred Wording
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '1px 7px', borderRadius: '5px' }}>
                        Recommended
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ background: '#FFFFFF', borderColor: '#86EFAC', fontSize: '0.8125rem', padding: '0.55rem 0.8rem' }}
                      placeholder="e.g. Apex Cloud Enterprise"
                      value={ruleFormData.preferredWording}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, preferredWording: e.target.value })}
                    />
                  </div>

                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8125rem', fontWeight: 700, color: '#991B1B' }}>
                        <XCircle size={14} color="#DC2626" />
                        Prohibited Phrases
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#FEE2E2', color: '#B91C1C', padding: '1px 7px', borderRadius: '5px' }}>
                        Blocked
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ background: '#FFFFFF', borderColor: '#FCA5A5', fontSize: '0.8125rem', padding: '0.55rem 0.8rem' }}
                      placeholder="e.g. ACE platform, 100% hack-proof"
                      value={ruleFormData.prohibitedPhrases}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, prohibitedPhrases: e.target.value })}
                    />
                  </div>
                </div>

                {/* Required Phrases & Source Reference (2 columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCheck size={14} color="#2563EB" />
                      <span>Required Phrases (Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. registered trademark, SLA terms"
                      value={ruleFormData.requiredPhrases}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, requiredPhrases: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} color="#6366F1" />
                      <span>Source Reference / Policy Code</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Legal Compliance Manual §4.2"
                      value={ruleFormData.sourceReference}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, sourceReference: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRuleModal(false)}
                  style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gradient-primary btn-sm"
                  disabled={savingRule}
                  style={{ borderRadius: '10px', padding: '8px 24px', fontWeight: 700, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
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
