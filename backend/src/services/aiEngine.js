import { config } from '../config/env.js';

/**
 * Optional AI Provider Adapter
 * Strictly called on the backend only.
 * Safely falls back if keys are absent or API times out.
 */
export async function runAiAssistedChecks({ content, rules = [], facts = [] }) {
  // If no AI key is configured, return gracefully indicating AI is inactive
  if (!config.geminiApiKey && !config.openaiApiKey) {
    return {
      isAiActive: false,
      aiProvider: 'none',
      aiFindings: [],
      note: 'Deterministic rule engine active. No external AI API key configured.',
    };
  }

  const activeRuleTitles = rules.map((r) => ({ id: r._id.toString(), title: r.title, category: r.category, preferred: r.preferredWording }));
  const validRuleIds = new Set(rules.map((r) => r._id.toString()));

  const prompt = `You are a strict brand governance auditor. Analyze the following content against the provided approved brand rules.
Return ONLY valid JSON matching this schema:
{
  "findings": [
    {
      "category": "Tone of voice" | "Terminology" | "Messaging" | "Product naming" | "Promotional claims" | "Approved facts" | "Visual identity" | "Accessibility" | "Required disclaimers",
      "severity": "High" | "Medium" | "Low",
      "textSpan": "exact snippet from the text",
      "explanation": "concise explanation why it violates brand guidelines",
      "suggestedCorrection": "better phrasing preserving intent",
      "matchedRuleId": "optional rule id from the provided list if matched",
      "claimStatus": "Supported by an approved source" | "Potentially inconsistent" | "Needs verification"
    }
  ]
}

Content to review:
"${content.replace(/"/g, '\\"')}"

Active Brand Rules:
${JSON.stringify(activeRuleTitles.slice(0, 15), null, 2)}
`;

  try {
    let rawText = '';
    let providerName = '';

    if (config.geminiApiKey) {
      providerName = 'Google Gemini';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.statusText}`);
      }
      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    } else if (config.openaiApiKey) {
      providerName = 'OpenAI';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }
      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content || '{}';
    }

    const parsed = JSON.parse(rawText);
    const rawFindings = Array.isArray(parsed.findings) ? parsed.findings : [];

    // Sanitize and validate every finding returned by the untrusted model output
    const validatedFindings = rawFindings.map((f) => {
      let startIndex = -1;
      let endIndex = -1;
      if (f.textSpan && typeof f.textSpan === 'string') {
        startIndex = content.indexOf(f.textSpan);
        if (startIndex !== -1) {
          endIndex = startIndex + f.textSpan.length;
        }
      }

      // Check if matchedRuleId is genuine
      const genuineRuleId = f.matchedRuleId && validRuleIds.has(f.matchedRuleId) ? f.matchedRuleId : null;

      return {
        category: f.category || 'Tone of voice',
        severity: ['High', 'Medium', 'Low'].includes(f.severity) ? f.severity : 'Medium',
        textSpan: f.textSpan || '',
        startIndex,
        endIndex,
        explanation: f.explanation || 'AI flagged potential tone or style inconsistency.',
        suggestedCorrection: f.suggestedCorrection || '',
        ruleRef: genuineRuleId,
        claimStatus: ['Supported by an approved source', 'Potentially inconsistent', 'Needs verification'].includes(f.claimStatus)
          ? f.claimStatus
          : 'Potentially inconsistent',
        detectedBy: 'ai-assisted',
        confidenceScore: 88,
        status: 'open',
      };
    });

    return {
      isAiActive: true,
      aiProvider: providerName,
      aiFindings: validatedFindings,
    };
  } catch (error) {
    console.warn(`[AI Engine] Provider call failed or timed out (${error.message}). Falling back to deterministic engine.`);
    return {
      isAiActive: false,
      aiProvider: 'none',
      aiFindings: [],
      error: error.message,
    };
  }
}
