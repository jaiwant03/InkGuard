import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, BookOpen, CheckSquare, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or window dispatch
          window.dispatchEvent(new CustomEvent('inkguard-open-search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.dashboard.search(query.trim());
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results &&
    ((results.drafts && results.drafts.length > 0) ||
      (results.rules && results.rules.length > 0) ||
      (results.facts && results.facts.length > 0));

  const handleSelectDraft = (id) => {
    onClose();
    navigate(`/review/${id}`);
  };

  const handleSelectRule = () => {
    onClose();
    navigate('/guidelines');
  };

  const handleSelectFact = () => {
    onClose();
    navigate('/facts');
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        alignItems: 'flex-start',
        paddingTop: '80px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          background: '#FFFFFF',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            gap: '12px',
            background: '#FFFFFF',
          }}
        >
          {loading ? (
            <Loader2 size={20} className="spin" color="var(--color-primary)" />
          ) : (
            <Search size={20} color="var(--text-tertiary)" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search content drafts, brand guidelines, approved facts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontWeight: 500,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 7px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '16px' }}>
          {!query.trim() && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Sparkles size={28} color="var(--color-primary)" style={{ margin: '0 auto 10px auto', opacity: 0.7 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Quick Brand Intelligence Search
              </p>
              <p style={{ fontSize: '0.8125rem' }}>
                Type to search across submitted content drafts, active guidelines, and verified facts.
              </p>
            </div>
          )}

          {query.trim() && !loading && !hasResults && (
            <div style={{ padding: '36px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                No matching results found
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Try searching by content title, rule name, category, or claim statement.
              </p>
            </div>
          )}

          {hasResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Drafts Section */}
              {results.drafts && results.drafts.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      paddingLeft: '8px',
                    }}
                  >
                    Content Reviews ({results.drafts.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {results.drafts.map((draft) => (
                      <div
                        key={draft._id}
                        onClick={() => handleSelectDraft(draft._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {draft.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              {draft.contentType} • Status: {draft.status}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={15} color="var(--text-tertiary)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules Section */}
              {results.rules && results.rules.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      paddingLeft: '8px',
                    }}
                  >
                    Brand Guidelines & Rules ({results.rules.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {results.rules.map((rule) => (
                      <div
                        key={rule._id}
                        onClick={handleSelectRule}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              background: '#F0FDF4',
                              color: '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {rule.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              Category: {rule.category} • Severity: {rule.severity}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={15} color="var(--text-tertiary)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facts Section */}
              {results.facts && results.facts.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      paddingLeft: '8px',
                    }}
                  >
                    Approved Facts & Sources ({results.facts.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {results.facts.map((fact) => (
                      <div
                        key={fact._id}
                        onClick={handleSelectFact}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              background: '#FAF5FF',
                              color: '#9333EA',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <CheckSquare size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fact.statement}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              Topic: {fact.topic} • Source: {fact.sourceDocument || 'Verified Database'}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={15} color="var(--text-tertiary)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg-surface-secondary)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>Quick actions: Press Esc to exit</span>
          <span>InkGuard Deterministic Search Engine</span>
        </div>
      </div>
    </div>
  );
}
