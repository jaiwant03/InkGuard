/**
 * Deterministic Review Engine
 * Executes exact, explainable, and reproducible brand governance checks
 * based on active BrandRules and ApprovedFacts in the database.
 */

// Common absolute promotional phrases flagged for verification
const PROMOTIONAL_ABSOLUTE_PATTERNS = [
  {
    regex: /\b(100%\s+guaranteed|guaranteed\s+results|fail[- ]proof|100%\s+risk[- ]free)\b/gi,
    severity: 'High',
    category: 'Promotional claims',
    explanation: 'Absolute guarantee claims create legal risk and contradict corporate brand governance guidelines.',
    suggestion: 'Provide verified substantiation or soften to "Engineered for enterprise reliability".',
  },
  {
    regex: /\b(the\s+best\s+in\s+the\s+world|unmatched\s+by\s+anyone|cheapest\s+on\s+the\s+market|infinitely\s+scalable)\b/gi,
    severity: 'Medium',
    category: 'Promotional claims',
    explanation: 'Unqualified superlatives can be flagged as unsubstantiated promotional puffery under advertising standards.',
    suggestion: 'Replace with specific, benchmarked performance metrics.',
  },
  {
    regex: /\b(never\s+fails|zero\s+downtime|unbreakable|hack[- ]proof)\b/gi,
    severity: 'High',
    category: 'Product naming',
    explanation: 'Absolute security or reliability assertions are technically unsupportable and pose compliance liability.',
    suggestion: 'Use approved SLA language, e.g. "designed for 99.99% high-availability".',
  },
];

// Accessibility patterns
const ACCESSIBILITY_PATTERNS = [
  {
    regex: /\b(click\s+here|read\s+more|link)\b(?!\s+(to|for|about))/gi,
    severity: 'Low',
    category: 'Accessibility',
    explanation: 'Non-descriptive call-to-action text impairs screen reader navigation and accessibility compliance (WCAG 2.1).',
    suggestion: 'Use action-oriented descriptive text, e.g. "Review the compliance documentation".',
  },
];

export async function runDeterministicChecks({ content, rules = [], facts = [] }) {
  const findings = [];
  const normalizedContent = content;

  // 1. Check against active brand rules
  for (const rule of rules) {
    if (!rule.isActive) continue;

    // Check prohibited phrases
    if (Array.isArray(rule.prohibitedPhrases) && rule.prohibitedPhrases.length > 0) {
      for (const phrase of rule.prohibitedPhrases) {
        if (!phrase || !phrase.trim()) continue;
        const trimmed = phrase.trim();

        // Escape regex special characters
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

        let match;
        while ((match = regex.exec(normalizedContent)) !== null) {
          findings.push({
            category: rule.category,
            severity: rule.severity || 'Medium',
            textSpan: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            explanation: `Found prohibited phrase "${match[0]}". ${rule.description}`,
            suggestedCorrection: rule.preferredWording || (rule.correctExamples && rule.correctExamples[0]) || '',
            ruleRef: rule._id,
            ruleTitle: rule.title,
            claimStatus: 'Potentially inconsistent',
            detectedBy: 'deterministic',
            confidenceScore: 100,
            status: 'open',
          });
        }
      }
    }

    // Check required phrases (e.g. copyright, required disclaimer, mandatory brand suffix)
    if (Array.isArray(rule.requiredPhrases) && rule.requiredPhrases.length > 0) {
      for (const required of rule.requiredPhrases) {
        if (!required || !required.trim()) continue;
        const trimmed = required.trim();
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');

        if (!regex.test(normalizedContent)) {
          findings.push({
            category: rule.category,
            severity: rule.severity || 'Medium',
            textSpan: '',
            startIndex: -1,
            endIndex: -1,
            explanation: `Missing required brand phrase: "${trimmed}". ${rule.description}`,
            suggestedCorrection: `Include "${trimmed}" in the text.`,
            ruleRef: rule._id,
            ruleTitle: rule.title,
            claimStatus: 'Needs verification',
            detectedBy: 'deterministic',
            confidenceScore: 100,
            status: 'open',
          });
        }
      }
    }
  }

  // 2. Check general absolute promotional claims
  for (const pattern of PROMOTIONAL_ABSOLUTE_PATTERNS) {
    let match;
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(normalizedContent)) !== null) {
      // Avoid duplicate overlapping spans if already found by a custom rule
      const spanExists = findings.some(
        (f) => f.startIndex === match.index && f.endIndex === match.index + match[0].length
      );
      if (!spanExists) {
        findings.push({
          category: pattern.category,
          severity: pattern.severity,
          textSpan: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          explanation: pattern.explanation,
          suggestedCorrection: pattern.suggestion,
          claimStatus: 'Needs verification',
          detectedBy: 'deterministic',
          confidenceScore: 90,
          status: 'open',
        });
      }
    }
  }

  // 3. Accessibility checks
  for (const pattern of ACCESSIBILITY_PATTERNS) {
    let match;
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(normalizedContent)) !== null) {
      const spanExists = findings.some(
        (f) => f.startIndex === match.index && f.endIndex === match.index + match[0].length
      );
      if (!spanExists) {
        findings.push({
          category: pattern.category,
          severity: pattern.severity,
          textSpan: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          explanation: pattern.explanation,
          suggestedCorrection: pattern.suggestion,
          claimStatus: 'Needs verification',
          detectedBy: 'deterministic',
          confidenceScore: 85,
          status: 'open',
        });
      }
    }
  }

  // 4. Shouting check (ALL CAPS words in sequence >= 4 words)
  const shoutingRegex = /\b[A-Z]{3,}(?:\s+[A-Z]{3,}){3,}\b/g;
  let shoutingMatch;
  while ((shoutingMatch = shoutingRegex.exec(normalizedContent)) !== null) {
    findings.push({
      category: 'Tone of voice',
      severity: 'Low',
      textSpan: shoutingMatch[0],
      startIndex: shoutingMatch.index,
      endIndex: shoutingMatch.index + shoutingMatch[0].length,
      explanation: 'Continuous uppercase text appears aggressive ("shouting") and reduces reading speed.',
      suggestedCorrection: shoutingMatch[0].charAt(0).toUpperCase() + shoutingMatch[0].slice(1).toLowerCase(),
      claimStatus: 'Potentially inconsistent',
      detectedBy: 'deterministic',
      confidenceScore: 95,
      status: 'open',
    });
  }

  // 5. Check against approved facts (check for expired facts or mentions)
  for (const fact of facts) {
    if (fact.status === 'expired' || (fact.expiryDate && new Date(fact.expiryDate) < new Date())) {
      // If the content references the expired fact or keywords
      const factSnippet = fact.factText.split(' ').slice(0, 4).join(' ');
      if (factSnippet && factSnippet.length > 10) {
        const escaped = factSnippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const factRegex = new RegExp(escaped, 'i');
        const match = factRegex.exec(normalizedContent);
        if (match) {
          findings.push({
            category: 'Approved facts',
            severity: 'Medium',
            textSpan: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            explanation: `Text references an expired approved fact: "${fact.factText}". The approved window expired on ${new Date(fact.expiryDate).toLocaleDateString()}.`,
            suggestedCorrection: 'Verify updated metrics with product marketing before publication.',
            factRef: fact._id,
            factSource: fact.sourceName,
            claimStatus: 'Needs verification',
            detectedBy: 'deterministic',
            confidenceScore: 90,
            status: 'open',
          });
        }
      }
    }
  }

  return findings;
}
